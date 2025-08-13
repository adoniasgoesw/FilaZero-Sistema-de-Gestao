import React from "react";
import { Edit, Trash2 } from "lucide-react";
import ListagemPadrao from "./ListagemPadrao";

const ListagemFormasPagamento = ({
  formas = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  className = "",
}) => {
  const headers = [
    { key: "nome", label: "Nome" },
    { key: "tipo", label: "Tipo" },
    { key: "taxa", label: "Taxa" },
    { key: "conta_bancaria", label: "Conta bancária" },
    { key: "acoes", label: "" },
  ];

  const renderRow = (f) => (
    <div className="group grid grid-cols-5 gap-4 items-center py-3 px-3 bg-white border-b border-gray-100 hover:bg-gray-50">
      <div className="truncate font-medium text-gray-800">{f.nome}</div>
      <div className="text-gray-700">{f.tipo}</div>
      <div className="text-gray-700">{f.taxa != null ? `${Number(f.taxa).toFixed(2)}%` : '-'}</div>
      <div className="text-gray-700 truncate">{f.conta_bancaria || '-'}</div>
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e)=>{e.stopPropagation(); onEdit?.(f);}} className="p-1 rounded-full hover:bg-gray-100" title="Editar"><Edit className="w-4 h-4 text-[#1A99BA]"/></button>
        <button onClick={(e)=>{e.stopPropagation(); onDelete?.(f);}} className="p-1 rounded-full hover:bg-gray-100" title="Excluir"><Trash2 className="w-4 h-4 text-red-500"/></button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Formas de Pagamento</h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-[#1A99BA] text-white px-4 py-2 rounded-lg hover:bg-[#0f5f73] transition-colors"
        >
          <span>Nova Forma de Pagamento</span>
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 items-center px-3 py-3 bg-gray-50 border border-gray-200 rounded-t-lg text-sm font-semibold text-gray-700">
        {headers.map((h) => (
          <div key={h.key} className="truncate">{h.label}</div>
        ))}
      </div>

      <ListagemPadrao
        items={formas}
        loading={loading}
        emptyMessage="Nenhuma forma de pagamento encontrada"
        className="border-x border-b border-gray-200 rounded-b-lg"
        layout="list"
        renderItem={(item) => renderRow(item)}
      />
    </div>
  );
};

export default ListagemFormasPagamento;


