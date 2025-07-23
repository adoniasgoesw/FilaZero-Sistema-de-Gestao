import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import AuthRoutes from './routes/AuthRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Teste de conexão produção
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar na produção:', err);
  } else {
    console.log('Conectado ao banco PRODUÇÃO:', res.rows);
  }
});

// Libera apenas o domínio da produção
app.use(cors({
  origin: 'https://filazero.netlify.app',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', AuthRoutes);

app.get('/', (req, res) => res.send('API Produção rodando 🚀'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor PRODUÇÃO rodando na porta ${PORT}`));