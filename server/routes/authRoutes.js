import express from 'express';
import multer from 'multer';
import { register } from '../controllers/register.js';
import { loginUser } from '../controllers/login.js';
import { getUserDetails } from '../controllers/userDetails.js';
import { 
  getCategorias, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria 
} from '../controllers/categorias.js';
import { 
  getProdutos,
  createProduto,
  updateProduto,
  deleteProduto
} from '../controllers/produtos.js';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuarios.js';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../controllers/clientes.js';
import {
  getFormasPagamento,
  createFormaPagamento,
  updateFormaPagamento,
  deleteFormaPagamento,
} from '../controllers/formasPagamento.js';
import {
  getPontosAtendimento,
  upsertPontosAtendimento,
} from '../controllers/pontosAtendimento.js';

const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verificar se é uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas.'), false);
    }
  },
});

// Rotas de autenticação
router.post('/login', loginUser);
router.post('/register', register);
router.get('/user-details/:userId', getUserDetails);

// Rotas de categorias
router.get('/categorias/:estabelecimento_id', getCategorias);
router.post('/categorias', upload.single('imagem'), createCategoria);
router.put('/categorias/:id', upload.single('imagem'), updateCategoria);
router.delete('/categorias/:id', deleteCategoria);

// Rotas de produtos
router.get('/produtos/:id_estabelecimento', getProdutos);
router.post('/produtos', upload.single('imagem'), createProduto);
router.put('/produtos/:id_produto', upload.single('imagem'), updateProduto);
router.delete('/produtos/:id_produto', deleteProduto);

// Rotas de usuários
router.get('/usuarios/:estabelecimento_id', getUsuarios);
router.post('/usuarios', createUsuario);
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);

// Rotas de clientes
router.get('/clientes/:estabelecimento_id', getClientes);
router.post('/clientes', createCliente);
router.put('/clientes/:id', updateCliente);
router.delete('/clientes/:id', deleteCliente);

// Pontos de atendimento (config + listagem derivada)
router.get('/pontos-atendimento/:estabelecimento_id', getPontosAtendimento);
router.put('/pontos-atendimento/:estabelecimento_id', upsertPontosAtendimento);

// Formas de pagamento
router.get('/formas-pagamento/:estabelecimento_id', getFormasPagamento);
router.post('/formas-pagamento', createFormaPagamento);
router.put('/formas-pagamento/:id', updateFormaPagamento);
router.delete('/formas-pagamento/:id', deleteFormaPagamento);

export default router;
