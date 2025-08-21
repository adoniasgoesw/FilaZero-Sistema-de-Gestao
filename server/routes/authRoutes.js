import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { register } from '../controllers/register.js';
import { loginUser } from '../controllers/login.js';
import {
  criarUsuario,
  listarUsuarios,
  buscarUsuario,
  atualizarUsuario,
  deletarUsuario,
  alterarSenha
} from '../controllers/usuario.js';
import {
  criarCategoria,
  listarCategorias,
  buscarCategoria,
  atualizarCategoria,
  deletarCategoria
} from '../controllers/categoria.js';
import {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  deletarProduto
} from '../controllers/produto.js';
import {
  listarEstabelecimentos,
  buscarEstabelecimento,
  criarEstabelecimento,
  atualizarEstabelecimento,
  deletarEstabelecimento
} from '../controllers/estabelecimento.js';

const router = express.Router();

// Configuração do multer para uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ===== ROTAS DE AUTENTICAÇÃO =====
router.post('/login', loginUser);
router.post('/register', register);

// ===== ROTAS DE USUÁRIOS =====
router.post('/usuarios', criarUsuario);
router.get('/usuarios/estabelecimento/:estabelecimento_id', listarUsuarios);
router.get('/usuarios/:id', buscarUsuario);
router.put('/usuarios/:id', atualizarUsuario);
router.delete('/usuarios/:id', deletarUsuario);
router.put('/usuarios/:id/senha', alterarSenha);

// ===== ROTAS DE CATEGORIAS =====
router.post('/categorias', upload.single('imagem'), criarCategoria);
router.get('/categorias/estabelecimento/:estabelecimento_id', listarCategorias);
router.get('/categorias/:id', buscarCategoria);
router.put('/categorias/:id', upload.single('imagem'), atualizarCategoria);
router.delete('/categorias/:id', deletarCategoria);

// ===== ROTAS DE PRODUTOS =====
router.post('/produtos', upload.single('imagem'), criarProduto);
router.get('/produtos/estabelecimento/:estabelecimento_id', listarProdutos);
router.get('/produtos/:id', buscarProduto);
router.put('/produtos/:id', upload.single('imagem'), atualizarProduto);
router.delete('/produtos/:id', deletarProduto);

// ===== ROTAS DE ESTABELECIMENTOS =====
router.get('/estabelecimentos', listarEstabelecimentos);
router.get('/estabelecimentos/:id', buscarEstabelecimento);
router.post('/estabelecimentos', criarEstabelecimento);
router.put('/estabelecimentos/:id', atualizarEstabelecimento);
router.delete('/estabelecimentos/:id', deletarEstabelecimento);

export default router;
