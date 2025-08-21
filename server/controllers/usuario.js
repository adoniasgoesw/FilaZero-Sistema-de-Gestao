import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// POST - Criar novo usuário
export const criarUsuario = async (req, res) => {
  const {
    estabelecimento_id,
    nome_completo,
    email,
    cpf,
    senha,
    whatsapp,
    cargo,
    permissoes
  } = req.body;

  console.log('Dados recebidos para criar usuário:', {
    estabelecimento_id,
    nome_completo,
    email: email ? '***' : null,
    cpf: cpf ? '***' : null,
    senha: senha ? '***' : null,
    cargo,
    permissoes
  });

  // Validação dos campos obrigatórios
  if (!estabelecimento_id || !nome_completo || !cpf || !senha || !cargo) {
    console.error('Campos obrigatórios faltando:', { estabelecimento_id, nome_completo, cpf, senha, cargo });
    return res.status(400).json({ 
      message: 'Preencha todos os campos obrigatórios: estabelecimento_id, nome_completo, cpf, senha e cargo.' 
    });
  }

  try {
    // Verifica se o usuário já existe (CPF ou email)
    const existingUser = await db.query(
      'SELECT * FROM usuarios WHERE cpf = $1 OR (email = $2 AND email IS NOT NULL)',
      [cpf.trim(), email]
    );

    if (existingUser.rows.length > 0) {
      console.error('Usuário já existe:', { cpf: cpf.trim(), email });
      return res.status(409).json({ 
        message: 'CPF ou e-mail já cadastrado no sistema.' 
      });
    }

    // Verifica se o estabelecimento existe
    const estabelecimento = await db.query(
      'SELECT id, nome FROM estabelecimentos WHERE id = $1 AND status = true',
      [estabelecimento_id]
    );

    if (estabelecimento.rows.length === 0) {
      console.error(`Estabelecimento não encontrado: ID ${estabelecimento_id}`);
      return res.status(404).json({ 
        message: `Estabelecimento com ID ${estabelecimento_id} não encontrado ou inativo.` 
      });
    }

    console.log(`Estabelecimento encontrado: ${estabelecimento.rows[0].nome} (ID: ${estabelecimento_id})`);

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Insere o novo usuário
    const result = await db.query(
      `INSERT INTO usuarios (
        estabelecimento_id, 
        nome_completo, 
        email, 
        cpf, 
        senha, 
        whatsapp, 
        cargo, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id, nome_completo, email, cpf, whatsapp, cargo, status, criado_em`,
      [
        estabelecimento_id,
        nome_completo.trim(),
        email ? email.trim() : null,
        cpf.trim(),
        hashedPassword,
        whatsapp ? whatsapp.trim() : null,
        cargo.trim(),
        true
      ]
    );

    console.log('Usuário criado com sucesso:', result.rows[0].id);

    // Se houver permissões, salva em uma tabela separada (opcional)
    if (permissoes && Object.keys(permissoes).length > 0) {
      try {
        // Aqui você pode implementar a lógica para salvar permissões
        // Por exemplo, em uma tabela usuario_permissoes
        console.log('Permissões recebidas:', permissoes);
      } catch (permError) {
        console.warn('Aviso: Não foi possível salvar as permissões:', permError.message);
      }
    }

    const novoUsuario = result.rows[0];

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      usuario: novoUsuario
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    // Se for um erro de constraint do banco, retorna mensagem mais específica
    if (error.code === '23502') {
      const field = error.column;
      return res.status(400).json({ 
        message: `Campo obrigatório não preenchido: ${field}`,
        details: error.detail
      });
    }
    
    // Se for erro de unique constraint
    if (error.code === '23505') {
      return res.status(409).json({ 
        message: 'CPF ou e-mail já cadastrado no sistema.',
        details: error.detail
      });
    }
    
    // Se for erro de foreign key
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Estabelecimento inválido ou não encontrado.',
        details: error.detail
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno ao criar usuário.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET - Listar usuários por estabelecimento
export const listarUsuarios = async (req, res) => {
  const { estabelecimento_id } = req.params;

  if (!estabelecimento_id) {
    return res.status(400).json({ 
      message: 'ID do estabelecimento é obrigatório.' 
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        id, 
        nome_completo, 
        email, 
        cpf, 
        whatsapp, 
        cargo, 
        status, 
        criado_em
       FROM usuarios 
       WHERE estabelecimento_id = $1 
       ORDER BY nome_completo`,
      [estabelecimento_id]
    );

    return res.status(200).json({
      usuarios: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao listar usuários.' 
    });
  }
};

// GET - Buscar usuário por ID
export const buscarUsuario = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      message: 'ID do usuário é obrigatório.' 
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        id, 
        estabelecimento_id,
        nome_completo, 
        email, 
        cpf, 
        whatsapp, 
        cargo, 
        status, 
        criado_em
       FROM usuarios 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado.' 
      });
    }

    return res.status(200).json({
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao buscar usuário.' 
    });
  }
};

// PUT - Atualizar usuário
export const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const {
    nome_completo,
    email,
    whatsapp,
    cargo,
    status
  } = req.body;

  try {
    // Se estiver atualizando apenas o status
    if (Object.keys(req.body).length === 1 && req.body.hasOwnProperty('status')) {
      console.log('Atualizando apenas o status do usuário');
      
      const result = await db.query(
        `UPDATE usuarios 
         SET status = $1 
         WHERE id = $2 
         RETURNING id, nome_completo, email, cpf, whatsapp, cargo, status, criado_em`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Usuário não encontrado.' 
        });
      }

      const usuarioAtualizado = result.rows[0];
      console.log('Status atualizado com sucesso:', usuarioAtualizado);

      return res.status(200).json({
        message: `Usuário ${status ? 'ativado' : 'desativado'} com sucesso!`,
        usuario: usuarioAtualizado
      });
    }

    // Atualização completa do usuário
    console.log('Fazendo atualização completa do usuário');

    // Validação para atualizações completas
    if (!nome_completo || !cargo) {
      return res.status(400).json({ 
        message: 'Nome completo e cargo são obrigatórios.' 
      });
    }

    // Verifica se o usuário existe
    const existingUser = await db.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado.' 
      });
    }

    // Verifica se o email já está sendo usado por outro usuário
    if (email) {
      const emailCheck = await db.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ 
          message: 'E-mail já está sendo usado por outro usuário.' 
        });
      }
    }

    // Atualiza o usuário
    const result = await db.query(
      `UPDATE usuarios 
       SET 
        nome_completo = $1,
        email = $2,
        whatsapp = $3,
        cargo = $4,
        status = $5
       WHERE id = $6 
       RETURNING id, nome_completo, email, cpf, whatsapp, cargo, status, criado_em`,
      [
        nome_completo.trim(),
        email ? email.trim() : null,
        whatsapp ? whatsapp.trim() : null,
        cargo.trim(),
        status !== undefined ? status : true,
        id
      ]
    );

    const usuarioAtualizado = result.rows[0];

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso!',
      usuario: usuarioAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao atualizar usuário.' 
    });
  }
};

// DELETE - Deletar usuário (hard delete - remove permanentemente)
export const deletarUsuario = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      message: 'ID do usuário é obrigatório.' 
    });
  }

  try {
    // Verifica se o usuário existe
    const existingUser = await db.query(
      'SELECT id, nome_completo FROM usuarios WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado.' 
      });
    }

    const usuario = existingUser.rows[0];

    // Hard delete - remove o usuário permanentemente do banco
    await db.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );

    console.log(`Usuário "${usuario.nome_completo}" (ID: ${id}) foi excluído permanentemente do banco de dados`);

    return res.status(200).json({
      message: 'Usuário excluído permanentemente com sucesso!',
      usuarioExcluido: {
        id: usuario.id,
        nome_completo: usuario.nome_completo
      }
    });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    
    // Se for erro de foreign key, retorna mensagem específica
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Não é possível excluir este usuário pois ele possui registros vinculados no sistema.',
        details: 'Remova primeiro todos os registros associados a este usuário.'
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno ao excluir usuário.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PUT - Alterar senha do usuário
export const alterarSenha = async (req, res) => {
  const { id } = req.params;
  const { senha_atual, nova_senha } = req.body;

  if (!id || !senha_atual || !nova_senha) {
    return res.status(400).json({ 
      message: 'ID, senha atual e nova senha são obrigatórios.' 
    });
  }

  try {
    // Busca o usuário com a senha atual
    const result = await db.query(
      'SELECT id, senha FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado.' 
      });
    }

    const usuario = result.rows[0];

    // Verifica se a senha atual está correta
    const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        message: 'Senha atual incorreta.' 
      });
    }

    // Criptografa a nova senha
    const novaSenhaHash = await bcrypt.hash(nova_senha, 10);

    // Atualiza a senha
    await db.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2',
      [novaSenhaHash, id]
    );

    return res.status(200).json({
      message: 'Senha alterada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao alterar senha.' 
    });
  }
};
