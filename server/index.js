import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('API está funcionando ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
