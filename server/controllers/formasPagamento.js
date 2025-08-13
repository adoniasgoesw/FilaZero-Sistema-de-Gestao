import db from '../config/db.js';

// Garante que a tabela exista em ambientes novos
const ensureTableExists = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS formas_pagamento (
      id SERIAL PRIMARY KEY,
      estabelecimento_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      taxa NUMERIC,
      conta_bancaria TEXT,
      data_cadastro TIMESTAMP DEFAULT NOW()
    );
  `);
  // Garante colunas caso a tabela exista com schema antigo
  await db.query(`ALTER TABLE formas_pagamento ADD COLUMN IF NOT EXISTS estabelecimento_id INTEGER`);
  await db.query(`ALTER TABLE formas_pagamento ADD COLUMN IF NOT EXISTS nome TEXT`);
  await db.query(`ALTER TABLE formas_pagamento ADD COLUMN IF NOT EXISTS tipo TEXT`);
  await db.query(`ALTER TABLE formas_pagamento ADD COLUMN IF NOT EXISTS taxa NUMERIC`);
  await db.query(`ALTER TABLE formas_pagamento ADD COLUMN IF NOT EXISTS conta_bancaria TEXT`);
  await db.query(`ALTER TABLE formas_pagamento ADD COLUMN IF NOT EXISTS data_cadastro TIMESTAMP DEFAULT NOW()`);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_formas_pagamento_estabelecimento
    ON formas_pagamento(estabelecimento_id);
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_formas_pagamento_estab_nome_ci
    ON formas_pagamento (estabelecimento_id, LOWER(nome));
  `);
};

// Tenta descobrir os tipos permitidos a partir do CHECK constraint do Postgres
const fetchAllowedTipos = async () => {
  try {
    const result = await db.query(`
      SELECT pg_get_constraintdef(con.oid) AS def
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public'
        AND rel.relname = 'formas_pagamento'
        AND con.contype = 'c'
        AND pg_get_constraintdef(con.oid) ILIKE '%tipo%'
      LIMIT 1;
    `);
    const def = result.rows?.[0]?.def || '';
    // Exemplos de def:
    // CHECK (((tipo)::text = ANY ((ARRAY['Dinheiro'::character varying, 'Débito'::character varying, 'Crédito'::character varying])::text[])))
    // CHECK ((tipo = ANY (ARRAY['DINHEIRO'::text, 'DEBITO'::text, 'CREDITO'::text])))
    const match = def.match(/ARRAY\[(.*?)\]/is);
    if (!match) return ['Dinheiro', 'Débito', 'Crédito'];
    const inner = match[1];
    // Extrai apenas os valores entre aspas simples, ignorando casts como ::text ou ::character varying
    const values = Array.from(inner.matchAll(/'([^']+)'/g)).map((m) => m[1]).filter(Boolean);
    if (values.length === 0) return ['Dinheiro', 'Débito', 'Crédito'];
    return values;
  } catch (_) {
    // Fallback conservador, evitando PIX se o CHECK não permitir
    return ['Dinheiro', 'Débito', 'Crédito'];
  }
};

const buildDefaultFormas = (tiposPermitidos) => tiposPermitidos.map((t) => ({ nome: t, tipo: t }));

const seedDefaultsIfNeeded = async (estabelecimento_id) => {
  await ensureTableExists();
  const allowed = await fetchAllowedTipos();
  const DEFAULT_FORMAS = buildDefaultFormas(allowed);
  const existing = await db.query(
    'SELECT LOWER(nome) AS nome FROM formas_pagamento WHERE estabelecimento_id = $1',
    [estabelecimento_id]
  );
  const existingSet = new Set(existing.rows.map((r) => r.nome));
  const toInsert = DEFAULT_FORMAS.filter((f) => !existingSet.has(f.nome.toLowerCase()));
  for (const f of toInsert) {
    try {
      await db.query(
        `INSERT INTO formas_pagamento (estabelecimento_id, nome, tipo, taxa, conta_bancaria)
         VALUES ($1,$2,$3,$4,$5)`,
        [estabelecimento_id, f.nome, f.tipo, 0.0, null]
      );
    } catch (e) {
      // Ignora violações de constraint (23514) e duplicidade (23505) durante o seed
      if (e?.code !== '23514' && e?.code !== '23505') {
        throw e;
      }
    }
  }
};

export const getFormasPagamento = async (req, res) => {
  const { estabelecimento_id } = req.params;
  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }
  try {
    await ensureTableExists();
    await seedDefaultsIfNeeded(estabelecimento_id);
    const allowed = await fetchAllowedTipos();
    const result = await db.query(
      `SELECT id, estabelecimento_id, nome, tipo, taxa, conta_bancaria, data_cadastro
       FROM formas_pagamento
       WHERE estabelecimento_id = $1
       ORDER BY nome`,
      [estabelecimento_id]
    );
    return res.status(200).json({ formas: result.rows, total: result.rows.length, allowedTipos: allowed });
  } catch (error) {
    console.error('Erro ao listar formas de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno ao listar formas de pagamento.' });
  }
};

export const createFormaPagamento = async (req, res) => {
  const { estabelecimento_id, nome, tipo, taxa, conta_bancaria } = req.body || {};
  if (!estabelecimento_id || !nome || !tipo) {
    return res.status(400).json({ message: 'Campos obrigatórios: estabelecimento_id, nome e tipo.' });
  }
  try {
    await ensureTableExists();
    // Validar tipo permitido contra constraint do banco
    const tiposPermitidos = await fetchAllowedTipos();
    if (!tiposPermitidos.includes(String(tipo).trim())) {
      return res.status(400).json({ message: `Tipo inválido. Permitidos: ${tiposPermitidos.join(', ')}.` });
    }
    // Evitar duplicar defaults pelo mesmo nome
    const exists = await db.query(
      'SELECT id FROM formas_pagamento WHERE estabelecimento_id = $1 AND LOWER(nome) = LOWER($2)',
      [estabelecimento_id, String(nome).trim()]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Já existe uma forma de pagamento com este nome.' });
    }

    const parseTaxa = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
    const result = await db.query(
      `INSERT INTO formas_pagamento (estabelecimento_id, nome, tipo, taxa, conta_bancaria)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, estabelecimento_id, nome, tipo, taxa, conta_bancaria, data_cadastro`,
      [
        Number(estabelecimento_id),
        String(nome).trim(),
        String(tipo).trim(),
        parseTaxa(taxa),
        conta_bancaria || null,
      ]
    );
    return res.status(201).json({ message: 'Forma de pagamento criada com sucesso.', forma: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    if (error?.code === '23514') {
      try {
        const tiposPermitidos = await fetchAllowedTipos();
        return res.status(400).json({ message: `Tipo inválido. Permitidos: ${tiposPermitidos.join(', ')}.` });
      } catch (_) {
        return res.status(400).json({ message: 'Tipo inválido para a forma de pagamento.' });
      }
    }
    if (error?.code === '23505') {
      return res.status(409).json({ message: 'Já existe uma forma de pagamento com este nome.' });
    }
    return res.status(500).json({ message: 'Erro interno ao criar forma de pagamento.' });
  }
};

export const updateFormaPagamento = async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, taxa, conta_bancaria } = req.body || {};
  if (!id) {
    return res.status(400).json({ message: 'ID é obrigatório.' });
  }
  try {
    await ensureTableExists();
    const existente = await db.query('SELECT * FROM formas_pagamento WHERE id = $1', [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: 'Forma de pagamento não encontrada.' });
    }
    const atual = existente.rows[0];
    const novoNome = nome !== undefined ? String(nome).trim() : atual.nome;
    const novoTipo = tipo !== undefined ? String(tipo).trim() : atual.tipo;
    const tiposPermitidos = await fetchAllowedTipos();
    if (novoTipo && !tiposPermitidos.includes(novoTipo)) {
      return res.status(400).json({ message: 'Tipo inválido. Use Dinheiro, Débito, Crédito ou PIX.' });
    }
    const novaTaxa = taxa !== undefined && taxa !== '' ? Number(taxa) : atual.taxa;
    const novaConta = conta_bancaria !== undefined ? (conta_bancaria || null) : atual.conta_bancaria;

    // Verifica duplicidade de nome dentro do estabelecimento
    const dup = await db.query(
      'SELECT id FROM formas_pagamento WHERE estabelecimento_id = $1 AND LOWER(nome) = LOWER($2) AND id != $3',
      [atual.estabelecimento_id, novoNome, id]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ message: 'Já existe uma forma de pagamento com este nome.' });
    }

    const result = await db.query(
      `UPDATE formas_pagamento
       SET nome = $1, tipo = $2, taxa = $3, conta_bancaria = $4
       WHERE id = $5
       RETURNING id, estabelecimento_id, nome, tipo, taxa, conta_bancaria, data_cadastro`,
      [novoNome, novoTipo, novaTaxa, novaConta, id]
    );
    return res.status(200).json({ message: 'Forma de pagamento atualizada com sucesso.', forma: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar forma de pagamento.' });
  }
};

export const deleteFormaPagamento = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID é obrigatório.' });
  }
  try {
    await ensureTableExists();
    const existente = await db.query('SELECT id FROM formas_pagamento WHERE id = $1', [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: 'Forma de pagamento não encontrada.' });
    }
    await db.query('DELETE FROM formas_pagamento WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Forma de pagamento deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar forma de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar forma de pagamento.' });
  }
};


