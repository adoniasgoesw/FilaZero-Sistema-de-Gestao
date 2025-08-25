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

// Configuração do CORS para desenvolvimento e produção
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'https://filazero.netlify.app')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração para servir arquivos estáticos (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// TODAS AS ROTAS DA API CONSOLIDADAS NO authRoutes
app.use('/api', authRoutes);

// Rota de teste para desenvolvimento
app.get('/', (req, res) => {
  res.json({ 
    message: 'API FilaZero funcionando!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      categorias: '/api/categorias',
      produtos: '/api/produtos',
      estabelecimentos: '/api/estabelecimentos',
      usuarios: '/api/usuarios'
    }
  });
});

// Endpoint de health check
app.get('/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() as current_time');
    res.json({
      status: 'healthy',
      message: 'API funcionando',
      timestamp: dbTest.rows[0].current_time,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Erro na API',
      error: process.env.NODE_ENV === 'production' ? 'Erro interno' : error.message
    });
  }
});

// Endpoint para testar se as rotas estão funcionando
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Rotas da API funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      categorias: '/api/categorias',
      produtos: '/api/produtos',
      estabelecimentos: '/api/estabelecimentos'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Erro interno' : error.message
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
  console.log(`🚀 Servidor FilaZero rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: ${process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'https://filazero.netlify.app')
    : `http://localhost:${PORT}`}`);
});

export default app;
