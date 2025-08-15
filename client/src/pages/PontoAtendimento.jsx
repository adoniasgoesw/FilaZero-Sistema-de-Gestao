import React, { useEffect, useState } from "react";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import PainelDetalhes from "../components/details/PainelDetalhes";
import PainelItens from "../components/details/PainelItens";
import PainelHistorico from "../components/details/PainelHistorico";
import api from "../services/api";
import { useStatusPontosAtendimento } from "../hooks/useStatusPontosAtendimento";

const PontoAtendimento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ponto = location.state?.ponto;
  const [blocked, setBlocked] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [pedidoItens, setPedidoItens] = useState([]);
  const [nomePedido, setNomePedido] = useState("");
  const totalItens = pedidoItens.reduce((acc, i) => acc + Number(i.quantidade||0), 0);
  const subtotal = pedidoItens.reduce((sum, i) => sum + Number(i.valor) * Number(i.quantidade), 0);
  
  // Hook para gerenciar status dos pontos de atendimento
  const { fecharPonto } = useStatusPontosAtendimento(Number(localStorage.getItem('estabelecimentoId')));

  // Listener para capturar mudanças no nome do pedido
  useEffect(() => {
    const handler = (event) => {
      setNomePedido(event.detail);
    };
    window.addEventListener('pedido:nome-changed', handler);
    return () => window.removeEventListener('pedido:nome-changed', handler);
  }, []);

  const handleAddProduto = (produto) => {
    setPedidoItens((prev) => {
      const existing = prev.find((i) => i.id === produto.id);
      if (existing) {
        return prev.map((i) => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [
        ...prev,
        { id: produto.id, nome: produto.nome, valor: produto.precoVenda, quantidade: 1 },
      ];
    });
  };

  useEffect(() => {
    // Fecha sidebar ao entrar nesta página
    window.dispatchEvent(new Event('sidebar:close'));
    
    // Carrega dados do pedido existente se houver
    (async () => {
      const id = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!id) return;
      
      try {
        // Verifica caixa
        const caixasRes = await api.get(`/caixas/${id}`);
        const caixas = caixasRes.data.caixas || [];
        const open = caixas.some(c => c.caixa_aberto);
        if (!open) {
          setBlocked(true);
          navigate('/home', { replace: true });
          return;
        }
        
        // Carrega pedido existente se houver
        const pontoId = ponto?.nome || ponto?.ponto?.nome;
        if (pontoId) {
          try {
            const pedidoRes = await api.get(`/pedidos-ativos/${id}/${pontoId}`);
            if (pedidoRes.data.pedido) {
              // Carrega dados do pedido existente
              setNomePedido(pedidoRes.data.pedido.nome_ponto || '');
              
              // Carrega itens do pedido
              const itensMapeados = pedidoRes.data.itens.map(item => ({
                id: item.id_produto,
                nome: item.nome_item,
                valor: Number(item.preco_unitario),
                quantidade: Number(item.quantidade)
              }));
              setPedidoItens(itensMapeados);
            }
          } catch (e) {
            console.log('Nenhum pedido ativo encontrado para este ponto');
          }
        }
      } catch (e) {
        console.error('Erro ao verificar caixa:', e);
      }
    })();
  }, [ponto, navigate]);

  // Função para fechar o ponto de atendimento
  const fecharPontoAtendimento = async () => {
    try {
      const identificacao = ponto?.nome || ponto?.ponto?.nome;
      if (identificacao) {
        await fecharPonto(identificacao);
      }
    } catch (error) {
      console.error('Erro ao fechar ponto de atendimento:', error);
    }
  };

  // Listener para salvar e sair a partir do PainelDetalhes
  useEffect(() => {
    const handler = async () => {
      try {
        const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
        const userId = Number(localStorage.getItem('userId') || localStorage.getItem('usuarioId')) || null;
        if (!estabelecimentoId) { alert('Estabelecimento não definido.'); return; }
        const pontoId = ponto?.id || ponto?.ponto?.id || null;
        if (!pontoId) { alert('Ponto de atendimento não definido.'); return; }
        const cxRes = await api.get(`/caixas/${estabelecimentoId}`);
        const caixas = cxRes.data.caixas || [];
        const cx = caixas.find(c=>c.caixa_aberto);
        if (!cx) { alert('Nenhum caixa aberto.'); return; }
        const subtotal2 = pedidoItens.reduce((sum, i) => sum + Number(i.valor) * Number(i.quantidade), 0);
        await api.post('/pedidos-ativos', {
          estabelecimento_id: estabelecimentoId,
          ponto_atendimento_id: pontoId,
          caixa_id: cx.id,
          cliente_id: null,
          nome_pedido: nomePedido || null,
          valor_total: subtotal2,
          itens: pedidoItens.map(i=>({ id: i.id, nome: i.nome, quantidade: i.quantidade, valor: i.valor })),
          usuarios_id: userId,
          identificacao_ponto: ponto?.nome || ponto?.ponto?.nome || `Ponto ${pontoId}`,
        });
        
        // Fecha o ponto de atendimento antes de sair
        await fecharPontoAtendimento();
        
        // Dispara evento para recarregar dados na Home
        window.dispatchEvent(new Event('pedido:salvo'));
        
        navigate('/home');
      } catch (e) {
        console.error('Erro ao salvar pedido (sair):', e);
        alert('Erro ao salvar pedido.');
      }
    };
    window.addEventListener('pedido:salvar-e-sair', handler);
    return () => window.removeEventListener('pedido:salvar-e-sair', handler);
  }, [pedidoItens, ponto, navigate, nomePedido]);

  // Fecha o ponto de atendimento quando o usuário sair da página
  useEffect(() => {
    return () => {
      // Cleanup function - executa quando o componente é desmontado
      fecharPontoAtendimento();
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-w, 0px)' }}>
        <main className="py-6 px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/* Painel Detalhes - 30% */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[calc(100vh-5rem)]">
              {showHistorico ? (
                <PainelHistorico onVoltar={() => setShowHistorico(false)} />
              ) : (
                <PainelDetalhes
                  ponto={ponto}
                  onVoltar={async () => {
                    await fecharPontoAtendimento();
                    navigate('/home');
                  }}
                  onOpenHistorico={() => setShowHistorico(true)}
                  itens={pedidoItens}
                  nomePedido={nomePedido}
                />
              )}
            </div>
            {/* Painel Itens - 70% */}
            <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[calc(100vh-5rem)] flex flex-col">
              <div className="flex-1 min-h-0">
                <PainelItens onAddProduto={handleAddProduto} />
              </div>
              {/* Footer do Painel Itens (dentro do card, no final) */}
              <div className="pt-3 border-t border-gray-200 mt-3 flex items-center justify-end gap-2">
                {totalItens > 0 && (
                  <button
                    onClick={()=>setPedidoItens([])}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >Cancelar</button>
                )}
                <button
                  disabled={totalItens === 0}
                  onClick={async ()=>{
                    try {
                      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
                      const userId = Number(localStorage.getItem('userId') || localStorage.getItem('usuarioId')) || null;
                      if (!estabelecimentoId) { alert('Estabelecimento não definido.'); return; }
                      const pontoId = ponto?.id || ponto?.ponto?.id || null;
                      if (!pontoId) { alert('Ponto de atendimento não definido.'); return; }
                      // Obter caixa aberto
                      const cxRes = await api.get(`/caixas/${estabelecimentoId}`);
                      const caixas = cxRes.data.caixas || [];
                      const cx = caixas.find(c=>c.caixa_aberto);
                      if (!cx) { alert('Nenhum caixa aberto.'); return; }
                      await api.post('/pedidos-ativos', {
                        estabelecimento_id: estabelecimentoId,
                        ponto_atendimento_id: pontoId,
                        caixa_id: cx.id,
                        cliente_id: null,
                        nome_pedido: nomePedido || null,
                        valor_total: subtotal,
                        itens: pedidoItens.map(i=>({ id: i.id, nome: i.nome, quantidade: i.quantidade, valor: i.valor })),
                        usuarios_id: userId,
                        identificacao_ponto: ponto?.nome || ponto?.ponto?.nome || `Ponto ${pontoId}`,
                      });
                      
                      // Fecha o ponto de atendimento antes de sair
                      await fecharPontoAtendimento();
                      
                      // Dispara evento para recarregar dados na Home
                      window.dispatchEvent(new Event('pedido:salvo'));
                      
                      // volta para home
                      navigate('/home');
                    } catch (e) {
                      console.error('Erro ao salvar pedido:', e);
                      alert('Erro ao salvar pedido.');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${totalItens === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1A99BA] hover:bg-[#0f5f73]'} `}
                >Salvar{totalItens > 0 ? ` (${totalItens})` : ''}</button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default PontoAtendimento;



