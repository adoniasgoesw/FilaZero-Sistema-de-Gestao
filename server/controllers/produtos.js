import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');

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
      const uploadsDir = path.join(serverRoot, 'uploads', 'produtos');
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



// Atualizar produto
export const updateProduto = async (req, res) => {
  const { id_produto } = req.params;
  const imagem = req.file;

  if (!id_produto) {
    return res.status(400).json({ message: 'ID do produto é obrigatório.' });
  }

  try {
    // Buscar produto existente
    const produtoResult = await db.query('SELECT * FROM produtos WHERE id_produto = $1', [id_produto]);
    if (produtoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const produtoAtual = produtoResult.rows[0];

    // Normalizadores
    const toBool = (v, fallback) => (v === undefined || v === null || v === '' ? fallback : (typeof v === 'boolean' ? v : String(v).toLowerCase() === 'true'));
    const toInt = (v, fallback) => (v === undefined || v === null || v === '' ? fallback : parseInt(v, 10));
    const toNum = (v, fallback) => (v === undefined || v === null || v === '' ? fallback : Number(v));

    // Campos do corpo (opcionais)
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
    } = req.body || {};

    // Determinar valores finais
    const novoIdEstabelecimento = toInt(id_estabelecimento, produtoAtual.id_estabelecimento);
    const novoIdCategoria = toInt(id_categoria, produtoAtual.id_categoria);
    const novoNome = nome_produto !== undefined ? String(nome_produto).trim() : produtoAtual.nome_produto;
    const novoValorVenda = toNum(valor_venda, produtoAtual.valor_venda);
    const novoValorCusto = toNum(valor_custo, produtoAtual.valor_custo);
    const novoCodigoPdv = codigo_pdv !== undefined && codigo_pdv !== '' ? codigo_pdv : produtoAtual.codigo_pdv;
    const novoHabilitaEstoque = toBool(habilita_estoque, produtoAtual.habilita_estoque);
    const novoEstoqueQtd = toInt(estoque_qtd, produtoAtual.estoque_qtd);
    const novoHabilitaTempoPreparo = toBool(habilita_tempo_preparo, produtoAtual.habilita_tempo_preparo);
    const novoTempoPreparoMin = toInt(tempo_preparo_min, produtoAtual.tempo_preparo_min);

    // Se categoria/estabelecimento mudou, validar
    if (novoIdCategoria !== produtoAtual.id_categoria || novoIdEstabelecimento !== produtoAtual.id_estabelecimento) {
      const catCheck = await db.query(
        'SELECT id FROM categorias WHERE id = $1 AND estabelecimento_id = $2',
        [novoIdCategoria, novoIdEstabelecimento]
      );
      if (catCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Categoria inválida para este estabelecimento.' });
      }
    }

    // Tratar imagem (se enviada)
    let novaImagemUrl = produtoAtual.imagem_produto;
    if (imagem) {
      const uploadsDir = path.join(serverRoot, 'uploads', 'produtos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Remover imagem antiga se existir
      if (produtoAtual.imagem_produto) {
        try {
          const maybeUrl = new URL(produtoAtual.imagem_produto, `${req.protocol}://${req.get('host')}`);
          const pathname = maybeUrl.pathname.startsWith('/') ? maybeUrl.pathname.slice(1) : maybeUrl.pathname;
          const oldImagePath = path.join(serverRoot, pathname);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (_) {
          const rel = produtoAtual.imagem_produto.startsWith('/') ? produtoAtual.imagem_produto.slice(1) : produtoAtual.imagem_produto;
          const oldImagePath = path.join(serverRoot, rel);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const timestamp = Date.now();
      const ext = path.extname(imagem.originalname);
      const fileName = `produto_${timestamp}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, imagem.buffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      novaImagemUrl = `${baseUrl}/uploads/produtos/${fileName}`;
    }

    // Atualizar produto
    const updateResult = await db.query(
      `UPDATE produtos
       SET id_estabelecimento = $1,
           id_categoria = $2,
           nome_produto = $3,
           imagem_produto = $4,
           valor_venda = $5,
           valor_custo = $6,
           codigo_pdv = $7,
           habilita_estoque = $8,
           estoque_qtd = $9,
           habilita_tempo_preparo = $10,
           tempo_preparo_min = $11,
           data_atualizacao = NOW()
       WHERE id_produto = $12
       RETURNING *`,
      [
        novoIdEstabelecimento,
        novoIdCategoria,
        novoNome,
        novaImagemUrl,
        novoValorVenda,
        novoValorCusto,
        novoCodigoPdv,
        novoHabilitaEstoque,
        novoEstoqueQtd,
        novoHabilitaTempoPreparo,
        novoTempoPreparoMin,
        id_produto,
      ]
    );

    return res.status(200).json({
      message: 'Produto atualizado com sucesso.',
      produto: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar produto.' });
  }
};

// Deletar produto
export const deleteProduto = async (req, res) => {
  const { id_produto } = req.params;

  if (!id_produto) {
    return res.status(400).json({ message: 'ID do produto é obrigatório.' });
  }

  try {
    // Verificar se o produto existe
    const produtoResult = await db.query('SELECT * FROM produtos WHERE id_produto = $1', [id_produto]);
    if (produtoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const produto = produtoResult.rows[0];

    // Remover imagem se existir
    if (produto.imagem_produto) {
      try {
        const maybeUrl = new URL(produto.imagem_produto, `${req.protocol}://${req.get('host')}`);
        const pathname = maybeUrl.pathname.startsWith('/') ? maybeUrl.pathname.slice(1) : maybeUrl.pathname;
        const imagePath = path.join(serverRoot, pathname);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (_) {
        const rel = produto.imagem_produto.startsWith('/') ? produto.imagem_produto.slice(1) : produto.imagem_produto;
        const imagePath = path.join(serverRoot, rel);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Deletar produto do banco
    await db.query('DELETE FROM produtos WHERE id_produto = $1', [id_produto]);

    return res.status(200).json({ message: 'Produto deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar produto.' });
  }
};

