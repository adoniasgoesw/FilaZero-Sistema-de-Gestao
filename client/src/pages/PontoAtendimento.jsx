import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import PainelDetalhes from '../components/panels/PainelDetalhes.jsx';
import PainelItens from '../components/panels/PainelItens.jsx';

const PontoAtendimento = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [itensAtuais, setItensAtuais] = useState([]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleCancel = () => {
    console.log('Cancelar operação');
    // Limpar itens atuais
    setItensAtuais([]);
  };

  const handleSave = (pedido) => {
    console.log('Salvar pedido:', pedido);
  };

  // Função para receber atualizações dos itens em tempo real
  const handleItemUpdate = (itens) => {
    console.log('Itens atualizados:', itens);
    setItensAtuais(itens);
  };

  const handleInfo = () => {
    // Em telas pequenas, alterna para o painel de detalhes
    console.log('Informações');
  };

  const handleBackToItems = () => {
    // Em telas pequenas, volta para o painel de itens
    console.log('Voltar para itens');
  };

  return (
    <div className="h-screen bg-gray-50">
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 h-full">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Grid dos painéis - 30% detalhes, 70% itens */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-2rem)] mt-4 mb-4">
            {/* Painel Detalhes - lado esquerdo (30%) - SEMPRE VISÍVEL */}
            <div className="lg:col-span-3">
              <PainelDetalhes 
                onBackToItems={handleBackToItems}
                itens={itensAtuais}
                onItemUpdate={handleItemUpdate}
              />
            </div>
            
            {/* Painel Itens - lado direito (70%) - SEMPRE VISÍVEL EM DESKTOP */}
            <div className="lg:col-span-7">
              <PainelItens
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onCancel={handleCancel}
                onSave={handleSave}
                onInfo={handleInfo}
                onItemUpdate={handleItemUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PontoAtendimento;
