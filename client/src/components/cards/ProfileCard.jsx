import React, { useState, useEffect } from 'react';
import { LogOut, Building2, User, CreditCard, Users, Tag, Package, Receipt, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const ProfileCard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [estabelecimentoData, setEstabelecimentoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário e estabelecimento ao montar o componente
  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      setLoading(true);
      
      // Pega dados do usuário logado do localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      
      if (!user.id || !estabelecimentoId) {
        console.error('Usuário não está logado ou dados incompletos');
        setLoading(false);
        return;
      }

      // Busca dados atualizados do usuário
      const userResponse = await api.get(`/usuarios/${user.id}`);
      const userData = userResponse.data.usuario;
      setUserData(userData);

      // Busca dados do estabelecimento
      const estabelecimentoResponse = await api.get(`/estabelecimentos/${estabelecimentoId}`);
      const estabelecimentoData = estabelecimentoResponse.data.estabelecimento;
      setEstabelecimentoData(estabelecimentoData);

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Em caso de erro, usa dados do localStorage como fallback
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      // Limpa todos os dados do localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('estabelecimentoId');
      localStorage.removeItem('token');
      
      // Redireciona para a página raiz (LandPage)
      navigate('/');
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Dados de fallback caso não consiga carregar
  const user = userData || JSON.parse(localStorage.getItem('user') || '{}');
  const estabelecimento = estabelecimentoData?.nome || 'Nome não disponível';

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Layout horizontal: Logo à esquerda, dados à direita */}
      <div className="flex items-start gap-4 mb-4">
        {/* Logo do Sistema - Canto superior esquerdo */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">
            {estabelecimento.substring(0, 2).toUpperCase()}
          </span>
        </div>
        
        {/* Dados do usuário e estabelecimento - Alinhados à direita da logo */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            {/* Nome do Estabelecimento */}
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {estabelecimento}
            </p>
            
            {/* Nome do Usuário */}
            <p className="text-base font-semibold text-gray-800 leading-tight">
              {user.nome_completo || user.nome || 'Nome não disponível'}
            </p>
            
            {/* Cargo */}
            <p className="text-sm text-gray-600 leading-tight">
              {user.cargo || 'Cargo não definido'}
            </p>
            
            {/* CPF */}
            <p className="text-sm text-gray-500 leading-tight">
              {user.cpf || 'CPF não disponível'}
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Logout - Embaixo de tudo */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 border border-red-200"
      >
        <LogOut className="h-4 w-4" />
        Sair do Sistema
      </button>
    </div>
  );
};

export default ProfileCard;
