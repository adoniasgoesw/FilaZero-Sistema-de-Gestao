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
  // Tempo máximo para estabelecer conexão
  connectionTimeoutMillis: 5000,
  // Fecha conexões ociosas após 30s (o pool reabre sob demanda)
  idleTimeoutMillis: 30000,
  // Limite padrão de conexões simultâneas
  max: 10,
});

// Teste de saúde sem vazar cliente do pool
pool
  .query('SELECT 1')
  .then(() => console.log('📦 Conectado ao PostgreSQL com sucesso'))
  .catch((err) => console.error('Erro ao conectar no PostgreSQL:', err));

export default pool;
