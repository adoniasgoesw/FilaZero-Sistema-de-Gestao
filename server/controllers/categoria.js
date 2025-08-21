import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST - Criar nova categoria
export const criarCategoria = async (req, res) => {
  const {
    estabelecimento_id,
    nome,
    descricao,
    cor,
    icone
  } = req.body;

  // Validação dos campos obrigatórios
  if (!estabelecimento_id || !nome) {
    return res.status(400).json({ 
      message: 'Preencha todos os campos obrigatórios: estabelecimento_id e nome.' 
    });
  }

  try {
    // Verifica se a categoria já existe no estabelecimento
    const existingCategoria = await db.query(
      'SELECT * FROM categorias WHERE estabelecimento_id = $1 AND nome = $2',
      [estabelecimento_id, nome.trim()]
    );

    if (existingCategoria.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Já existe uma categoria com este nome no estabelecimento.' 
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

    // Insere a nova categoria
    const result = await db.query(
      `INSERT INTO categorias (
        estabelecimento_id, 
        nome, 
        descricao, 
        imagem_url, 
        cor, 
        icone, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, nome, descricao, imagem_url, cor, icone, status, criado_em`,
      [
        estabelecimento_id,
        nome.trim(),
        descricao ? descricao.trim() : null,
        imagem_url,
        cor || null,
        icone || null,
        true
      ]
    );

    console.log('Categoria criada com sucesso:', result.rows[0].id);

    const novaCategoria = result.rows[0];

    return res.status(201).json({
      message: 'Categoria criada com sucesso!',
      categoria: novaCategoria
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    
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
        message: 'Já existe uma categoria com este nome no estabelecimento.',
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
      message: 'Erro interno ao criar categoria.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET - Listar categorias por estabelecimento
export const listarCategorias = async (req, res) => {
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
        nome, 
        descricao, 
        imagem_url, 
        cor, 
        icone, 
        status, 
        criado_em
       FROM categorias 
       WHERE estabelecimento_id = $1 
       ORDER BY nome`,
      [estabelecimento_id]
    );

    return res.status(200).json({
      categorias: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao listar categorias.' 
    });
  }
};

// GET - Buscar categoria por ID
export const buscarCategoria = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      message: 'ID da categoria é obrigatório.' 
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        id, 
        estabelecimento_id,
        nome, 
        descricao, 
        imagem_url, 
        cor, 
        icone, 
        status, 
        criado_em
       FROM categorias 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Categoria não encontrada.' 
      });
    }

    return res.status(200).json({
      categoria: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao buscar categoria.' 
    });
  }
};

// PUT - Atualizar categoria
export const atualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    descricao,
    cor,
    icone,
    status
  } = req.body;

  try {
    // Se estiver atualizando apenas o status
    if (Object.keys(req.body).length === 1 && req.body.hasOwnProperty('status')) {
      console.log('Atualizando apenas o status da categoria');
      
      const result = await db.query(
        `UPDATE categorias 
         SET status = $1 
         WHERE id = $2 
         RETURNING id, nome, descricao, imagem_url, cor, icone, status, criado_em`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Categoria não encontrada.' 
        });
      }

      const categoriaAtualizada = result.rows[0];
      console.log('Status atualizado com sucesso:', categoriaAtualizada);

      return res.status(200).json({
        message: `Categoria ${status ? 'ativada' : 'desativada'} com sucesso!`,
        categoria: categoriaAtualizada
      });
    }

    // Atualização completa da categoria
    console.log('Fazendo atualização completa da categoria');

    // Validação para atualizações completas
    if (!nome) {
      return res.status(400).json({ 
        message: 'Nome é obrigatório.' 
      });
    }

    // Verifica se a categoria existe
    const existingCategoria = await db.query(
      'SELECT id, estabelecimento_id, imagem_url FROM categorias WHERE id = $1',
      [id]
    );

    if (existingCategoria.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Categoria não encontrada.' 
      });
    }

    const categoriaAtual = existingCategoria.rows[0];

    // Verifica se o nome já está sendo usado por outra categoria no mesmo estabelecimento
    const nomeCheck = await db.query(
      'SELECT id FROM categorias WHERE nome = $1 AND estabelecimento_id = $2 AND id != $3',
      [nome, categoriaAtual.estabelecimento_id, id]
    );

    if (nomeCheck.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Já existe uma categoria com este nome no estabelecimento.' 
      });
    }

    // Processa a nova imagem se foi enviada
    let imagem_url = categoriaAtual.imagem_url;
    if (req.file) {
      // Remove a imagem antiga se existir
      if (categoriaAtual.imagem_url) {
        const oldImagePath = path.join(__dirname, '..', categoriaAtual.imagem_url.replace('/uploads/', ''));
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
      if (categoriaAtual.imagem_url) {
        const oldImagePath = path.join(__dirname, '..', categoriaAtual.imagem_url.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        imagem_url = null;
      }
    }

    // Atualiza a categoria
    const result = await db.query(
      `UPDATE categorias 
       SET 
        nome = $1,
        descricao = $2,
        imagem_url = $3,
        cor = $4,
        icone = $5,
        status = $6
       WHERE id = $7 
       RETURNING id, nome, descricao, imagem_url, cor, icone, status, criado_em`,
      [
        nome.trim(),
        descricao ? descricao.trim() : null,
        imagem_url,
        cor || null,
        icone || null,
        status !== undefined ? status : true,
        id
      ]
    );

    const categoriaAtualizada = result.rows[0];

    return res.status(200).json({
      message: 'Categoria atualizada com sucesso!',
      categoria: categoriaAtualizada
    });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao atualizar categoria.' 
    });
  }
};

// DELETE - Deletar categoria (hard delete - remove permanentemente)
export const deletarCategoria = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      message: 'ID da categoria é obrigatório.' 
    });
  }

  try {
    // Verifica se a categoria existe
    const existingCategoria = await db.query(
      'SELECT id, nome, imagem_url FROM categorias WHERE id = $1',
      [id]
    );

    if (existingCategoria.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Categoria não encontrada.' 
      });
    }

    const categoria = existingCategoria.rows[0];

    // Remove a imagem se existir
    if (categoria.imagem_url) {
      const imagePath = path.join(__dirname, '..', categoria.imagem_url.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Hard delete - remove a categoria permanentemente do banco
    await db.query(
      'DELETE FROM categorias WHERE id = $1',
      [id]
    );

    console.log(`Categoria "${categoria.nome}" (ID: ${id}) foi excluída permanentemente do banco de dados`);

    return res.status(200).json({
      message: 'Categoria excluída permanentemente com sucesso!',
      categoriaExcluida: {
        id: categoria.id,
        nome: categoria.nome
      }
    });

  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    
    // Se for erro de foreign key, retorna mensagem específica
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Não é possível excluir esta categoria pois ela possui produtos vinculados.',
        details: 'Remova primeiro todos os produtos associados a esta categoria.'
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno ao excluir categoria.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
