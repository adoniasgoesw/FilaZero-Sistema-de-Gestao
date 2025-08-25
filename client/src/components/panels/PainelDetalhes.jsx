import React, { useState } from 'react';
import ListagemItens from '../list/ListagemItens.jsx';
import ListagemValores from '../list/ListagemValores.jsx';
import BackButton from '../buttons/BackButton.jsx';

const PainelDetalhes = ({ 
  identificacao, 
  itens = [], 
  onReduceItem,
  onBackToItems
}) => {
  const [nomePedido, setNomePedido] = useState('');

  const handleNomePedidoChange = (e) => {
    setNomePedido(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header com Botão Voltar, Identificação e Campo Nome */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Botão Voltar - Usando o BackButton existente */}
          <div onClick={onBackToItems}>
            <BackButton />
          </div>
          
          {/* Identificação da Mesa */}
          <h2 className="text-lg font-semibold text-gray-800 flex-shrink-0">
            {identificacao}
          </h2>
          
          {/* Campo Nome do Pedido */}
          <div className="flex-1">
            <input
              type="text"
              value={nomePedido}
              onChange={handleNomePedidoChange}
              placeholder="Nome do cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Listagem de Itens */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <ListagemItens 
          itens={itens} 
          onReduceItem={onReduceItem}
        />
      </div>

      {/* Listagem de Valores */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200">
        <ListagemValores itens={itens} />
      </div>
    </div>
  );
};

export default PainelDetalhes;
