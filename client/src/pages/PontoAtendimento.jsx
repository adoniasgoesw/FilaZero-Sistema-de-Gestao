import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import PainelDetalhes from '../components/panels/PainelDetalhes.jsx';
import PainelItens from '../components/panels/PainelItens.jsx';

const PontoAtendimento = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [painelAtivo, setPainelAtivo] = useState('itens'); // 'itens' ou 'detalhes'

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleCancel = () => {
    console.log('Cancelar operação');
    // Implementar lógica de cancelamento
  };

  const handleSave = () => {
    console.log('Salvar operação');
    // Implementar lógica de salvamento
  };

  const handleInfo = () => {
    // Em telas pequenas, alterna para o painel de detalhes
    setPainelAtivo('detalhes');
  };

  const handleBackToItems = () => {
    // Em telas pequenas, volta para o painel de itens
    setPainelAtivo('itens');
  };

  return (
    <div className="h-screen bg-gray-50">
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 h-full">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Grid dos painéis - 30% detalhes, 70% itens */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-2rem)] mt-4 mb-4">
            {/* Painel Detalhes - lado esquerdo (30%) - SÓ VISÍVEL EM DESKTOP */}
            <div className={`lg:col-span-3 ${painelAtivo === 'detalhes' ? 'block lg:block' : 'hidden lg:block'}`}>
              <PainelDetalhes 
                pontoId={id}
                onBackToItems={handleBackToItems}
              />
            </div>
            
            {/* Painel Itens - lado direito (70%) - SÓ VISÍVEL EM DESKTOP OU QUANDO ATIVO EM MOBILE */}
            <div className={`lg:col-span-7 ${painelAtivo === 'itens' ? 'block lg:block' : 'hidden lg:block'}`}>
              <PainelItens
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onCancel={handleCancel}
                onSave={handleSave}
                onInfo={handleInfo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PontoAtendimento;
