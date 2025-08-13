import React from "react";

const moeda = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const ListagemItens = ({ itens = [] }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-6 gap-4 items-center px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700">
        <div className="col-span-1">Qtd</div>
        <div className="col-span-4">Item</div>
        <div className="col-span-1 text-right">Valor</div>
      </div>
      <div>
        {itens.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500">Nenhum item</div>
        ) : (
          itens.map((i) => (
            <div key={i.id} className="grid grid-cols-6 gap-4 items-center px-3 py-2 border-t border-gray-100 text-sm">
              <div className="col-span-1 text-gray-700">{i.quantidade}</div>
              <div className="col-span-4 text-gray-800">{i.nome}</div>
              <div className="col-span-1 text-right font-medium text-gray-900">{moeda(i.valor)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListagemItens;



