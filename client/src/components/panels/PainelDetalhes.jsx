import React, { useState } from 'react';
import { Edit, ArrowLeft } from 'lucide-react';
import BackButton from '../buttons/BackButton.jsx';
import HistoryButton from '../buttons/HistoryButton.jsx';
import ListagemItens from '../list/ListagemItens.jsx';
import ListagemValores from '../list/ListagemValores.jsx';
import AcrescimoButton from '../buttons/AcrescimoButton.jsx';
import DescontoButton from '../buttons/DescontoButton.jsx';
import CozinhaButton from '../buttons/CozinhaButton.jsx';
import ImprimirButton from '../buttons/ImprimirButton.jsx';
import DeletarPedidoButton from '../buttons/DeletarPedidoButton.jsx';
import AdicionarPagamentoButton from '../buttons/AdicionarPagamentoButton.jsx';

const PainelDetalhes = ({ pontoId, onBackToItems }) => {
  const [nomePedido, setNomePedido] = useState('Pedro Silva');
  
  // Dados mockados para demonstração
  const itens = [
    {
      id: 1,
      nome: 'X-Burger',
      quantidade: 2,
      preco: 15.90
    },
    {
      id: 2,
      nome: 'Batata Frita',
      quantidade: 1,
      preco: 8.50
    },
    {
      id: 3,
      nome: 'Refrigerante Cola',
      quantidade: 2,
      preco: 5.50
    }
  ];

  const valorTotal = itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);

  const handleDeleteItem = (itemId) => {
    console.log('Excluindo item:', itemId);
    // Implementar lógica de exclusão
  };

  const handleHistory = () => {
    console.log('Abrindo histórico');
    // Implementar lógica do histórico
  };

  const handleAcrescimo = () => {
    console.log('Aplicando acréscimo');
    // Implementar lógica de acréscimo
  };

  const handleDesconto = () => {
    console.log('Aplicando desconto');
    // Implementar lógica de desconto
  };

  const handleCozinha = () => {
    console.log('Enviando para cozinha');
    // Implementar lógica de cozinha
  };

  const handleImprimir = () => {
    console.log('Imprimindo pedido');
    // Implementar lógica de impressão
  };

  const handleDeletarPedido = () => {
    console.log('Deletando pedido');
    // Implementar lógica de exclusão
  };

  const handleAdicionarPagamento = () => {
    console.log('Adicionando pagamento');
    // Implementar lógica de pagamento
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] flex flex-col painel-container">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {/* Botão Voltar - comportamento diferente para mobile/desktop */}
            <div className="lg:hidden">
              <button
                onClick={onBackToItems}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-sm"
                title="Voltar para Itens"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="hidden lg:block">
              <BackButton />
            </div>
            <span className="text-base font-semibold text-gray-900">Mesa 1</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={nomePedido}
                onChange={(e) => setNomePedido(e.target.value)}
                placeholder="Nome do pedido"
                className="w-40 px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            <HistoryButton onClick={handleHistory} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Listagem de Itens */}
        <ListagemItens itens={itens} onDeleteItem={handleDeleteItem} />
      </div>

      {/* Footer com Valores e Botões */}
      <div className="border-t border-gray-200">
        {/* Listagem de Valores */}
        <div className="p-2">
          <ListagemValores valorTotal={valorTotal} />
        </div>
        
        {/* Botões */}
        <div className="p-2 border-t border-gray-100">
          {/* Cinco botões principais */}
          <div className="flex items-center justify-end gap-1 mb-2">
            <AcrescimoButton onClick={handleAcrescimo} />
            <DescontoButton onClick={handleDesconto} />
            <CozinhaButton onClick={handleCozinha} />
            <ImprimirButton onClick={handleImprimir} />
            <DeletarPedidoButton onClick={handleDeletarPedido} />
          </div>
          
          {/* Botão principal */}
          <div className="flex justify-end">
            <AdicionarPagamentoButton onClick={handleAdicionarPagamento} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelDetalhes;
