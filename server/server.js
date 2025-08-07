// server.js (produção)
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config(); // usa o mesmo .env

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configurado para o frontend da Netlify
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://filazero.netlify.app',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API de produção está rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de produção rodando na porta ${PORT}`);
});
