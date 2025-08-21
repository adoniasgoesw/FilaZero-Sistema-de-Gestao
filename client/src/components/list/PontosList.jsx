import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseList from './BaseList.jsx';
import { Clock, User, DollarSign } from 'lucide-react';

const PontosList = () => {
  const navigate = useNavigate();
  const [clickedCard, setClickedCard] = useState(null);

  // Dados mockados para demonstração
  const pontos = [
    {
      id: 1,
      identificacao: 'Mesa 1',
      nome: 'Pedro',
      status: 'ocupada',
      valor: 45.50,
      tempoAbertura: '10:00',
      tempoAtividade: '30 min'
    },
    {
      id: 2,
      identificacao: 'Mesa 2',
      nome: 'Maria',
      status: 'ocupada',
      valor: 78.90,
      tempoAbertura: '09:30',
      tempoAtividade: '60 min'
    },
    {
      id: 3,
      identificacao: 'Mesa 3',
      nome: null,
      status: 'disponivel',
      valor: 0,
      tempoAbertura: null,
      tempoAtividade: null
    },
    {
      id: 4,
      identificacao: 'Comanda 1',
      nome: 'João',
      status: 'aberta',
      valor: 32.75,
      tempoAbertura: '11:15',
      tempoAtividade: '15 min'
    },
    {
      id: 5,
      identificacao: 'Mesa 4',
      nome: 'Ana',
      status: 'ocupada',
      valor: 125.40,
      tempoAbertura: '08:45',
      tempoAtividade: '105 min'
    }
  ];

  const getCardStyle = (status) => {
    switch (status) {
      case 'disponivel':
        return 'bg-white border-gray-200';
      case 'ocupada':
        return 'bg-blue-50 border-blue-200';
      case 'aberta':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'ocupada':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'aberta':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'ocupada':
        return 'Ocupada';
      case 'aberta':
        return 'Aberta';
      default:
        return 'Desconhecido';
    }
  };

  const handleCardClick = (pontoId) => {
    if (clickedCard === pontoId) {
      // Segundo clique - navegar para a página do ponto
      navigate(`/ponto-atendimento/${pontoId}`);
    } else {
      // Primeiro clique - mostrar mensagem
      setClickedCard(pontoId);
      setTimeout(() => setClickedCard(null), 2000); // Remove mensagem após 2 segundos
    }
  };

  return (
    <BaseList title="Mesas">
      {pontos.map((ponto) => (
        <div
          key={ponto.id}
          onClick={() => handleCardClick(ponto.id)}
          className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer relative ${getCardStyle(ponto.status)}`}
        >
          {/* Cabeçalho do card */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg">{ponto.identificacao}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ponto.status)}`}>
              {getStatusText(ponto.status)}
            </span>
          </div>

          {/* Informações do cliente */}
          {ponto.nome && (
            <div className="flex items-center mb-2 sm:mb-3 text-gray-600">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">{ponto.nome}</span>
            </div>
          )}

          {/* Valor total */}
          {ponto.valor > 0 && (
            <div className="flex items-center mb-2 sm:mb-3 text-gray-800">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-600" />
              <span className="font-semibold text-xs sm:text-sm">R$ {ponto.valor.toFixed(2)}</span>
            </div>
          )}

          {/* Tempo de atividade */}
          {ponto.tempoAtividade && (
            <div className="flex items-center text-gray-500">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">{ponto.tempoAbertura} - {ponto.tempoAtividade}</span>
            </div>
          )}

          {/* Card vazio para mesa disponível */}
          {ponto.status === 'disponivel' && (
            <div className="text-center py-2 sm:py-4">
              <div className="text-gray-400 text-xl sm:text-2xl mb-1 sm:mb-2">🪑</div>
              <p className="text-gray-500 text-xs sm:text-sm">Mesa livre</p>
            </div>
          )}

          {/* Mensagem de clique para abrir */}
          {clickedCard === ponto.id && (
            <div className="absolute inset-0 bg-orange-500 bg-opacity-90 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-lg font-semibold mb-1">Clique para abrir</div>
                <div className="text-sm opacity-90">Clique novamente para entrar</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </BaseList>
  );
};

export default PontosList;
