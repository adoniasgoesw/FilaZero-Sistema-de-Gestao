import React, { useState } from 'react';
import ModalBase from '../modals/Base.jsx';
import Loading from '../elements/Loading';
import api from '../../services/api';

const setores = [
  'Pizzaria', 'Hamburgueria', 'Cafeteria', 'Sorveteria',
  'Restaurante', 'Bar', 'Padaria', 'Mercado', 'Delivery',
];

const FormRegister = ({ isOpen, onClose, onSwitchToLogin }) => {
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [userData, setUserData] = useState({
    nome_completo: '',
    email: '',
    whatsapp: '',
    estabelecimento_nome: '',
    estabelecimento_cnpj: '',
    estabelecimento_setor: '',
    cpf: '',
    senha: '',
  });

  const handleChange = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep = () => {
    // Aqui você pode colocar validações específicas por passo se quiser
    return true;
  };

  const next = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateStep()) {
      setErrorMessage('Preencha todos os campos corretamente.');
      setLoadingStatus('error');
      return;
    }
  
    setLoadingStatus('loading');
    setErrorMessage('');
  
    try {
      await api.post('/register', userData);
  
      setLoadingStatus('success');
  
      // Removido o alert do navegador aqui!
      setTimeout(() => {
        setStep(1);
        setUserData({
          nome_completo: '',
          email: '',
          whatsapp: '',
          estabelecimento_nome: '',
          estabelecimento_cnpj: '',
          estabelecimento_setor: '',
          cpf: '',
          senha: '',
        });
        setLoadingStatus(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setLoadingStatus('error');
      setErrorMessage(
        error.response?.data?.message ||
        'Erro ao registrar. Verifique os dados e tente novamente.'
      );
    }
  };
  

  const progress = (step / totalSteps) * 100;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
            <span>Etapa 1</span>
            <span>Etapa 2</span>
            <span>Etapa 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1A99BA] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-[#1A99BA]">Dados do Usuário</h2>
              <input
                name="nome_completo"
                type="text"
                placeholder="Nome completo"
                value={userData.nome_completo}
                onChange={handleChange}
                className="input"
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                value={userData.email}
                onChange={handleChange}
                className="input"
              />
              <input
                name="whatsapp"
                type="text"
                placeholder="WhatsApp"
                value={userData.whatsapp}
                onChange={handleChange}
                className="input"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-[#1A99BA]">Dados do Estabelecimento</h2>
              <input
                name="estabelecimento_nome"
                type="text"
                placeholder="Nome do estabelecimento"
                value={userData.estabelecimento_nome}
                onChange={handleChange}
                className="input"
              />
              <input
                name="estabelecimento_cnpj"
                type="text"
                placeholder="CNPJ"
                value={userData.estabelecimento_cnpj}
                onChange={handleChange}
                className="input"
              />
              <select
                name="estabelecimento_setor"
                value={userData.estabelecimento_setor}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecione o setor</option>
                {setores.map((setor, idx) => (
                  <option key={idx} value={setor}>
                    {setor}
                  </option>
                ))}
              </select>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-[#1A99BA]">Dados de Acesso</h2>
              <input
                name="cpf"
                type="text"
                placeholder="CPF"
                value={userData.cpf}
                onChange={handleChange}
                className="input"
              />
              <input
                name="senha"
                type="password"
                placeholder="Senha"
                value={userData.senha}
                onChange={handleChange}
                className="input"
              />
              <button
                type="submit"
                disabled={loadingStatus === 'loading'}
                className="btn-primary mt-2"
              >
                Registrar
              </button>
            </>
          )}

          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          <div className="flex justify-between items-center mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                className="text-sm text-gray-600 hover:underline"
              >
                ← Voltar
              </button>
            ) : (
              <span />
            )}

            {step < totalSteps && (
              <button
                type="button"
                onClick={() => {
                  if (validateStep()) next();
                }}
                className="btn-secondary"
              >
                Próximo →
              </button>
            )}
          </div>
        </form>

        {loadingStatus && (
          <Loading
            status={loadingStatus}
            message={
              loadingStatus === 'success'
                ? 'Cadastro realizado com sucesso!'
                : errorMessage
            }
          />
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Já possui conta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#1A99BA] hover:underline"
          >
            Acessar
          </button>
        </p>
      </div>
    </ModalBase>
  );
};

export default FormRegister;