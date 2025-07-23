import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import AuthRoutes from './routes/AuthRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Teste de conexão local
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar localmente:', err);
  } else {
    console.log('Conectado ao banco local:', res.rows);
  }
});

app.use(cors()); // sem restrição para dev
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', AuthRoutes);

app.get('/', (req, res) => res.send('API Local rodando 🚀'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor DEV rodando na porta ${PORT}`));
