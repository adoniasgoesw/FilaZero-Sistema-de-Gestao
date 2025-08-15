import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configurar pasta uploads para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);

// Log das rotas registradas
console.log('🔗 Rotas registradas:');
console.log('  POST /api/pedidos-ativos');
console.log('  GET /api/pedidos-ativos/:estabelecimento_id/:ponto_id');
console.log('  GET /api/pontos-atendimento-ativos/:estabelecimento_id');
console.log('  POST /api/pedidos-ativos/excluir');
console.log('  POST /api/pontos-atendimento/abrir');
console.log('  POST /api/pontos-atendimento/fechar');
console.log('  GET /api/pontos-atendimento/disponibilidade/:estabelecimento_id/:identificacao_ponto');
console.log('  POST /api/pontos-atendimento/limpar-travados/:estabelecimento_id');
console.log('  POST /api/pontos-atendimento/keep-alive');
console.log('  POST /api/pontos-atendimento/marcar-aberta');

app.get('/', (req, res) => {
  res.send('API está funcionando ✅');
});

// Endpoint de teste para verificar rotas
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    rotas: [
      'POST /api/pedidos-ativos',
      'POST /api/pedidos-ativos/excluir',
      'GET /api/pedidos-ativos/:estabelecimento_id/:ponto_id',
      'GET /api/pontos-atendimento-ativos/:estabelecimento_id',
      'POST /api/pontos-atendimento/abrir',
      'POST /api/pontos-atendimento/fechar',
      'GET /api/pontos-atendimento/disponibilidade/:estabelecimento_id/:identificacao_ponto',
      'POST /api/pontos-atendimento/limpar-travados/:estabelecimento_id',
      'POST /api/pontos-atendimento/keep-alive',
      'POST /api/pontos-atendimento/marcar-aberta'
    ]
  });
});

// Função para inicializar as tabelas do sistema
const initializeTables = async () => {
  try {
    console.log('🔧 Verificando tabelas do sistema...');
    
    // As tabelas já foram criadas pelo usuário, apenas verifica se existem
    const tablesCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'pontos_atendimento_pedidos', 
        'pedidos', 
        'itens_pedido'
      )
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    console.log('📋 Tabelas existentes:', existingTables);
    
    if (existingTables.length >= 3) {
      console.log('✅ Todas as tabelas necessárias já existem');
    } else {
      console.log('⚠️ Algumas tabelas podem estar faltando');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  }
};

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // Inicializa as tabelas após o servidor estar rodando
  await initializeTables();
});
