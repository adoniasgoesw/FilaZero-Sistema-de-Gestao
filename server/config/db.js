import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

// Garante que a connectionString tenha sslmode=require para Neon/serviços que exigem SSL
function normalizeConnectionString(raw) {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    // Se já tiver sslmode, mantém
    if (url.searchParams.has('sslmode')) return raw;
    // Adiciona sslmode=require quando host aparenta ser Neon/Cloud
    const host = url.hostname || '';
    if (/neon|aws|gcp|azure|render|railway|supabase/i.test(host)) {
      url.searchParams.set('sslmode', 'require');
      return url.toString();
    }
  } catch (_) {
    // Se não for URL válida, retorna original
  }
  return raw;
}

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  // Mantém a conexão ativa para evitar encerramento ocioso em provedores serverless
  keepAlive: true,
  // Tempo máximo para estabelecer conexão (aumentado para 30s)
  connectionTimeoutMillis: 30000,
  // Fecha conexões ociosas após 60s (aumentado)
  idleTimeoutMillis: 60000,
  // Limite padrão de conexões simultâneas
  max: 10,
  // Adiciona retry automático
  retryDelay: 1000,
  maxRetries: 3,
});

// Teste de saúde sem vazar cliente do pool
pool
  .query('SELECT 1')
  .then(() => console.log('📦 Conectado ao PostgreSQL com sucesso'))
  .catch((err) => {
    console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
    console.log('💡 Verifique se:');
    console.log('   1. O PostgreSQL está rodando');
    console.log('   2. A variável DATABASE_URL está correta');
    console.log('   3. O banco está acessível');
  });

// Tratamento de erros de conexão
pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err.message);
  if (err.code === 'ECONNRESET') {
    console.log('🔄 Tentando reconectar...');
  }
});

pool.on('connect', () => {
  console.log('🔗 Nova conexão estabelecida');
});

export default pool;
