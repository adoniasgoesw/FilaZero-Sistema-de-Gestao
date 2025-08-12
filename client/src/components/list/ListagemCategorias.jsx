import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import ListagemPadrao from "./ListagemPadrao";
import errorImage from "../../assets/error.png";
import placeholderImage from "../../assets/loading.png";

const ListagemCategorias = ({ 
  categorias = [], 
  loading = false, 
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  // Dados mockados para demonstração (fallback)
  const mockCategorias = [
    { id: 1, nome: "Bebidas", imagem_url: "https://via.placeholder.com/150/1A99BA/FFFFFF?text=Bebidas", produtos: 12 },
    { id: 2, nome: "Comidas", imagem_url: "https://via.placeholder.com/150/1A99BA/FFFFFF?text=Comidas", produtos: 25 },
    { id: 3, nome: "Sobremesas", imagem_url: "https://via.placeholder.com/150/1A99BA/FFFFFF?text=Sobremesas", produtos: 8 },
    { id: 4, nome: "Acompanhamentos", imagem_url: "https://via.placeholder.com/150/1A99BA/FFFFFF?text=Acomp", produtos: 15 },
    { id: 5, nome: "Promoções", imagem_url: "https://via.placeholder.com/150/1A99BA/FFFFFF?text=Promo", produtos: 6 },
  ];

  const renderCategoria = (categoria) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Imagem da categoria */}
      <div className="relative">
        <img
          src={categoria.imagem_url || categoria.imagem || placeholderImage}
          alt={categoria.nome}
          className="w-full h-32 object-cover rounded-t-lg"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = errorImage;
          }}
        />
        
        {/* Botões de ação (aparecem no hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(categoria);
              }}
              className="bg-white p-1 rounded-full shadow-sm hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 text-[#1A99BA]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(categoria);
              }}
              className="bg-white p-1 rounded-full shadow-sm hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Informações da categoria */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 mb-1">{categoria.nome}</h3>
        <p className="text-sm text-gray-500">{categoria.produtos} produtos</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Botão Adicionar Categoria */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Categorias</h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-[#1A99BA] text-white px-4 py-2 rounded-lg hover:bg-[#0f5f73] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Listagem */}
      <ListagemPadrao
        items={categorias.length > 0 ? categorias : mockCategorias}
        renderItem={renderCategoria}
        loading={loading}
        emptyMessage="Nenhuma categoria encontrada"
      />
    </div>
  );
};

export default ListagemCategorias;
