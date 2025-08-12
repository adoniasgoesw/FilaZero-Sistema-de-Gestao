import React from "react";

const ListagemPadrao = ({ 
  items = [], 
  renderItem, 
  emptyMessage = "Nenhum item encontrado",
  loading = false,
  className = "",
  layout = "grid" // "grid" (default) ou "list"
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A99BA]"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // layout list: renderiza itens em coluna única (ideal para "linhas")
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default ListagemPadrao;
