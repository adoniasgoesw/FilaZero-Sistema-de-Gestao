import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Registro: cria estabelecimento e usuário vinculando o estabelecimento
export const register = async (req, res) => {
  const {
    nome_completo,
    email,
    cpf,
    senha,
    whatsapp,
    estabelecimento_nome,
    estabelecimento_cnpj,
    estabelecimento_setor,
  } = req.body;

  if (
    !nome_completo ||
    !email ||
    !cpf ||
    !senha ||
    !estabelecimento_nome
  ) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    // Verifica usuário
    const existingUser = await db.query(
      'SELECT * FROM usuarios WHERE cpf = $1 OR email = $2',
      [cpf, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'CPF ou e-mail já cadastrado.' });
    }

    // Limpa nome para busca (trim e lowercase)
    const estabelecimentoNomeLimpo = estabelecimento_nome.trim().toLowerCase();

    // Busca estabelecimento pelo nome (usando ILIKE para ignorar case)
    const existingEstabelecimento = await db.query(
      'SELECT * FROM estabelecimentos WHERE LOWER(nome) = $1',
      [estabelecimentoNomeLimpo]
    );

    let estabelecimento_id;

    if (existingEstabelecimento.rows.length > 0) {
      estabelecimento_id = existingEstabelecimento.rows[0].id;
    } else {
      // Cria novo estabelecimento
      const resultEst = await db.query(
        `INSERT INTO estabelecimentos (nome, cnpj, setor)
         VALUES ($1, $2, $3) RETURNING id`,
        [estabelecimento_nome.trim(), estabelecimento_cnpj || null, estabelecimento_setor || null]
      );

      if (!resultEst.rows[0] || !resultEst.rows[0].id) {
        return res.status(500).json({ message: 'Erro ao criar estabelecimento.' });
      }

      estabelecimento_id = resultEst.rows[0].id;
    }

    // Garante que estabelecimento_id está definido
    if (!estabelecimento_id) {
      return res.status(500).json({ message: 'Estabelecimento inválido.' });
    }

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Insere usuário
    const resultUser = await db.query(
      `INSERT INTO usuarios (estabelecimento_id, nome_completo, email, whatsapp, cpf, senha)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nome_completo, email, whatsapp, cpf`,
      [estabelecimento_id, nome_completo.trim(), email.trim(), whatsapp || null, cpf.trim(), hashedPassword]
    );



    return res.status(201).json({
      message: 'Usuário registrado com sucesso.',
      user: resultUser.rows[0],
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    return res.status(500).json({ message: 'Erro interno ao registrar.' });
  }
};