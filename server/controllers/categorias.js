import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve raiz do servidor para unificar diretório de uploads em dev e prod
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');

// Buscar todas as categorias de um estabelecimento
export const getCategorias = async (req, res) => {
  const { estabelecimento_id } = req.params;

  if (!estabelecimento_id) {
    return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM categorias WHERE estabelecimento_id = $1 ORDER BY nome',
      [estabelecimento_id]
    );

    // Garante URL absoluta para imagens ao retornar
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const categoriasComUrl = result.rows.map((row) => {
      if (row.imagem_url && row.imagem_url.startsWith('/uploads')) {
        return { ...row, imagem_url: `${baseUrl}${row.imagem_url}` };
      }
      return row;
    });

    return res.status(200).json({
      categorias: categoriasComUrl,
      total: categoriasComUrl.length
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar categorias.' });
  }
};

// Criar nova categoria
export const createCategoria = async (req, res) => {
  const { estabelecimento_id, nome } = req.body;
  const imagem = req.file;



  if (!estabelecimento_id || !nome) {
    return res.status(400).json({ message: 'Estabelecimento ID e nome são obrigatórios.' });
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

    // Verificar se já existe uma categoria com o mesmo nome no estabelecimento
    const categoriaExistente = await db.query(
      'SELECT id FROM categorias WHERE estabelecimento_id = $1 AND LOWER(nome) = LOWER($2)',
      [estabelecimento_id, nome.trim()]
    );

    if (categoriaExistente.rows.length > 0) {
      return res.status(409).json({ message: 'Já existe uma categoria com este nome.' });
    }

    let imagem_url = null;

    // Processar upload da imagem se existir
    if (imagem) {
      const uploadsDir = path.join(serverRoot, 'uploads', 'categorias');
      
      // Criar diretório se não existir
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileExtension = path.extname(imagem.originalname);
      const fileName = `categoria_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Salvar arquivo
      fs.writeFileSync(filePath, imagem.buffer);
      
      // URL completa para acesso
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imagem_url = `${baseUrl}/uploads/categorias/${fileName}`;
    }

    // Inserir categoria no banco
    const result = await db.query(
      `INSERT INTO categorias (estabelecimento_id, nome, imagem_url)
       VALUES ($1, $2, $3)
       RETURNING id, nome, imagem_url, criado_em`,
      [estabelecimento_id, nome.trim(), imagem_url]
    );

    return res.status(201).json({
      message: 'Categoria criada com sucesso.',
      categoria: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({ message: 'Erro interno ao criar categoria.' });
  }
};

// Atualizar categoria
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const imagem = req.file;

  if (!id || !nome) {
    return res.status(400).json({ message: 'ID e nome são obrigatórios.' });
  }

  try {
    // Verificar se a categoria existe
    const categoriaExistente = await db.query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const categoria = categoriaExistente.rows[0];

    // Verificar se já existe outra categoria com o mesmo nome no estabelecimento
    const nomeDuplicado = await db.query(
      'SELECT id FROM categorias WHERE estabelecimento_id = $1 AND LOWER(nome) = LOWER($2) AND id != $3',
      [categoria.estabelecimento_id, nome.trim(), id]
    );

    if (nomeDuplicado.rows.length > 0) {
      return res.status(409).json({ message: 'Já existe uma categoria com este nome.' });
    }

    let imagem_url = categoria.imagem_url;

    // Processar nova imagem se fornecida
    if (imagem) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'categorias');
      
      // Criar diretório se não existir
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Remover imagem antiga se existir (suporta URL absoluta ou relativa)
      if (categoria.imagem_url) {
        try {
          const maybeUrl = new URL(categoria.imagem_url, `${req.protocol}://${req.get('host')}`);
          const pathname = maybeUrl.pathname.startsWith('/') ? maybeUrl.pathname.slice(1) : maybeUrl.pathname;
          const oldImagePath = path.join(serverRoot, pathname);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (_) {
          const rel = categoria.imagem_url.startsWith('/') ? categoria.imagem_url.slice(1) : categoria.imagem_url;
          const oldImagePath = path.join(serverRoot, rel);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      // Gerar nome único para o novo arquivo
      const timestamp = Date.now();
      const fileExtension = path.extname(imagem.originalname);
      const fileName = `categoria_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Salvar novo arquivo
      fs.writeFileSync(filePath, imagem.buffer);
      
      // URL completa para acesso
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imagem_url = `${baseUrl}/uploads/categorias/${fileName}`;
    }

    // Atualizar categoria no banco
    const result = await db.query(
      `UPDATE categorias 
       SET nome = $1, imagem_url = $2
       WHERE id = $3
       RETURNING id, nome, imagem_url, criado_em`,
      [nome.trim(), imagem_url, id]
    );

    return res.status(200).json({
      message: 'Categoria atualizada com sucesso.',
      categoria: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar categoria.' });
  }
};

// Deletar categoria
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID da categoria é obrigatório.' });
  }

  try {
    // Verificar se a categoria existe
    const categoriaExistente = await db.query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const categoria = categoriaExistente.rows[0];

    // Remover imagem se existir (suporta URL absoluta ou relativa)
    if (categoria.imagem_url) {
      try {
        const maybeUrl = new URL(categoria.imagem_url, `${req.protocol}://${req.get('host')}`);
        const pathname = maybeUrl.pathname.startsWith('/') ? maybeUrl.pathname.slice(1) : maybeUrl.pathname;
        const imagePath = path.join(serverRoot, pathname);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (_) {
        const rel = categoria.imagem_url.startsWith('/') ? categoria.imagem_url.slice(1) : categoria.imagem_url;
        const imagePath = path.join(serverRoot, rel);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Deletar categoria do banco
    await db.query('DELETE FROM categorias WHERE id = $1', [id]);

    return res.status(200).json({
      message: 'Categoria deletada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar categoria.' });
  }
};
