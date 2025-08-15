import React, { useState, useEffect } from "react";
import { ArrowLeft, Percent, DollarSign, Utensils, Printer, Trash2, History } from "lucide-react";
import ListagemItens from "../list/ListagemItens";
import ListagemValores from "../list/ListagemValores";
import Notification from "../elements/Notification";

const moeda = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const LinhaValor = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between">
    <div className="text-sm text-gray-600">{label}</div>
    <div className={`text-sm ${strong ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{moeda(value)}</div>
  </div>
);

const PainelDetalhes = ({ ponto, onVoltar, onOpenHistorico, itens = [], nomePedido = "" }) => {
  const [nomePedidoLocal, setNomePedidoLocal] = useState(nomePedido);
  const [showExitNotif, setShowExitNotif] = useState(false);
  const [showDeleteNotif, setShowDeleteNotif] = useState(false);

  // Sincroniza o estado local com a prop recebida
  useEffect(() => {
    setNomePedidoLocal(nomePedido);
  }, [nomePedido]);

  const subtotal = itens.reduce((sum, i) => sum + Number(i.valor) * Number(i.quantidade), 0);
  const desconto = 0;
  const acrescimos = 0;
  const pagos = 0;
  const total = subtotal - desconto + acrescimos;
  const restante = total - pagos;

  // Atualiza o nome do pedido quando mudar
  useEffect(() => {
    const event = new CustomEvent('pedido:nome-changed', { detail: nomePedidoLocal });
    window.dispatchEvent(event);
  }, [nomePedidoLocal]);

  // Função para excluir pedido
  const handleExcluirPedido = async () => {
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) {
        alert('Estabelecimento não definido.');
        return;
      }

      const identificacaoPonto = ponto?.nome || ponto?.ponto?.nome;
      if (!identificacaoPonto) {
        alert('Ponto de atendimento não definido.');
        return;
      }

      console.log('🗑️ Tentando excluir pedido:', { estabelecimentoId, identificacaoPonto });

      // Chama API para excluir
      const response = await fetch(`/api/pedidos-ativos/excluir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estabelecimento_id: estabelecimentoId,
          identificacao_ponto: identificacaoPonto
        })
      });

      console.log('🗑️ Response status:', response.status);
      console.log('🗑️ Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('🗑️ Exclusão bem-sucedida:', result);
        
        // Dispara evento para recarregar dados na Home
        window.dispatchEvent(new Event('pedido:salvo'));
        
        // Fecha notificação e volta para home
        setShowDeleteNotif(false);
        onVoltar?.();
      } else {
        console.error('🗑️ Erro na resposta:', response.status, response.statusText);
        
        let errorMessage = 'Erro ao excluir pedido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('🗑️ Erro ao ler resposta de erro:', e);
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('🗑️ Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido: ' + error.message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header do painel - seta, nome do ponto e nome do pedido inline */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={()=>{
            if (itens?.length) { setShowExitNotif(true); } else { onVoltar?.(); }
          }} className="p-2 rounded-lg hover:bg-gray-100" title="Voltar">
            <ArrowLeft className="w-5 h-5 text-[#1A99BA]" />
          </button>
          <div className="text-lg font-semibold text-gray-900">{ponto?.nome || '—'}</div>
        </div>
        <div className="flex items-center gap-3 min-w-[40%]">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={nomePedidoLocal}
            onChange={(e)=>setNomePedidoLocal(e.target.value)}
            placeholder="Nome do pedido"
          />
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Histórico" onClick={onOpenHistorico}>
            <History className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Listagem de itens (mais espaço) */}
      <div className="mb-3 flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Itens ({itens.length})
        </h3>
        {itens.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            Nenhum item adicionado
          </div>
        ) : (
          <ListagemItens itens={itens} />
        )}
      </div>

      {showExitNotif && (
        <Notification
          title="Sair do pedido"
          message={<div>Itens não serão salvos. Deseja salvar e sair?</div>}
          cancelText="Sair"
          confirmText="Salvar e sair"
          onCancel={()=>{ setShowExitNotif(false); onVoltar?.(); }}
          onConfirm={()=>{ setShowExitNotif(false); const ev = new CustomEvent('pedido:salvar-e-sair'); window.dispatchEvent(ev); }}
        />
      )}

      {showDeleteNotif && (
        <Notification
          title="Excluir pedido"
          message={<div>Deseja excluir este pedido? Esta ação não pode ser desfeita.</div>}
          cancelText="Cancelar"
          confirmText="Excluir"
          onCancel={() => setShowDeleteNotif(false)}
          onConfirm={handleExcluirPedido}
        />
      )}

      {/* Listagem de valores */}
      {/* Listagem de valores (grudado no footer) */}
      <div className="space-y-2">
        <ListagemValores
          subtotal={subtotal}
          total={total}
          desconto={desconto}
          acrescimos={acrescimos}
          pagos={pagos}
          restante={restante}
        />
      </div>

      {/* Footer com ações principais em cima e botão de pagamento embaixo */}
      <div className="mt-auto pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Acréscimo">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </button>
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Desconto">
            <Percent className="w-5 h-5 text-amber-600" />
          </button>
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Cozinha">
            <Utensils className="w-5 h-5 text-[#1A99BA]" />
          </button>
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Impressão">
            <Printer className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Excluir" onClick={() => setShowDeleteNotif(true)}>
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
        <div className="flex items-center">
          <button className="w-full px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]">Adicionar pagamento</button>
        </div>
      </div>
    </div>
  );
};

export default PainelDetalhes;



