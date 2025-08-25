import axios from 'axios';

// Detecta automaticamente o ambiente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isNetlify = window.location.hostname.includes('netlify.app');

// Configura a URL base baseada no ambiente
let baseURL;
if (isDevelopment) {
  // Desenvolvimento local
  baseURL = 'http://localhost:3001/api';
} else if (isNetlify) {
  // Produção no Netlify - usar Render
  baseURL = 'https://filazero-sistema-de-gestao.onrender.com/api';
} else {
  // Fallback para produção
  baseURL = import.meta.env.VITE_API_URL || 'https://filazero-sistema-de-gestao.onrender.com/api';
}

console.log('🌍 Ambiente detectado:', isDevelopment ? 'Desenvolvimento' : 'Produção');
console.log('🔗 URL da API:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para logs em desenvolvimento
if (isDevelopment) {
  api.interceptors.request.use(request => {
    console.log('🚀 Requisição:', request.method?.toUpperCase(), request.url);
    return request;
  });
  
  api.interceptors.response.use(
    response => {
      console.log('✅ Resposta:', response.status, response.config.url);
      return response;
    },
    error => {
      console.error('❌ Erro na API:', error.response?.status, error.config?.url, error.message);
      return Promise.reject(error);
    }
  );
}

export default api;