import React from "react";
import ListagemPadrao from "./ListagemPadrao";

const ListagemProdutos = ({
  produtos = [],
  loading = false,
  onAdd,
  className = "",
}) => {
  // Cabeçalhos fixos (5 colunas)
  const headers = [
    { key: "imagem", label: "" },
    { key: "nome", label: "Produto" },
    { key: "precoVenda", label: "Preço Venda" },
    { key: "precoCompra", label: "Preço Compra" },
    { key: "categoria", label: "Categoria" },
    { key: "estoque", label: "Estoque" },
  ];

  const formatCurrency = (value) =>
    typeof value === "number"
      ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : value;

  const renderProdutoRow = (produto) => (
    <div className="grid grid-cols-6 gap-4 items-center py-3 px-3 bg-white border-b border-gray-100 hover:bg-gray-50">
      <div className="w-10 h-10 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
        {produto.imagem ? (
          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
        )}
      </div>
      <div className="truncate font-medium text-gray-800">{produto.nome}</div>
      <div className="text-gray-700">{formatCurrency(produto.precoVenda)}</div>
      <div className="text-gray-700">{formatCurrency(produto.precoCompra)}</div>
      <div className="text-gray-700 truncate">{produto.categoria}</div>
      <div className="text-gray-700">{produto.estoque}</div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com título e botão */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Produtos</h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-[#1A99BA] text-white px-4 py-2 rounded-lg hover:bg-[#0f5f73] transition-colors"
        >
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-6 gap-4 items-center px-3 py-3 bg-gray-50 border border-gray-200 rounded-t-lg text-sm font-semibold text-gray-700">
        {headers.map((h) => (
          <div key={h.key} className="truncate">{h.label}</div>
        ))}
      </div>

      {/* Linhas (usando ListagemPadrao para reaproveitar loading/empty) */}
      <ListagemPadrao
        items={produtos}
        loading={loading}
        emptyMessage="Nenhum produto encontrado"
        className="border-x border-b border-gray-200 rounded-b-lg"
        layout="list"
        renderItem={(item) => renderProdutoRow(item)}
      />
    </div>
  );
};

export default ListagemProdutos;


