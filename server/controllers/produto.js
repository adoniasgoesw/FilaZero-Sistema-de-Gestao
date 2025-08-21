import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST - Criar novo produto
export const criarProduto = async (req, res) => {
  const {
    estabelecimento_id,
    categoria_id,
    nome,
    descricao,
    valor_venda,
    valor_custo,
    habilitar_estoque,
    quantidade_estoque,
    habilitar_tempo_preparo,
    tempo_preparo,
    cor,
    icone
  } = req.body;

  // Mapeia os nomes para os campos da tabela
  const habilitaEstoque = habilitar_estoque || false;
  const estoqueQtd = quantidade_estoque || 0;
  const habilitaTempoPreparo = habilitar_tempo_preparo || false;
  const tempoPreparoMin = tempo_preparo || 0;

  // Validação dos campos obrigatórios
  if (!estabelecimento_id || !categoria_id || !nome || !valor_venda) {
    return res.status(400).json({ 
      message: 'Preencha todos os campos obrigatórios: estabelecimento_id, categoria_id, nome e valor_venda.' 
    });
  }

  try {
    // Verifica se o produto já existe no estabelecimento
    const existingProduto = await db.query(
      'SELECT * FROM produtos WHERE estabelecimento_id = $1 AND nome = $2',
      [estabelecimento_id, nome.trim()]
    );

    if (existingProduto.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Já existe um produto com este nome no estabelecimento.' 
      });
    }

    // Verifica se o estabelecimento existe
    const estabelecimento = await db.query(
      'SELECT id, nome FROM estabelecimentos WHERE id = $1 AND status = true',
      [estabelecimento_id]
    );

    if (estabelecimento.rows.length === 0) {
      return res.status(404).json({ 
        message: `Estabelecimento com ID ${estabelecimento_id} não encontrado ou inativo.` 
      });
    }

    // Verifica se a categoria existe e pertence ao estabelecimento
    const categoria = await db.query(
      'SELECT id, nome FROM categorias WHERE id = $1 AND estabelecimento_id = $2 AND status = true',
      [categoria_id, estabelecimento_id]
    );

    if (categoria.rows.length === 0) {
      return res.status(404).json({ 
        message: `Categoria com ID ${categoria_id} não encontrada ou não pertence ao estabelecimento.` 
      });
    }

    // Processa a imagem se foi enviada
    let imagem_url = null;
    if (req.file) {
      // Se tem imagem, não pode ter cor e ícone
      if (cor || icone) {
        return res.status(400).json({ 
          message: 'Não é possível salvar imagem junto com cor e ícone. Escolha apenas uma opção.' 
        });
      }
      imagem_url = `/uploads/${req.file.filename}`;
    } else {
      // Se não tem imagem, deve ter cor e ícone
      if (!cor || !icone) {
        return res.status(400).json({ 
          message: 'Se não escolher uma imagem, deve selecionar cor e ícone.' 
        });
      }
    }

    // Validações adicionais
    if (habilitaEstoque && (estoqueQtd === undefined || estoqueQtd < 0)) {
      return res.status(400).json({ 
        message: 'Quantidade de estoque é obrigatória quando o controle de estoque está habilitado.' 
      });
    }

    if (habilitaTempoPreparo && (tempoPreparoMin === undefined || tempoPreparoMin < 0)) {
      return res.status(400).json({ 
        message: 'Tempo de preparo é obrigatório quando o controle de tempo está habilitado.' 
      });
    }

    // Insere o novo produto
    const result = await db.query(
      `INSERT INTO produtos (
        estabelecimento_id,
        categoria_id,
        nome,
        descricao,
        imagem_url,
        cor,
        icone,
        valor_venda,
        valor_custo,
        habilita_estoque,
        estoque_qtd,
        habilita_tempo_preparo,
        tempo_preparo_min,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING id, nome, descricao, imagem_url, cor, icone, valor_venda, valor_custo, 
                habilita_estoque, estoque_qtd, habilita_tempo_preparo, tempo_preparo_min, 
                status, criado_em`,
      [
        estabelecimento_id,
        categoria_id,
        nome.trim(),
        descricao ? descricao.trim() : null,
        imagem_url,
        cor || null,
        icone || null,
        parseFloat(valor_venda),
        valor_custo ? parseFloat(valor_custo) : null,
        habilitaEstoque,
        habilitaEstoque ? parseInt(estoqueQtd) : 0,
        habilitaTempoPreparo,
        habilitaTempoPreparo ? parseInt(tempoPreparoMin) : 0,
        true
      ]
    );

    console.log('Produto criado com sucesso:', result.rows[0].id);

    const novoProduto = result.rows[0];

    return res.status(201).json({
      message: 'Produto criado com sucesso!',
      produto: novoProduto
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    
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
        message: 'Já existe um produto com este nome no estabelecimento.',
        details: error.detail
      });
    }
    
    // Se for erro de foreign key
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Estabelecimento ou categoria inválida.',
        details: error.detail
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno ao criar produto.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET - Listar produtos por estabelecimento
export const listarProdutos = async (req, res) => {
  const { estabelecimento_id } = req.params;

  if (!estabelecimento_id) {
    return res.status(400).json({ 
      message: 'ID do estabelecimento é obrigatório.' 
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        p.id, 
        p.nome, 
        p.descricao, 
        p.imagem_url, 
        p.cor, 
        p.icone, 
        p.valor_venda,
        p.valor_custo,
        p.habilita_estoque as habilitar_estoque,
        p.estoque_qtd as quantidade_estoque,
        p.habilita_tempo_preparo as habilitar_tempo_preparo,
        p.tempo_preparo_min as tempo_preparo,
        p.status, 
        p.criado_em,
        c.nome as categoria_nome,
        c.id as categoria_id
       FROM produtos p
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.estabelecimento_id = $1 
       ORDER BY p.nome`,
      [estabelecimento_id]
    );

    return res.status(200).json({
      produtos: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      where: error.where
    });
    return res.status(500).json({ 
      message: 'Erro interno ao listar produtos.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET - Buscar produto por ID
export const buscarProduto = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      message: 'ID do produto é obrigatório.' 
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        p.id, 
        p.estabelecimento_id,
        p.categoria_id,
        p.nome, 
        p.descricao, 
        p.imagem_url, 
        p.cor, 
        p.icone, 
        p.valor_venda,
        p.valor_custo,
        p.habilita_estoque as habilitar_estoque,
        p.estoque_qtd as quantidade_estoque,
        p.habilita_tempo_preparo as habilitar_tempo_preparo,
        p.tempo_preparo_min as tempo_preparo,
        p.status, 
        p.criado_em,
        c.nome as categoria_nome
       FROM produtos p
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Produto não encontrado.' 
      });
    }

    return res.status(200).json({
      produto: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao buscar produto.' 
    });
  }
};

// PUT - Atualizar produto
export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    descricao,
    categoria_id,
    valor_venda,
    valor_custo,
    habilitar_estoque,
    quantidade_estoque,
    habilitar_tempo_preparo,
    tempo_preparo,
    cor,
    icone,
    status
  } = req.body;

  try {
    // Mapeia os nomes para os campos da tabela
    const habilitaEstoque = habilitar_estoque || false;
    const estoqueQtd = quantidade_estoque || 0;
    const habilitaTempoPreparo = habilitar_tempo_preparo || false;
    const tempoPreparoMin = tempo_preparo || 0;

    // Se estiver atualizando apenas o status
    if (Object.keys(req.body).length === 1 && req.body.hasOwnProperty('status')) {
      console.log('Atualizando apenas o status do produto');
      
      const result = await db.query(
        `UPDATE produtos 
         SET status = $1 
         WHERE id = $2 
         RETURNING id, nome, status`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Produto não encontrado.' 
        });
      }

      const produtoAtualizado = result.rows[0];
      console.log('Status atualizado com sucesso:', produtoAtualizado);

      return res.status(200).json({
        message: `Produto ${status ? 'ativado' : 'desativado'} com sucesso!`,
        produto: produtoAtualizado
      });
    }

    // Atualização completa do produto
    console.log('Fazendo atualização completa do produto');

    // Validação para atualizações completas
    if (!nome || !categoria_id || !valor_venda) {
      return res.status(400).json({ 
        message: 'Nome, categoria e valor de venda são obrigatórios.' 
      });
    }

    // Verifica se o produto existe
    const existingProduto = await db.query(
      'SELECT id, estabelecimento_id, imagem_url FROM produtos WHERE id = $1',
      [id]
    );

    if (existingProduto.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Produto não encontrado.' 
      });
    }

    const produtoAtual = existingProduto.rows[0];

    // Verifica se o nome já está sendo usado por outro produto no mesmo estabelecimento
    const nomeCheck = await db.query(
      'SELECT id FROM produtos WHERE nome = $1 AND estabelecimento_id = $2 AND id != $3',
      [nome, produtoAtual.estabelecimento_id, id]
    );

    if (nomeCheck.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Já existe um produto com este nome no estabelecimento.' 
      });
    }

    // Verifica se a nova categoria pertence ao estabelecimento
    const categoriaCheck = await db.query(
      'SELECT id FROM categorias WHERE id = $1 AND estabelecimento_id = $2 AND status = true',
      [categoria_id, produtoAtual.estabelecimento_id]
    );

    if (categoriaCheck.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Categoria inválida ou não pertence ao estabelecimento.' 
      });
    }

    // Processa a nova imagem se foi enviada
    let imagem_url = produtoAtual.imagem_url;
    if (req.file) {
      // Remove a imagem antiga se existir
      if (produtoAtual.imagem_url) {
        const oldImagePath = path.join(__dirname, '..', produtoAtual.imagem_url.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagem_url = `/uploads/${req.file.filename}`;
      
      // Se tem nova imagem, não pode ter cor e ícone
      if (cor || icone) {
        return res.status(400).json({ 
          message: 'Não é possível salvar imagem junto com cor e ícone. Escolha apenas uma opção.' 
        });
      }
    } else {
      // Se não tem nova imagem, deve ter cor e ícone
      if (!cor || !icone) {
        return res.status(400).json({ 
          message: 'Se não escolher uma imagem, deve selecionar cor e ícone.' 
        });
      }
      // Se tinha imagem antes e agora vai usar cor/ícone, remove a imagem
      if (produtoAtual.imagem_url) {
        const oldImagePath = path.join(__dirname, '..', produtoAtual.imagem_url.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        imagem_url = null;
      }
          }

    // Validações adicionais
    if (habilitaEstoque && (estoqueQtd === undefined || estoqueQtd < 0)) {
      return res.status(400).json({ 
        message: 'Quantidade de estoque é obrigatória quando o controle de estoque está habilitado.' 
      });
    }

    if (habilitaTempoPreparo && (tempoPreparoMin === undefined || tempoPreparoMin < 0)) {
      return res.status(400).json({ 
        message: 'Tempo de preparo é obrigatório quando o controle de tempo está habilitado.' 
      });
    }

    // Atualiza o produto
    const result = await db.query(
      `UPDATE produtos 
       SET 
        nome = $1,
        descricao = $2,
        categoria_id = $3,
        imagem_url = $4,
        cor = $5,
        icone = $6,
        valor_venda = $7,
        valor_custo = $8,
        habilita_estoque = $9,
        estoque_qtd = $10,
        habilita_tempo_preparo = $11,
        tempo_preparo_min = $12,
        status = $13
       WHERE id = $14 
       RETURNING id, nome, descricao, imagem_url, cor, icone, valor_venda, valor_custo,
                habilita_estoque, estoque_qtd, habilita_tempo_preparo, tempo_preparo_min,
                status, criado_em`,
      [
        nome.trim(),
        descricao ? descricao.trim() : null,
        categoria_id,
        imagem_url,
        cor || null,
        icone || null,
        parseFloat(valor_venda),
        valor_custo ? parseFloat(valor_custo) : null,
        habilitaEstoque,
        habilitaEstoque ? parseInt(estoqueQtd) : 0,
        habilitaTempoPreparo,
        habilitaTempoPreparo ? parseInt(tempoPreparoMin) : 0,
        status !== undefined ? status : true,
        id
      ]
    );

    const produtoAtualizado = result.rows[0];

    return res.status(200).json({
      message: 'Produto atualizado com sucesso!',
      produto: produtoAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao atualizar produto.' 
    });
  }
};

// DELETE - Deletar produto (hard delete - remove permanentemente)
export const deletarProduto = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      message: 'ID do produto é obrigatório.' 
    });
  }

  try {
    // Verifica se o produto existe
    const existingProduto = await db.query(
      'SELECT id, nome, imagem_url FROM produtos WHERE id = $1',
      [id]
    );

    if (existingProduto.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Produto não encontrado.' 
      });
    }

    const produto = existingProduto.rows[0];

    // Remove a imagem se existir
    if (produto.imagem_url) {
      const imagePath = path.join(__dirname, '..', produto.imagem_url.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Hard delete - remove o produto permanentemente do banco
    await db.query(
      'DELETE FROM produtos WHERE id = $1',
      [id]
    );

    console.log(`Produto "${produto.nome}" (ID: ${id}) foi excluído permanentemente do banco de dados`);

    return res.status(200).json({
      message: 'Produto excluído permanentemente com sucesso!',
      produtoExcluido: {
        id: produto.id,
        nome: produto.nome
      }
    });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    
    // Se for erro de foreign key, retorna mensagem específica
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Não é possível excluir este produto pois ele possui registros vinculados no sistema.',
        details: 'Remova primeiro todos os registros associados a este produto.'
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno ao excluir produto.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
