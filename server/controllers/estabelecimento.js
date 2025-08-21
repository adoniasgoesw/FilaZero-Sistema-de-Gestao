import db from '../config/db.js';

// Listar todos os estabelecimentos
export const listarEstabelecimentos = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, cnpj, setor, plano_atual, status, criado_em FROM estabelecimentos ORDER BY nome'
    );
    
    res.json({
      status: 'success',
      estabelecimentos: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar estabelecimentos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao listar estabelecimentos.'
    });
  }
};

// Buscar estabelecimento por ID
export const buscarEstabelecimento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT id, nome, cnpj, setor, plano_atual, status, criado_em FROM estabelecimentos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Estabelecimento não encontrado.'
      });
    }
    
    res.json({
      status: 'success',
      estabelecimento: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estabelecimento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao buscar estabelecimento.'
    });
  }
};

// Criar novo estabelecimento
export const criarEstabelecimento = async (req, res) => {
  try {
    const { nome, cnpj, setor, plano_atual } = req.body;
    
    if (!nome) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome do estabelecimento é obrigatório.'
      });
    }
    
    const result = await db.query(
      'INSERT INTO estabelecimentos (nome, cnpj, setor, plano_atual) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, cnpj || null, setor || null, plano_atual || 'gratuito']
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Estabelecimento criado com sucesso.',
      estabelecimento: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar estabelecimento:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        status: 'error',
        message: 'CNPJ já cadastrado no sistema.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao criar estabelecimento.'
    });
  }
};

// Atualizar estabelecimento
export const atualizarEstabelecimento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, setor, plano_atual, status } = req.body;
    
    // Verifica se o estabelecimento existe
    const checkResult = await db.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Estabelecimento não encontrado.'
      });
    }
    
    const result = await db.query(
      'UPDATE estabelecimentos SET nome = COALESCE($1, nome), cnpj = COALESCE($2, cnpj), setor = COALESCE($3, setor), plano_atual = COALESCE($4, plano_atual), status = COALESCE($5, status) WHERE id = $6 RETURNING *',
      [nome, cnpj, setor, plano_atual, status, id]
    );
    
    res.json({
      status: 'success',
      message: 'Estabelecimento atualizado com sucesso.',
      estabelecimento: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar estabelecimento:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        status: 'error',
        message: 'CNPJ já cadastrado no sistema.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao atualizar estabelecimento.'
    });
  }
};

// Deletar estabelecimento
export const deletarEstabelecimento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o estabelecimento existe
    const checkResult = await db.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Estabelecimento não encontrado.'
      });
    }
    
    // Verifica se existem usuários vinculados
    const usuariosResult = await db.query(
      'SELECT COUNT(*) FROM usuarios WHERE estabelecimento_id = $1',
      [id]
    );
    
    if (parseInt(usuariosResult.rows[0].count) > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Não é possível deletar um estabelecimento que possui usuários vinculados.'
      });
    }
    
    await db.query('DELETE FROM estabelecimentos WHERE id = $1', [id]);
    
    res.json({
      status: 'success',
      message: 'Estabelecimento deletado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao deletar estabelecimento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao deletar estabelecimento.'
    });
  }
};
