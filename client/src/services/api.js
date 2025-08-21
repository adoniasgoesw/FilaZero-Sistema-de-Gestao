import axios from 'axios';

// Normaliza a baseURL para sempre apontar para "/api"
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const trimmed = rawBase.replace(/\/+$/, '');
const baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

const api = axios.create({
  baseURL,
});

export default api;