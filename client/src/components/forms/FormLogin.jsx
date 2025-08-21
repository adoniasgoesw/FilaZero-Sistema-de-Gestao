import React, { useState } from 'react';
import ModalBase from '../modals/Base.jsx';
import Loading from '../elements/Loading';
import api from '../../services/api.js';
import useNotification from '../elements/useNotification.js';
import Notification from '../elements/Notification.jsx';

const FormLogin = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [loadingStatus, setLoadingStatus] = useState(null);
  
  // Hook de notificação
  const { notification, showError, hideNotification } = useNotification();

  const [formData, setFormData] = useState({
    cpf: '',
    senha: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingStatus('loading');
  
    try {
      const response = await api.post('/login', formData);
  
      const { user } = response.data; // pegando o objeto user retornado
      if (user) {
        // Salvar dados no localStorage
        localStorage.setItem('userId', user.id);
        localStorage.setItem('estabelecimentoId', user.estabelecimento_id);
        // Cache completo do usuário (nome, cargo, etc.)
        localStorage.setItem('user', JSON.stringify(user));
      }
  
      setLoadingStatus('success');
  
      onClose();
      setFormData({ cpf: '', senha: '' });
  
      // Redirecionar para Home
      window.location.href = '/home';
    } catch (error) {
      setLoadingStatus('error');
      
      if (error.response?.data?.message) {
        // Verifica se é erro de conta inativa
        if (error.response.data.message.includes('conta está inativa')) {
          showError(
            'Conta Inativa',
            'Sua conta está inativa. Entre em contato com o administrador para reativá-la.',
            0 // Não fecha automaticamente
          );
        } else {
          showError(
            'Erro no Login',
            error.response.data.message,
            5000 // Fecha em 5 segundos
          );
        }
      } else {
        showError(
          'Erro no Login',
          'Erro de conexão. Verifique sua internet ou backend.',
          5000
        );
      }
    }
  };
  

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-[#1A99BA]">Login</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="cpf"
            type="text"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1A99BA]"
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1A99BA]"
          />
          <button
            type="submit"
            disabled={loadingStatus === 'loading'}
            className="bg-[#1A99BA] text-white px-4 py-2 rounded-md hover:bg-[#187d9e] transition"
          >
            Acessar
          </button>
        </form>

        {loadingStatus && (
          <Loading
            status={loadingStatus}
            message={
              loadingStatus === 'loading' ? 'Carregando...' : 'Login realizado com sucesso!'
            }
          />
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Não possui conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loadingStatus === 'loading'}
            className="text-[#1A99BA] hover:underline"
          >
            Criar conta
          </button>
        </p>
      </div>
      
      {/* Sistema de Notificação */}
      <Notification
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
        showButtons={notification.showButtons}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        type={notification.type}
      />
    </ModalBase>
  );
};

export default FormLogin;