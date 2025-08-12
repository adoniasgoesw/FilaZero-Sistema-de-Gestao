import db from '../config/db.js';
import path from 'path';
import fs from 'fs';

// Listar produtos por estabelecimento
export const getProdutos = async (req, res) => {
  const { id_estabelecimento } = req.params;

  if (!id_estabelecimento) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }

  try {
    const query = `
      SELECT 
        p.id_produto,
        p.id_estabelecimento,
        p.id_categoria,
        p.nome_produto,
        p.imagem_produto,
        p.valor_venda,
        p.valor_custo,
        p.lucro,
        p.codigo_pdv,
        p.habilita_estoque,
        p.estoque_qtd,
        p.habilita_tempo_preparo,
        p.tempo_preparo_min,
        p.data_criacao,
        p.data_atualizacao,
        c.nome as categoria_nome
      FROM produtos p
      JOIN categorias c ON c.id = p.id_categoria
      WHERE p.id_estabelecimento = $1
      ORDER BY p.nome_produto
    `;

    const result = await db.query(query, [id_estabelecimento]);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const produtos = result.rows.map((row) => {
      if (row.imagem_produto && row.imagem_produto.startsWith('/uploads')) {
        return { ...row, imagem_produto: `${baseUrl}${row.imagem_produto}` };
      }
      return row;
    });

    return res.status(200).json({ produtos });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar produtos.' });
  }
};

// Criar produto
export const createProduto = async (req, res) => {
  const {
    id_estabelecimento,
    id_categoria,
    nome_produto,
    valor_venda,
    valor_custo,
    codigo_pdv,
    habilita_estoque,
    estoque_qtd,
    habilita_tempo_preparo,
    tempo_preparo_min,
  } = req.body;
  const imagem = req.file;

  if (!id_estabelecimento || !id_categoria || !nome_produto || !valor_venda || !valor_custo) {
    return res.status(400).json({ message: 'Campos obrigatórios: estabelecimento, categoria, nome, valor_venda, valor_custo.' });
  }

  try {
    // Valida categoria pertence ao estabelecimento
    const catCheck = await db.query(
      'SELECT id FROM categorias WHERE id = $1 AND estabelecimento_id = $2',
      [id_categoria, id_estabelecimento]
    );
    if (catCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Categoria inválida para este estabelecimento.' });
    }

    let imagem_produto = null;
    if (imagem) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'produtos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const ext = path.extname(imagem.originalname);
      const fileName = `produto_${timestamp}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, imagem.buffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imagem_produto = `${baseUrl}/uploads/produtos/${fileName}`;
    }

    // Normaliza booleanos e números
    const toBool = (v) => (typeof v === 'boolean' ? v : String(v).toLowerCase() === 'true');
    const toInt = (v) => (v === undefined || v === null || v === '' ? null : parseInt(v, 10));
    const toNum = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

    const result = await db.query(
      `INSERT INTO produtos (
        id_estabelecimento,
        id_categoria,
        nome_produto,
        imagem_produto,
        valor_venda,
        valor_custo,
        codigo_pdv,
        habilita_estoque,
        estoque_qtd,
        habilita_tempo_preparo,
        tempo_preparo_min
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        toInt(id_estabelecimento),
        toInt(id_categoria),
        nome_produto.trim(),
        imagem_produto,
        toNum(valor_venda),
        toNum(valor_custo),
        codigo_pdv || null,
        toBool(habilita_estoque),
        toInt(estoque_qtd),
        toBool(habilita_tempo_preparo),
        toInt(tempo_preparo_min),
      ]
    );

    return res.status(201).json({
      message: 'Produto criado com sucesso.',
      produto: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ message: 'Erro interno ao criar produto.' });
  }
};


