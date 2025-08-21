import express from 'express';
import {
  criarUsuario,
  listarUsuarios,
  buscarUsuario,
  atualizarUsuario,
  deletarUsuario,
  alterarSenha
} from '../controllers/usuario.js';

const router = express.Router();

// Rotas
// POST - Criar novo usuário
router.post('/', criarUsuario);

// GET - Listar usuários por estabelecimento
router.get('/estabelecimento/:estabelecimento_id', listarUsuarios);

// GET - Buscar usuário por ID
router.get('/:id', buscarUsuario);

// PUT - Atualizar usuário
router.put('/:id', atualizarUsuario);

// DELETE - Deletar usuário
router.delete('/:id', deletarUsuario);

// PUT - Alterar senha do usuário
router.put('/:id/senha', alterarSenha);

export default router;
