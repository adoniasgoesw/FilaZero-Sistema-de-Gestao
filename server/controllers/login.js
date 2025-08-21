import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-supersegura';

export const loginUser = async (req, res) => {
  const { cpf, senha } = req.body;

  if (!cpf || !senha) {
    return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
  }

  try {
    const query = 'SELECT * FROM usuarios WHERE cpf = $1';
    const result = await db.query(query, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CPF não cadastrado.' });
    }

    const user = result.rows[0];

    // Verifica se a conta está ativa
    if (!user.status) {
      return res.status(403).json({ 
        message: 'Sua conta está inativa. Entre em contato com o administrador para reativá-la.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign(
      { id: user.id, nome_completo: user.nome_completo, cpf: user.cpf, cargo: user.cargo },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      message: 'Login efetuado com sucesso.',
      user: {
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email,
        whatsapp: user.whatsapp,
        cpf: user.cpf,
        cargo: user.cargo,
        estabelecimento_id: user.estabelecimento_id,
        status: user.status
      },
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};