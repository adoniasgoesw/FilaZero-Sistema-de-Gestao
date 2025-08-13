import db from '../config/db.js';

// Cria tabela e índices se não existirem
const ensureTableExists = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      estabelecimento_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT NOT NULL,
      endereco TEXT,
      telefone TEXT,
      email TEXT,
      taxa_entrega NUMERIC,
      criado_em TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estabelecimento_id INTEGER`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nome TEXT`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS endereco TEXT`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefone TEXT`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email TEXT`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS taxa_entrega NUMERIC`);
  await db.query(`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT NOW()`);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_clientes_estabelecimento
    ON clientes(estabelecimento_id);
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_clientes_estab_cpf_cnpj
    ON clientes (estabelecimento_id, cpf_cnpj);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_clientes_email_ci
    ON clientes (LOWER(email));
  `);
};

export const getClientes = async (req, res) => {
  const { estabelecimento_id } = req.params;
  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }
  try {
    await ensureTableExists();
    const result = await db.query(
      `SELECT id, estabelecimento_id, nome, cpf_cnpj, endereco, telefone, email, taxa_entrega, criado_em
       FROM clientes
       WHERE estabelecimento_id = $1
       ORDER BY nome`,
      [estabelecimento_id]
    );
    return res.status(200).json({ clientes: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return res.status(500).json({ message: 'Erro interno ao listar clientes.' });
  }
};

export const createCliente = async (req, res) => {
  const { estabelecimento_id, nome, cpf_cnpj, endereco, telefone, email, taxa_entrega } = req.body || {};
  if (!estabelecimento_id || !nome || !cpf_cnpj) {
    return res.status(400).json({ message: 'Campos obrigatórios: estabelecimento_id, nome e cpf_cnpj.' });
  }
  try {
    await ensureTableExists();
    // Unicidade por estabelecimento
    const dup = await db.query(
      'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND cpf_cnpj = $2',
      [estabelecimento_id, String(cpf_cnpj).trim()]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ message: 'CPF/CNPJ já cadastrado para este estabelecimento.' });
    }

    // E-mail opcional: evitar duplicidade se desejar (não bloqueante)
    if (email && email.trim() !== '') {
      const emailDup = await db.query(
        'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND LOWER(email) = LOWER($2)',
        [estabelecimento_id, email.trim()]
      );
      if (emailDup.rows.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado para este estabelecimento.' });
      }
    }

    const parseTaxa = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
    const result = await db.query(
      `INSERT INTO clientes (estabelecimento_id, nome, cpf_cnpj, endereco, telefone, email, taxa_entrega)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, estabelecimento_id, nome, cpf_cnpj, endereco, telefone, email, taxa_entrega, criado_em`,
      [
        Number(estabelecimento_id),
        String(nome).trim(),
        String(cpf_cnpj).trim(),
        endereco ? String(endereco).trim() : null,
        telefone ? String(telefone).trim() : null,
        email ? String(email).trim() : null,
        parseTaxa(taxa_entrega),
      ]
    );
    return res.status(201).json({ message: 'Cliente criado com sucesso.', cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error?.code === '23505') {
      return res.status(409).json({ message: 'Duplicidade de dados para este cliente.' });
    }
    return res.status(500).json({ message: 'Erro interno ao criar cliente.' });
  }
};

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nome, cpf_cnpj, endereco, telefone, email, taxa_entrega } = req.body || {};
  if (!id) {
    return res.status(400).json({ message: 'ID do cliente é obrigatório.' });
  }
  try {
    await ensureTableExists();
    const existente = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    const atual = existente.rows[0];

    const novoNome = nome !== undefined ? String(nome).trim() : atual.nome;
    const novoCpfCnpj = cpf_cnpj !== undefined ? String(cpf_cnpj).trim() : atual.cpf_cnpj;
    const novoEndereco = endereco !== undefined ? (endereco ? String(endereco).trim() : null) : atual.endereco;
    const novoTelefone = telefone !== undefined ? (telefone ? String(telefone).trim() : null) : atual.telefone;
    const novoEmail = email !== undefined ? (email ? String(email).trim() : null) : atual.email;
    const novaTaxa = taxa_entrega !== undefined && taxa_entrega !== '' ? Number(taxa_entrega) : atual.taxa_entrega;

    // Verificar duplicidade de CPF/CNPJ
    if (novoCpfCnpj !== atual.cpf_cnpj) {
      const dup = await db.query(
        'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND cpf_cnpj = $2 AND id != $3',
        [atual.estabelecimento_id, novoCpfCnpj, id]
      );
      if (dup.rows.length > 0) {
        return res.status(409).json({ message: 'CPF/CNPJ já cadastrado para este estabelecimento.' });
      }
    }

    // Verificar duplicidade de e-mail
    if (novoEmail && novoEmail !== atual.email) {
      const emailDup = await db.query(
        'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND LOWER(email) = LOWER($2) AND id != $3',
        [atual.estabelecimento_id, novoEmail, id]
      );
      if (emailDup.rows.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado para este estabelecimento.' });
      }
    }

    const result = await db.query(
      `UPDATE clientes
       SET nome = $1, cpf_cnpj = $2, endereco = $3, telefone = $4, email = $5, taxa_entrega = $6
       WHERE id = $7
       RETURNING id, estabelecimento_id, nome, cpf_cnpj, endereco, telefone, email, taxa_entrega, criado_em`,
      [novoNome, novoCpfCnpj, novoEndereco, novoTelefone, novoEmail, novaTaxa, id]
    );
    return res.status(200).json({ message: 'Cliente atualizado com sucesso.', cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar cliente.' });
  }
};

export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID do cliente é obrigatório.' });
  }
  try {
    await ensureTableExists();
    const existente = await db.query('SELECT id FROM clientes WHERE id = $1', [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    await db.query('DELETE FROM clientes WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Cliente deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar cliente.' });
  }
};


