import React from "react";
import { Edit, Trash2 } from "lucide-react";
import ListagemPadrao from "./ListagemPadrao";

const ListagemClientes = ({
  clientes = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  className = "",
}) => {
  const headers = [
    { key: "nome", label: "Nome" },
    { key: "cpf_cnpj", label: "CPF/CNPJ" },
    { key: "endereco", label: "Endereço" },
    { key: "telefone", label: "Telefone/WhatsApp" },
    { key: "email", label: "E-mail" },
    { key: "taxa_entrega", label: "Taxa de Entrega" },
    { key: "acoes", label: "" },
  ];

  const formatTaxa = (v) => {
    if (v === undefined || v === null || v === "") return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return "-";
    return `R$ ${num.toFixed(2)}`;
  };

  const renderRow = (c) => (
    <div className="group grid grid-cols-7 gap-4 items-center py-3 px-3 bg-white border-b border-gray-100 hover:bg-gray-50">
      <div className="truncate font-medium text-gray-800">{c.nome}</div>
      <div className="text-gray-700 truncate">{c.cpf_cnpj}</div>
      <div className="text-gray-700 truncate">{c.endereco || '-'}</div>
      <div className="text-gray-700 truncate">{c.telefone || '-'}</div>
      <div className="text-gray-700 truncate">{c.email || '-'}</div>
      <div className="text-gray-700">{formatTaxa(c.taxa_entrega)}</div>
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e)=>{e.stopPropagation(); onEdit?.(c);}} className="p-1 rounded-full hover:bg-gray-100" title="Editar"><Edit className="w-4 h-4 text-[#1A99BA]"/></button>
        <button onClick={(e)=>{e.stopPropagation(); onDelete?.(c);}} className="p-1 rounded-full hover:bg-gray-100" title="Excluir"><Trash2 className="w-4 h-4 text-red-500"/></button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Clientes</h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-[#1A99BA] text-white px-4 py-2 rounded-lg hover:bg-[#0f5f73] transition-colors"
        >
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4 items-center px-3 py-3 bg-gray-50 border border-gray-200 rounded-t-lg text-sm font-semibold text-gray-700">
        {headers.map((h) => (
          <div key={h.key} className="truncate">{h.label}</div>
        ))}
      </div>

      <ListagemPadrao
        items={clientes}
        loading={loading}
        emptyMessage="Nenhum cliente encontrado"
        className="border-x border-b border-gray-200 rounded-b-lg"
        layout="list"
        renderItem={(item) => renderRow(item)}
      />
    </div>
  );
};

export default ListagemClientes;



