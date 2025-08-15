import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useStatusPontosAtendimento = (estabelecimentoId) => {
  const [pontosEmAtendimento, setPontosEmAtendimento] = useState(new Set());

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
        return true;
      }
    } catch (error) {
      if (error.response?.status === 423) {
        // Ponto bloqueado por outro usuário
        throw new Error('Este ponto de atendimento já está sendo usado por outro usuário.');
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
    // Se está em atendimento pelo usuário atual, retorna esse status
    if (pontosEmAtendimento.has(ponto.identificacao)) {
      return 'em_atendimento';
    }

    // Se tem pedido com valor, está ocupada
    if (ponto.valor && ponto.valor > 0) {
      return 'ocupada';
    }

    // Se tem pedido mas sem valor, está aberta
    if (ponto.pedido_id && (!ponto.valor || ponto.valor === 0)) {
      return 'aberto';
    }

    // Padrão: disponível
    return 'Disponível';
  }, [pontosEmAtendimento]);

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
    verificarDisponibilidade,
    getStatusPonto,
    limparPontosEmAtendimento,
    limparStatusTravados,
    isPontoEmAtendimento: (identificacao) => pontosEmAtendimento.has(identificacao)
  };
};
