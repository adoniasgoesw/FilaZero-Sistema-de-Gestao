import React from "react";

const ListagemPedidosHistorico = ({ pedidos = [] }) => {
  const formatCurrency = (n) =>
    typeof n === 'number' ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : n;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Histórico de vendas</h2>
      </div>
      {pedidos.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          Nenhuma venda encontrada
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidos.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Cliente</div>
                <div className="text-base font-semibold text-gray-800">{p.cliente || '—'}</div>
              </div>
              <div className="text-sm text-gray-500">{p.data}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Pagamento</div>
                <div className="text-sm text-gray-800">{p.pagamento}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Valor</div>
                <div className="text-base font-semibold text-gray-800">{formatCurrency(p.total)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListagemPedidosHistorico;


