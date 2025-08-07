import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log('📦 Conectado ao PostgreSQL da Neon com sucesso'))
  .catch((err) => console.error('Erro ao conectar no PostgreSQL:', err));

export default pool;
