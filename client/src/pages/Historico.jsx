import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';
import SearchBar from '../components/layout/SearchBar.jsx';
import AbrirCaixaButton from '../components/buttons/AbrirCaixaButton.jsx';
import ListagemCaixa from '../components/list/ListagemCaixa.jsx';
import ModalBase from '../components/modals/Base.jsx';
import FormCaixa from '../components/forms/FormCaixa.jsx';
import { History } from 'lucide-react';

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalCaixaOpen, setModalCaixaOpen] = useState(false);

  // Dados mockados para demonstração
  const caixas = [
    {
      id: 1,
      data: '2024-01-15',
      valorAbertura: 150.00,
      valorFechamento: 1250.50,
      acrescimos: 1200.00,
      retiradas: 99.50
    },
    {
      id: 2,
      data: '2024-01-14',
      valorAbertura: 200.00,
      valorFechamento: 980.25,
      acrescimos: 850.00,
      retiradas: 69.75
    },
    {
      id: 3,
      data: '2024-01-13',
      valorAbertura: 180.00,
      valorFechamento: 1100.00,
      acrescimos: 950.00,
      retiradas: 30.00
    }
  ];

  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Pesquisando:', term);
  };

  const handleAbrirCaixa = () => {
    setModalCaixaOpen(true);
  };

  const handleCloseModal = () => {
    setModalCaixaOpen(false);
  };

  const handleSubmitCaixa = (dadosCaixa) => {
    console.log('Dados da caixa:', dadosCaixa);
    // Implementar lógica para salvar caixa
    setModalCaixaOpen(false);
  };

  const caixasFiltradas = caixas.filter(caixa => 
    caixa.data.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caixa.valorAbertura.toString().includes(searchTerm) ||
    caixa.valorFechamento.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Footer />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 pb-20 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header com ícone, barra de pesquisa e botão abrir caixa */}
          <div className="mb-8">
            {/* Layout responsivo: em telas grandes tudo na mesma linha ocupando 100% da largura */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-3 w-full">
              {/* Primeira linha em telas pequenas, primeira coluna em telas grandes */}
              <div className="flex items-center gap-3 w-full lg:flex-1">
                {/* Ícone da página */}
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <History className="h-6 w-6 text-green-600" />
                </div>
                
                {/* Barra de Pesquisa - ocupa o espaço restante */}
                <div className="flex-1 min-w-0">
                  <SearchBar 
                    placeholder="Pesquisar caixas..." 
                    onSearch={handleSearch}
                  />
                </div>
              </div>
              
              {/* Segunda linha em telas pequenas, segunda coluna em telas grandes */}
              <div className="flex justify-start lg:flex-shrink-0 w-full lg:w-auto">
                <div className="w-full lg:w-auto">
                  <AbrirCaixaButton onClick={handleAbrirCaixa} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Listagem de Caixas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ListagemCaixa caixas={caixasFiltradas} />
          </div>
        </div>
      </div>

      {/* Modal para Abrir Caixa */}
      <ModalBase 
        isOpen={modalCaixaOpen} 
        onClose={handleCloseModal}
      >
        <FormCaixa 
          onClose={handleCloseModal}
          onSubmit={handleSubmitCaixa}
        />
      </ModalBase>
    </div>
  );
};

export default Historico;
