import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  deletarProduto
} from '../controllers/produto.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Gera nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'produto-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Aceita apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Rotas
// POST - Criar novo produto (com upload de imagem opcional)
router.post('/', upload.single('imagem'), criarProduto);

// GET - Listar produtos por estabelecimento
router.get('/estabelecimento/:estabelecimento_id', listarProdutos);

// GET - Buscar produto por ID
router.get('/:id', buscarProduto);

// PUT - Atualizar produto (com upload de imagem opcional)
router.put('/:id', upload.single('imagem'), atualizarProduto);

// DELETE - Deletar produto
router.delete('/:id', deletarProduto);

export default router;
