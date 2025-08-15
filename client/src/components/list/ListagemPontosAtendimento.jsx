import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/formatTime';
import { useStatusPontosAtendimento } from '../../hooks/useStatusPontosAtendimento';

const ListagemPontosAtendimento = ({ pontos, estabelecimentoId, onOpen }) => {
  const navigate = useNavigate();
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [mostrarToque, setMostrarToque] = useState(false);
  
  // Hook para gerenciar status dos pontos de atendimento
  const {
    pontosEmAtendimento,
    abrirPonto,
    fecharPonto,
    marcarPontoComoAberta,
    getStatusPonto,
    isPontoEmAtendimento,
    limparStatusTravados,
    statusAtualizados
  } = useStatusPontosAtendimento(estabelecimentoId);







  // Calcula tempo de atividade para todos os pontos de uma vez
  const temposAtividade = {};
  pontos.forEach(ponto => {
    if (ponto.criado_em) {
      const agora = new Date();
      const criado = new Date(ponto.criado_em);
      const diffMs = agora - criado;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      
      if (diffMin < 1) {
        temposAtividade[ponto.id] = 'Agora';
      } else if (diffMin < 60) {
        temposAtividade[ponto.id] = `${diffMin}min`;
      } else {
        const horas = Math.floor(diffMin / 60);
        const min = diffMin % 60;
        temposAtividade[ponto.id] = `${horas}h ${min}min`;
      }
    } else {
      temposAtividade[ponto.id] = '0min';
    }
  });

  // Atualiza tempos a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      pontos.forEach(ponto => {
        if (ponto.criado_em) {
          const agora = new Date();
          const criado = new Date(ponto.criado_em);
          const diffMs = agora - criado;
          const diffMin = Math.floor(diffMs / (1000 * 60));
          
          if (diffMin < 1) {
            temposAtividade[ponto.id] = 'Agora';
          } else if (diffMin < 60) {
            temposAtividade[ponto.id] = `${diffMin}min`;
          } else {
            const horas = Math.floor(diffMin / 60);
            const min = diffMin % 60;
            temposAtividade[ponto.id] = `${horas}h ${min}min`;
          }
        } else {
          temposAtividade[ponto.id] = '0min';
        }
      });
      setMostrarToque(prev => !prev); // Força re-render
    }, 60000);

    return () => clearInterval(interval);
  }, [pontos]);

  // Força re-render quando statusAtualizados muda
  useEffect(() => {
    console.log('🔄 statusAtualizados mudou, forçando re-render:', statusAtualizados);
    setMostrarToque(prev => !prev); // Força re-render
  }, [statusAtualizados]);

  // Primeiro clique
  const handlePrimeiroClique = (ponto) => {
    setPontoSelecionado(ponto);
    setMostrarToque(true);
    setTimeout(() => {
      setMostrarToque(false);
      setPontoSelecionado(null);
    }, 3000);
  };

  // Segundo clique (abrir)
  const handleSegundoClique = async (ponto) => {
    if (pontoSelecionado && pontoSelecionado.id === ponto.id) {
      // Verifica se o ponto está disponível
      const statusAtual = getStatusPonto(ponto);
      
      if (statusAtual === 'em_atendimento') {
        // Se já está em atendimento pelo usuário atual, permite acesso
        if (isPontoEmAtendimento(ponto.identificacao)) {
          if (onOpen) {
            onOpen(ponto);
          } else {
            navigate(`/ponto-atendimento`, { state: { ponto } });
          }
        } else {
          alert('Este ponto de atendimento já está sendo usado em outra tela/dispositivo.');
        }
        return;
      }

      // Se está disponível, marca como "Aberta" e depois abre
      if (statusAtual === 'Disponível') {
        try {
          // Primeiro marca como "Aberta"
          await marcarPontoComoAberta(ponto.identificacao);
          
          // Depois abre o ponto (em atendimento)
          const aberto = await abrirPonto(ponto.identificacao);
          if (aberto) {
            // Se conseguiu abrir, navega para o ponto
            if (onOpen) {
              onOpen(ponto);
            } else {
              navigate(`/ponto-atendimento`, { state: { ponto } });
            }
          }
        } catch (error) {
          alert(error.message);
        }
        return;
      }

      // Se está aberto, permite acesso direto (sem duplo clique)
      if (statusAtual === 'aberto') {
        if (onOpen) {
          onOpen(ponto);
        } else {
          navigate(`/ponto-atendimento`, { state: { ponto } });
        }
        return;
      }

      // Se está ocupada, permite acesso direto
      if (statusAtual === 'ocupada') {
        if (onOpen) {
          onOpen(ponto);
        } else {
          navigate(`/ponto-atendimento`, { state: { ponto } });
        }
        return;
      }
    }
  };

  // Clique único (controla primeiro/segundo clique)
  const handleClique = (ponto) => {
    if (pontoSelecionado && pontoSelecionado.id === ponto.id) {
      handleSegundoClique(ponto);
    } else {
      handlePrimeiroClique(ponto);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Disponível': 'bg-gray-100 text-gray-700',
      'aberto': 'bg-blue-100 text-blue-700', // Cor azul para "Aberta"
      'ocupada': 'bg-green-100 text-green-700',
      'em_atendimento': 'bg-purple-100 text-purple-700'
    };

    const config = statusConfig[status] || 'bg-gray-100 text-gray-700';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config}`}>
        {status}
      </span>
    );
  };

  const renderCard = (ponto) => {
    const tempoAtividade = temposAtividade[ponto.id] || '0min';
    const statusCalculado = getStatusPonto(ponto);

    return (
      <div
        key={ponto.id}
        className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 relative ${
          pontoSelecionado && pontoSelecionado.id === ponto.id && mostrarToque
            ? 'ring-2 ring-blue-500 ring-opacity-50'
            : ''
        }`}
        onClick={() => handleClique(ponto)}
      >
        {pontoSelecionado && pontoSelecionado.id === ponto.id && mostrarToque && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-lg flex flex-col items-center justify-center z-10">
            <div className="text-blue-600 text-lg font-semibold mb-2">
              👆 Toque para abrir
            </div>
            <div className="text-blue-500 text-sm">
              Clique novamente para acessar
            </div>
          </div>
        )}

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {ponto.identificacao}
            </h3>
            <StatusBadge status={statusCalculado} />
          </div>

          {ponto.nome_pedido && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Pedido:</span>
              <span className="ml-2 font-medium text-gray-800">
                {ponto.nome_pedido}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor total:</span>
              <span className="font-medium text-gray-800">
                R$ {ponto.valor ? ponto.valor.toFixed(2) : '0,00'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Abertura:</span>
              <span className="font-medium text-gray-800">
                {ponto.abertura ? formatTime(ponto.abertura) : '--:--'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Atividade:</span>
              <span className="font-medium text-gray-800">
                {tempoAtividade}
              </span>
            </div>

            {ponto.status_pedido && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status pedido:</span>
                <span className="font-medium text-gray-800">
                  {ponto.status_pedido}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {ponto.tipo}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!pontos || pontos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum ponto de atendimento configurado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 max-w-full">
      {pontos.map(renderCard)}
    </div>
  );
};

export default ListagemPontosAtendimento;
