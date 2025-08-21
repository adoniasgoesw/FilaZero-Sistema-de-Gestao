import express from 'express';
import {
  listarEstabelecimentos,
  buscarEstabelecimento,
  criarEstabelecimento,
  atualizarEstabelecimento,
  deletarEstabelecimento
} from '../controllers/estabelecimento.js';

const router = express.Router();

// Rotas
// GET - Listar todos os estabelecimentos
router.get('/', listarEstabelecimentos);

// GET - Buscar estabelecimento por ID
router.get('/:id', buscarEstabelecimento);

// POST - Criar novo estabelecimento
router.post('/', criarEstabelecimento);

// PUT - Atualizar estabelecimento
router.put('/:id', atualizarEstabelecimento);

// DELETE - Deletar estabelecimento
router.delete('/:id', deletarEstabelecimento);

export default router;
