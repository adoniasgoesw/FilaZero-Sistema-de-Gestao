import db from '../config/db.js';

const ensureTableExists = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS pontos_atendimento (
      id SERIAL PRIMARY KEY,
      estabelecimento_id INTEGER UNIQUE NOT NULL,
      atendimento_mesas BOOLEAN DEFAULT false,
      atendimento_comandas BOOLEAN DEFAULT false,
      quantidade_mesas INTEGER DEFAULT 0,
      quantidade_comandas INTEGER DEFAULT 0,
      prefixo_comanda VARCHAR(20),
      atualizado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS estabelecimento_id INTEGER`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS atendimento_mesas BOOLEAN DEFAULT false`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS atendimento_comandas BOOLEAN DEFAULT false`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS quantidade_mesas INTEGER DEFAULT 0`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS quantidade_comandas INTEGER DEFAULT 0`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS prefixo_comanda VARCHAR(20)`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`);
  await db.query(`ALTER TABLE pontos_atendimento ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pontos_atend_estab
    ON pontos_atendimento (estabelecimento_id);
  `);
};

const seedDefaultIfNeeded = async (estabelecimento_id) => {
  await ensureTableExists();
  const res = await db.query('SELECT * FROM pontos_atendimento WHERE estabelecimento_id = $1', [estabelecimento_id]);
  if (res.rows.length === 0) {
    await db.query(
      `INSERT INTO pontos_atendimento (
        estabelecimento_id, atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [estabelecimento_id, true, false, 4, 0, 'CMD']
    );
  }
};

const generatePontosFromConfig = (cfg) => {
  const pontos = [];
  if (cfg.atendimento_mesas) {
    const qty = Number(cfg.quantidade_mesas) || 0;
    for (let i = 1; i <= qty; i += 1) {
      pontos.push({
        id: `mesa-${i}`,
        tipo: 'Mesa',
        nome: `Mesa ${String(i).padStart(2, '0')}`,
        status: 'Disponível',
        valor: 0,
        abertura: null,
      });
    }
  }
  if (cfg.atendimento_comandas) {
    const qty = Number(cfg.quantidade_comandas) || 0;
    const pref = cfg.prefixo_comanda || 'CMD';
    for (let i = 1; i <= qty; i += 1) {
      pontos.push({
        id: `comanda-${i}`,
        tipo: 'Comanda',
        nome: `${pref} ${String(i).padStart(2, '0')}`,
        status: 'Disponível',
        valor: 0,
        abertura: null,
      });
    }
  }
  return pontos;
};

export const getPontosAtendimento = async (req, res) => {
  const { estabelecimento_id } = req.params;
  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }
  try {
    await seedDefaultIfNeeded(estabelecimento_id);
    const cfgRes = await db.query('SELECT * FROM pontos_atendimento WHERE estabelecimento_id = $1', [estabelecimento_id]);
    const cfg = cfgRes.rows[0];
    if (!cfg) {
      return res.status(404).json({ message: 'Configuração não encontrada.' });
    }
    const pontos = generatePontosFromConfig(cfg);
    return res.status(200).json({ config: cfg, pontos, total: pontos.length });
  } catch (error) {
    console.error('Erro ao obter pontos de atendimento:', error);
    return res.status(500).json({ message: 'Erro interno ao obter pontos de atendimento.' });
  }
};

export const upsertPontosAtendimento = async (req, res) => {
  const { estabelecimento_id } = req.params;
  const { atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda } = req.body || {};
  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }
  try {
    await ensureTableExists();
    const atMesas = Boolean(atendimento_mesas);
    const atComandas = Boolean(atendimento_comandas);
    if (!atMesas && !atComandas) {
      return res.status(400).json({ message: 'Ative ao menos Mesas ou Comandas.' });
    }
    const qMesas = atMesas ? Math.max(1, Number(quantidade_mesas) || 0) : 0;
    const qComandas = atComandas ? Math.max(1, Number(quantidade_comandas) || 0) : 0;
    const result = await db.query(
      `INSERT INTO pontos_atendimento (
         estabelecimento_id, atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda, atualizado_em
       ) VALUES ($1,$2,$3,$4,$5,$6, CURRENT_TIMESTAMP)
       ON CONFLICT (estabelecimento_id)
       DO UPDATE SET
         atendimento_mesas = EXCLUDED.atendimento_mesas,
         atendimento_comandas = EXCLUDED.atendimento_comandas,
         quantidade_mesas = EXCLUDED.quantidade_mesas,
         quantidade_comandas = EXCLUDED.quantidade_comandas,
         prefixo_comanda = EXCLUDED.prefixo_comanda,
         atualizado_em = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        Number(estabelecimento_id),
        atMesas,
        atComandas,
        qMesas,
        qComandas,
        prefixo_comanda || null,
      ]
    );
    const cfg = result.rows[0];
    const pontos = generatePontosFromConfig(cfg);
    return res.status(200).json({ message: 'Configuração salva com sucesso.', config: cfg, pontos, total: pontos.length });
  } catch (error) {
    console.error('Erro ao salvar configuração de pontos de atendimento:', error);
    return res.status(500).json({ message: 'Erro interno ao salvar configuração.' });
  }
};


