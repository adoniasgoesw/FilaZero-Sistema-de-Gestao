import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Listar usuários por estabelecimento (sem expor senha)
export const getUsuarios = async (req, res) => {
  const { estabelecimento_id } = req.params;

  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }

  try {
    const result = await db.query(
      `SELECT id, estabelecimento_id, nome_completo, email, whatsapp, cpf, cargo, criado_em
       FROM usuarios
       WHERE estabelecimento_id = $1
       ORDER BY nome_completo`,
      [estabelecimento_id]
    );
    return res.status(200).json({ usuarios: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ message: 'Erro interno ao listar usuários.' });
  }
};

// Criar usuário
export const createUsuario = async (req, res) => {
  const {
    estabelecimento_id,
    nome_completo,
    email,
    whatsapp,
    cpf,
    senha,
    cargo,
  } = req.body || {};

  if (!estabelecimento_id || !nome_completo || !cpf || !senha || !cargo) {
    return res.status(400).json({ message: 'Campos obrigatórios: estabelecimento_id, nome, cpf, senha e cargo.' });
  }

  try {
    // Verificar se o estabelecimento existe
    const estabelecimentoCheck = await db.query(
      'SELECT id FROM estabelecimentos WHERE id = $1',
      [estabelecimento_id]
    );
    if (estabelecimentoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
    }

    // Unicidade de CPF
    const cpfCheck = await db.query('SELECT id FROM usuarios WHERE cpf = $1', [cpf]);
    if (cpfCheck.rows.length > 0) {
      return res.status(409).json({ message: 'CPF já cadastrado.' });
    }

    // Unicidade de email (se enviado)
    if (email) {
      const emailCheck = await db.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado.' });
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(String(senha), 10);

    // Fallback para e-mail opcional em esquemas que exigem NOT NULL
    const emailFinal = email && email.trim() !== '' ? email.trim() : `${cpf}@usuario.local`;

    const result = await db.query(
      `INSERT INTO usuarios (
        estabelecimento_id, nome_completo, email, whatsapp, cpf, senha, cargo
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, estabelecimento_id, nome_completo, email, whatsapp, cpf, cargo, criado_em`,
      [
        estabelecimento_id,
        nome_completo.trim(),
        emailFinal,
        whatsapp || null,
        cpf.trim(),
        senhaHash,
        cargo.trim(),
      ]
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};

// Atualizar usuário (senha opcional)
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const {
    nome_completo,
    email,
    whatsapp,
    cpf,
    senha,
    cargo,
  } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
  }

  try {
    // Verificar existente
    const existente = await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const atual = existente.rows[0];

    // Verificar unicidade se alterar CPF
    if (cpf && cpf.trim() !== atual.cpf) {
      const cpfCheck = await db.query('SELECT id FROM usuarios WHERE cpf = $1 AND id != $2', [cpf.trim(), id]);
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ message: 'CPF já cadastrado.' });
      }
    }

    // Verificar unicidade se alterar e-mail
    if (email && email.trim() !== atual.email) {
      const emailCheck = await db.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1) AND id != $2', [email.trim(), id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado.' });
      }
    }

    // Montar campos
    const novoNome = nome_completo !== undefined ? String(nome_completo).trim() : atual.nome_completo;
    const novoEmail = email !== undefined ? (email.trim() || `${(cpf || atual.cpf).trim()}@usuario.local`) : atual.email;
    const novoWhatsapp = whatsapp !== undefined ? (whatsapp || null) : atual.whatsapp;
    const novoCpf = cpf !== undefined ? cpf.trim() : atual.cpf;
    const novoCargo = cargo !== undefined ? cargo.trim() : atual.cargo;
    const novaSenhaHash = senha ? await bcrypt.hash(String(senha), 10) : atual.senha;

    const result = await db.query(
      `UPDATE usuarios
       SET nome_completo = $1,
           email = $2,
           whatsapp = $3,
           cpf = $4,
           senha = $5,
           cargo = $6
       WHERE id = $7
       RETURNING id, estabelecimento_id, nome_completo, email, whatsapp, cpf, cargo, criado_em`,
      [novoNome, novoEmail, novoWhatsapp, novoCpf, novaSenhaHash, novoCargo, id]
    );

    return res.status(200).json({ message: 'Usuário atualizado com sucesso.', usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
  }
};

// Deletar usuário
export const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
  }

  try {
    const existente = await db.query('SELECT id FROM usuarios WHERE id = $1', [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar usuário.' });
  }
};


