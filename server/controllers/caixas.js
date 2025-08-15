import db from '../config/db.js';

// Listar caixas por estabelecimento
export const getCaixas = async (req, res) => {
  const { estabelecimento_id } = req.params;

  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }

  try {
    const result = await db.query(
      `SELECT id, estabelecimento_id, valor_abertura, valor_fechamento, valor_diferenca,
              valor_total_vendas, caixa_aberto, data_abertura, data_fechamento,
              criado_em, atualizado_em, entradas, saidas
         FROM caixas
        WHERE estabelecimento_id = $1
        ORDER BY data_abertura DESC, id DESC`,
      [estabelecimento_id]
    );

    return res.status(200).json({ caixas: result.rows });
  } catch (error) {
    console.error('Erro ao listar caixas:', error);
    return res.status(500).json({ message: 'Erro interno ao listar caixas.' });
  }
};

// Abrir (criar) um caixa
export const abrirCaixa = async (req, res) => {
  const { estabelecimento_id, valor_abertura } = req.body || {};

  if (!estabelecimento_id || valor_abertura === undefined || valor_abertura === null) {
    return res.status(400).json({ message: 'Campos obrigatórios: estabelecimento_id e valor_abertura.' });
  }

  const toNum = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

  try {
    const result = await db.query(
      `INSERT INTO caixas (
         estabelecimento_id,
         valor_abertura,
         caixa_aberto
       ) VALUES ($1, $2, true)
       RETURNING id, estabelecimento_id, valor_abertura, valor_fechamento, valor_diferenca,
                 valor_total_vendas, caixa_aberto, data_abertura, data_fechamento,
                 criado_em, atualizado_em`,
      [Number(estabelecimento_id), toNum(valor_abertura)]
    );

    return res.status(201).json({
      message: 'Caixa aberto com sucesso.',
      caixa: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao abrir caixa:', error);
    return res.status(500).json({ message: 'Erro interno ao abrir caixa.' });
  }
};

// Fechar um caixa (PUT)
export const fecharCaixa = async (req, res) => {
  const { id } = req.params;
  const { valor_fechamento, valor_total_vendas } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'ID do caixa é obrigatório.' });
  }
  if (valor_fechamento === undefined || valor_fechamento === null) {
    return res.status(400).json({ message: 'valor_fechamento é obrigatório.' });
  }

  const toNum = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

  try {
    // Busca caixa atual
    const current = await db.query('SELECT * FROM caixas WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Caixa não encontrado.' });
    }
    const caixa = current.rows[0];

    const fechamento = toNum(valor_fechamento);
    const totalVendas = toNum(valor_total_vendas) || 0;
    const diferenca = fechamento - Number(caixa.valor_abertura);

    const result = await db.query(
      `UPDATE caixas SET
         valor_fechamento = $1,
         valor_diferenca = $2,
         valor_total_vendas = $3,
         caixa_aberto = false,
         data_fechamento = NOW(),
         atualizado_em = NOW()
       WHERE id = $4
       RETURNING id, estabelecimento_id, valor_abertura, valor_fechamento, valor_diferenca,
                 valor_total_vendas, caixa_aberto, data_abertura, data_fechamento,
                 criado_em, atualizado_em`,
      [fechamento, diferenca, totalVendas, id]
    );

    return res.status(200).json({
      message: 'Caixa fechado com sucesso.',
      caixa: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    return res.status(500).json({ message: 'Erro interno ao fechar caixa.' });
  }
};

// Adicionar entrada ao caixa
export const adicionarEntrada = async (req, res) => {
  const { id } = req.params;
  const { valor } = req.body || {};
  if (!id) return res.status(400).json({ message: 'ID do caixa é obrigatório.' });
  const v = Number(valor);
  if (!Number.isFinite(v) || v <= 0) return res.status(400).json({ message: 'Valor inválido.' });
  try {
    const result = await db.query(
      `UPDATE caixas
         SET entradas = COALESCE(entradas, 0) + $1,
             atualizado_em = NOW()
       WHERE id = $2
       RETURNING id, estabelecimento_id, valor_abertura, valor_fechamento, valor_diferenca,
                 valor_total_vendas, caixa_aberto, data_abertura, data_fechamento,
                 criado_em, atualizado_em, entradas, saidas`,
      [v, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Caixa não encontrado.' });
    return res.status(200).json({ message: 'Entrada adicionada com sucesso.', caixa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar entrada:', error);
    return res.status(500).json({ message: 'Erro interno ao adicionar entrada.' });
  }
};

// Adicionar saída ao caixa
export const adicionarSaida = async (req, res) => {
  const { id } = req.params;
  const { valor } = req.body || {};
  if (!id) return res.status(400).json({ message: 'ID do caixa é obrigatório.' });
  const v = Number(valor);
  if (!Number.isFinite(v) || v <= 0) return res.status(400).json({ message: 'Valor inválido.' });
  try {
    const result = await db.query(
      `UPDATE caixas
         SET saidas = COALESCE(saidas, 0) + $1,
             atualizado_em = NOW()
       WHERE id = $2
       RETURNING id, estabelecimento_id, valor_abertura, valor_fechamento, valor_diferenca,
                 valor_total_vendas, caixa_aberto, data_abertura, data_fechamento,
                 criado_em, atualizado_em, entradas, saidas`,
      [v, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Caixa não encontrado.' });
    return res.status(200).json({ message: 'Saída adicionada com sucesso.', caixa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar saída:', error);
    return res.status(500).json({ message: 'Erro interno ao adicionar saída.' });
  }
};


