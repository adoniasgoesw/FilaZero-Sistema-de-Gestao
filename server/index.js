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

// Configuração do CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração para servir arquivos estáticos (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// TODAS AS ROTAS DA API CONSOLIDADAS NO authRoutes
app.use('/api', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API FilaZero funcionando!' });
});

// Endpoint para testar a conexão com o banco e verificar estabelecimentos
app.get('/test', async (req, res) => {
  try {
    // Testa a conexão com o banco
    const dbTest = await db.query('SELECT NOW() as current_time');
    
    // Verifica se existem estabelecimentos
    const estabelecimentos = await db.query('SELECT id, nome, status FROM estabelecimentos ORDER BY id');
    
    res.json({
      status: 'success',
      message: 'API e banco de dados funcionando',
      timestamp: dbTest.rows[0].current_time,
      estabelecimentos: estabelecimentos.rows,
      total_estabelecimentos: estabelecimentos.rows.length
    });
  } catch (error) {
    console.error('Erro no endpoint de teste:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao conectar com o banco de dados',
      error: error.message
    });
  }
});

// Endpoint simples para testar se as rotas estão funcionando
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Rotas da API funcionando!',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      categorias: '/api/categorias',
      produtos: '/api/produtos',
      estabelecimentos: '/api/estabelecimentos'
    }
  });
});

// Função para inicializar as tabelas do sistema
const initializeTables = async () => {
  try {
    console.log('🔧 Verificando tabelas do sistema...');
    
    // Verifica se as tabelas principais existem
    const tablesCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'estabelecimentos',
        'usuarios',
        'pontos_atendimento_pedidos', 
        'pedidos', 
        'itens_pedido',
        'categorias',
        'produtos'
      )
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    console.log('📋 Tabelas existentes:', existingTables);
    
    // Verifica se as tabelas essenciais existem
    const essentialTables = ['estabelecimentos', 'usuarios', 'categorias', 'produtos'];
    const missingEssential = essentialTables.filter(table => !existingTables.includes(table));
    
    if (missingEssential.length > 0) {
      console.log('⚠️ Tabelas essenciais faltando:', missingEssential);
      console.log('💡 Execute o script check_tables.sql para criar as tabelas necessárias');
    } else {
      console.log('✅ Todas as tabelas essenciais existem');
      
      // Verifica se existem dados de teste
      try {
        const estabelecimentosCount = await db.query('SELECT COUNT(*) FROM estabelecimentos');
        const usuariosCount = await db.query('SELECT COUNT(*) FROM usuarios');
        const categoriasCount = await db.query('SELECT COUNT(*) FROM categorias');
        const produtosCount = await db.query('SELECT COUNT(*) FROM produtos');
        
        console.log(`📊 Estabelecimentos: ${estabelecimentosCount.rows[0].count}`);
        console.log(`👥 Usuários: ${usuariosCount.rows[0].count}`);
        console.log(`🏷️ Categorias: ${categoriasCount.rows[0].count}`);
        console.log(`📦 Produtos: ${produtosCount.rows[0].count}`);
      } catch (countError) {
        console.log('⚠️ Não foi possível contar os registros das tabelas');
      }
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

export default app;