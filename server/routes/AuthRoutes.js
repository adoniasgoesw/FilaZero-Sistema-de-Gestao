import { Router } from 'express';
const router = Router();

// Exemplo de rota
router.get('/ping-db', async (req, res) => {
  try {
    res.send('Rota /ping-db funcionando!');
  } catch (err) {
    res.status(500).send('Erro na rota /ping-db');
  }
});

export default router;