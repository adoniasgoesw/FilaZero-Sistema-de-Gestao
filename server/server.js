import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do CORS para produção
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://filazero.netlify.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração para servir arquivos estáticos (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API - todas consolidadas no authRoutes
app.use('/api', authRoutes);

// Rota de teste para produção
app.get('/', (req, res) => {
  res.json({ 
    message: 'API FilaZero em produção!',
    environment: 'production',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de health check para produção
app.get('/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() as current_time');
    res.json({
      status: 'healthy',
      message: 'API funcionando em produção',
      timestamp: dbTest.rows[0].current_time,
      environment: 'production'
    });
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Erro na API de produção',
      error: process.env.NODE_ENV === 'production' ? 'Erro interno' : error.message
    });
  }
});

// Endpoint simples para testar se as rotas estão funcionando
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Rotas da API funcionando em produção!',
    timestamp: new Date().toISOString(),
    environment: 'production',
    routes: {
      usuarios: '/api/usuarios',
      categorias: '/api/categorias',
      produtos: '/api/produtos',
      estabelecimentos: '/api/estabelecimentos'
    }
  });
});

// Middleware de tratamento de erros para produção
app.use((err, req, res, next) => {
  console.error('Erro na API:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor FilaZero rodando em produção na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 URL: ${process.env.FRONTEND_URL || 'https://filazero.netlify.app'}`);
});

export default app;
