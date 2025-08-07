import React, { useState } from 'react';
import ModalBase from '../modals/Base';
import Loading from '../elements/Loading';
import api from '../../services/api'; // sua instância axios já configurada

const FormLogin = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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
    setErrorMessage(null);

    try {
      const response = await api.post('/login', formData);
      setLoadingStatus('success');
      setErrorMessage(`Bem vindo, ${response.data.user.nome_completo}!`);
      onClose();
      setFormData({ cpf: '', senha: '' });
      // Salve token/user info aqui se precisar
      window.location.href = '/home';
    } catch (error) {
      setLoadingStatus('error');
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Erro desconhecido.');
      } else {
        setErrorMessage('Erro de conexão. Verifique sua internet ou backend.');
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
              errorMessage ||
              (loadingStatus === 'loading' ? 'Carregando...' : 'Login realizado com sucesso!')
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
    </ModalBase>
  );
};

export default FormLogin;
