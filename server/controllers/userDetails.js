import db from '../config/db.js';

export const getUserDetails = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
  }

  try {
    const query = `
      SELECT u.nome_completo, u.cpf, u.cargo, u.estabelecimento_id, e.nome AS estabelecimento_nome
      FROM usuarios u
      JOIN estabelecimentos e ON e.id = u.estabelecimento_id
      WHERE u.id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
