import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useStatusPontosAtendimento = (estabelecimentoId) => {
  const [pontosEmAtendimento, setPontosEmAtendimento] = useState(new Set());
  const [statusAtualizados, setStatusAtualizados] = useState({});

  // Função para marcar um ponto como "Aberta" (após primeiro acesso)
  const marcarPontoComoAberta = useCallback(async (identificacao) => {
    if (!estabelecimentoId) return false;

    try {
      console.log(`🔄 Marcando ponto ${identificacao} como Aberta...`);
      
      const response = await api.post('/pontos-atendimento/marcar-aberta', {
        estabelecimento_id: estabelecimentoId,
        identificacao_ponto: identificacao
      });

      if (response.status === 200) {
        // Atualiza o status em tempo real para "aberto"
        setStatusAtualizados(prev => {
          const novo = {
            ...prev,
            [identificacao]: 'aberto'
          };
          console.log(`📝 Status atualizado para ${identificacao}:`, novo);
          return novo;
        });
        
        // Dispara evento para atualizar outras instâncias
        window.dispatchEvent(new CustomEvent('ponto:status-changed', {
          detail: {
            identificacao,
            status: 'aberto',
            timestamp: response.data.timestamp
          }
        }));
        
        console.log(`✅ Ponto ${identificacao} marcado como Aberta e status atualizado`);
        return true;
      }
    } catch (error) {
      console.error('Erro ao marcar ponto como Aberta:', error);
      throw new Error('Erro ao marcar ponto como Aberta.');
    }
    return false;
  }, [estabelecimentoId]);

  // Função para abrir um ponto de atendimento
  const abrirPonto = useCallback(async (identificacao) => {
    if (!estabelecimentoId) {
      console.error('Estabelecimento não encontrado');
      return false;
    }

    try {
      const response = await api.post('/pontos-atendimento/abrir', {
        estabelecimento_id: estabelecimentoId,
        identificacao_ponto: identificacao
      });

      if (response.status === 200) {
        setPontosEmAtendimento(prev => new Set([...prev, identificacao]));
        // Atualiza o status global para "em_atendimento" usando dados do backend
        setStatusAtualizados(prev => ({
          ...prev,
          [identificacao]: 'em_atendimento'
        }));
        
        // Dispara evento para atualizar outras instâncias
        window.dispatchEvent(new CustomEvent('ponto:status-changed', {
          detail: {
            identificacao,
            status: 'em_atendimento',
            timestamp: response.data.timestamp
          }
        }));
        
        return true;
      }
    } catch (error) {
      if (error.response?.status === 423) {
        // Ponto bloqueado (mesmo usuário ou outro usuário)
        const motivo = error.response?.data?.motivo;
        if (motivo === 'sessao_ativa') {
          throw new Error('Este ponto de atendimento já está sendo usado em outra tela/dispositivo.');
        } else {
          throw new Error('Este ponto de atendimento já está sendo usado por outro usuário.');
        }
      }
      console.error('Erro ao abrir ponto de atendimento:', error);
      throw new Error('Erro ao abrir ponto de atendimento.');
    }
    return false;
  }, [estabelecimentoId]);

  // Função para fechar um ponto de atendimento
  const fecharPonto = useCallback(async (identificacao) => {
    if (!estabelecimentoId) {
      console.error('Estabelecimento não encontrado');
      return false;
    }

    try {
      const response = await api.post('/pontos-atendimento/fechar', {
        estabelecimento_id: estabelecimentoId,
        identificacao_ponto: identificacao
      });

      if (response.status === 200) {
        setPontosEmAtendimento(prev => {
          const novo = new Set(prev);
          novo.delete(identificacao);
          return novo;
        });
        
        // Atualiza o status global com o status retornado pelo backend
        const novoStatus = response.data.novo_status;
        console.log(`🔄 Fechando ponto ${identificacao}, novo status: ${novoStatus}`);
        
        setStatusAtualizados(prev => {
          const novo = {
            ...prev,
            [identificacao]: novoStatus
          };
          console.log(`📝 Status atualizado após fechar ${identificacao}:`, novo);
          return novo;
        });
        
        // Dispara evento para atualizar outras instâncias
        window.dispatchEvent(new CustomEvent('ponto:status-changed', {
          detail: {
            identificacao,
            status: novoStatus,
            timestamp: response.data.timestamp
          }
        }));
        
        console.log(`✅ Ponto ${identificacao} fechado com sucesso, status: ${novoStatus}`);
        return true;
      }
    } catch (error) {
      console.error('Erro ao fechar ponto de atendimento:', error);
      throw new Error('Erro ao fechar ponto de atendimento.');
    }
    return false;
  }, [estabelecimentoId]);

  // Função para verificar se um ponto está disponível
  const verificarDisponibilidade = useCallback(async (identificacao) => {
    if (!estabelecimentoId) return null;

    try {
      const response = await api.get(`/pontos-atendimento/disponibilidade/${estabelecimentoId}/${identificacao}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return null;
    }
  }, [estabelecimentoId]);

  // Função para determinar o status de um ponto
  const getStatusPonto = useCallback((ponto) => {
    console.log(`🔍 getStatusPonto para ${ponto.identificacao}:`, {
      statusAtualizados: statusAtualizados[ponto.identificacao],
      pontosEmAtendimento: pontosEmAtendimento.has(ponto.identificacao),
      valor: ponto.valor,
      pedido_id: ponto.pedido_id
    });
    
    // Se tem status atualizado (em atendimento), retorna esse status
    if (statusAtualizados[ponto.identificacao]) {
      console.log(`✅ Retornando status atualizado: ${statusAtualizados[ponto.identificacao]}`);
      return statusAtualizados[ponto.identificacao];
    }

    // Se está em atendimento pelo usuário atual, retorna esse status
    if (pontosEmAtendimento.has(ponto.identificacao)) {
      console.log(`✅ Retornando em_atendimento`);
      return 'em_atendimento';
    }

    // Se tem pedido com valor, está ocupada
    if (ponto.valor && ponto.valor > 0) {
      console.log(`✅ Retornando ocupada`);
      return 'ocupada';
    }

    // Se tem pedido mas sem valor, está aberta
    if (ponto.pedido_id && (!ponto.valor || ponto.valor === 0)) {
      console.log(`✅ Retornando aberto`);
      return 'aberto';
    }

    // Padrão: disponível
    console.log(`✅ Retornando disponível (padrão)`);
    return 'Disponível';
  }, [pontosEmAtendimento, statusAtualizados]);

  // Função para limpar todos os pontos em atendimento (útil para logout)
  const limparPontosEmAtendimento = useCallback(() => {
    setPontosEmAtendimento(new Set());
  }, []);

  // Atualiza o status dos pontos a cada 15 segundos para detectar timeouts (mais agressivo)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (pontosEmAtendimento.size > 0) {
        const pontosParaVerificar = Array.from(pontosEmAtendimento);
        
        for (const identificacao of pontosParaVerificar) {
          try {
            const disponibilidade = await verificarDisponibilidade(identificacao);
            if (disponibilidade && disponibilidade.status !== 'em_atendimento') {
              // Remove se não está mais em atendimento
              setPontosEmAtendimento(prev => {
                const novo = new Set(prev);
                novo.delete(identificacao);
                return novo;
              });
            }
          } catch (error) {
            console.error(`Erro ao verificar ponto ${identificacao}:`, error);
          }
        }
      }
    }, 15000); // 15 segundos (mais agressivo)

    return () => clearInterval(interval);
  }, [pontosEmAtendimento, verificarDisponibilidade]);

  // Função para manter ponto ativo (heartbeat) - DEVE SER DECLARADA ANTES DOS USEEFFECT
  const manterPontoAtivo = useCallback(async (identificacao) => {
    if (!estabelecimentoId) return false;

    try {
      const response = await api.post('/pontos-atendimento/keep-alive', {
        estabelecimento_id: estabelecimentoId,
        identificacao_ponto: identificacao
      });
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao manter ponto ativo:', error);
      return false;
    }
  }, [estabelecimentoId]);

  // Listener para capturar mudanças de status de outras instâncias
  useEffect(() => {
    const handleStatusChange = (event) => {
      const { identificacao, status, timestamp } = event.detail;
      
      // Atualiza o status global
      setStatusAtualizados(prev => ({
        ...prev,
        [identificacao]: status
      }));
      
      console.log(`🔄 Status atualizado via evento: ${identificacao} -> ${status}`);
    };

    window.addEventListener('ponto:status-changed', handleStatusChange);
    
    return () => {
      window.removeEventListener('ponto:status-changed', handleStatusChange);
    };
  }, []);

  // Sistema de heartbeat para manter pontos ativos
  useEffect(() => {
    if (pontosEmAtendimento.size === 0) return;

    const heartbeatInterval = setInterval(async () => {
      const pontosParaManter = Array.from(pontosEmAtendimento);
      
      for (const identificacao of pontosParaManter) {
        try {
          await manterPontoAtivo(identificacao);
        } catch (error) {
          console.error(`Erro no heartbeat para ${identificacao}:`, error);
        }
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(heartbeatInterval);
  }, [pontosEmAtendimento, manterPontoAtivo]);

  // Função para limpar status travados (útil para debug)
  const limparStatusTravados = useCallback(async () => {
    if (!estabelecimentoId) return false;

    try {
      const response = await api.post(`/pontos-atendimento/limpar-travados/${estabelecimentoId}`);
      if (response.status === 200) {
        console.log('🧹 Status travados limpos:', response.data);
        // Limpa todos os pontos em atendimento localmente
        setPontosEmAtendimento(new Set());
        return true;
      }
    } catch (error) {
      console.error('Erro ao limpar status travados:', error);
    }
    return false;
  }, [estabelecimentoId]);



  return {
    pontosEmAtendimento,
    abrirPonto,
    fecharPonto,
    marcarPontoComoAberta,
    verificarDisponibilidade,
    getStatusPonto,
    limparPontosEmAtendimento,
    limparStatusTravados,
    manterPontoAtivo,
    statusAtualizados,
    isPontoEmAtendimento: (identificacao) => pontosEmAtendimento.has(identificacao)
  };
};
