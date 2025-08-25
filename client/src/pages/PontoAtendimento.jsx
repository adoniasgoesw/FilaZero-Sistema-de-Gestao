import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import PainelDetalhes from '../components/panels/PainelDetalhes.jsx';
import PainelItens from '../components/panels/PainelItens.jsx';

const PontoAtendimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [itensAtuais, setItensAtuais] = useState([]);
  const [reduceItemCallback, setReduceItemCallback] = useState(null);
  const [showPainelDetalhes, setShowPainelDetalhes] = useState(false);

  const formatarIdentificacao = (id) => {
    if (!id) return "Mesa 1";
    
    if (id.toLowerCase().includes('mesa')) {
      const numero = id.replace(/\D/g, '');
      return numero ? `Mesa ${numero}` : "Mesa 1";
    } else if (id.toLowerCase().includes('balcao')) {
      return "Balcão";
    } else {
      return `Mesa ${id}`;
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleItemUpdate = (novosItens) => {
    setItensAtuais(novosItens);
  };

  const handleReduceItemCallback = (callback) => {
    setReduceItemCallback(() => callback);
  };

  const handleReduceItem = (produtoId) => {
    if (reduceItemCallback) {
      reduceItemCallback(produtoId);
    }
  };

  const handleBackToItems = () => {
    // Em telas pequenas, volta para o painel de itens
    // Em telas grandes, vai para a página Home
    if (window.innerWidth < 1024) { // lg breakpoint
      setShowPainelDetalhes(false); // Volta para o painel de itens
    } else {
      navigate('/home'); // Em telas grandes, vai para Home
    }
  };

  const handleBackToHome = () => {
    // Sempre vai para a página Home (usado pelo Painel Itens em telas pequenas)
    navigate('/home');
  };

  const handleInfoClick = () => {
    // Só funciona em telas pequenas - alterna para o painel de detalhes
    setShowPainelDetalhes(true);
  };

  const identificacao = formatarIdentificacao(id);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      {/* Conteúdo principal - Layout responsivo */}
      <div className="lg:ml-20 h-full flex gap-4 p-4">
        {/* Painel de Detalhes - Visível em telas grandes OU quando ativado em telas pequenas */}
        <div className={`${showPainelDetalhes ? 'block' : 'hidden'} lg:block w-full lg:w-1/3 h-full transition-all duration-300`}>
          <PainelDetalhes
            identificacao={identificacao}
            itens={itensAtuais}
            onReduceItem={handleReduceItem}
            onBackToItems={handleBackToItems}
          />
        </div>

        {/* Painel de Itens - Sempre visível em telas grandes, condicional em telas pequenas */}
        <div className={`${showPainelDetalhes ? 'hidden' : 'block'} lg:block w-full lg:w-2/3 h-full transition-all duration-300`}>
          <PainelItens
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onItemUpdate={handleItemUpdate}
            onReduceItemFromItens={handleReduceItemCallback}
            onInfoClick={handleInfoClick}
            onBackToHome={handleBackToHome}
            showInfoButton={!showPainelDetalhes} // Só mostra o botão Info quando o painel de detalhes está escondido
          />
        </div>
      </div>
    </div>
  );
};

export default PontoAtendimento;
