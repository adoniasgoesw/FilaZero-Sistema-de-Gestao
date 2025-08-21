import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import BackButton from '../../components/buttons/BackButton.jsx';
import AdicionarButton from '../../components/buttons/AdicionarButton.jsx';
import ListagemFormasPagamento from '../../components/list/ListagemFormasPagamento.jsx';
import ModalBase from '../../components/modals/Base.jsx';
import FormFormaPagamento from '../../components/forms/FormFormaPagamento.jsx';
import { CreditCard, Search } from 'lucide-react';

const FormasPagamento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalFormaPagamentoOpen, setModalFormaPagamentoOpen] = useState(false);
  const [formasPagamento] = useState([
    {
      id: 1,
      nome: 'Cartão de Crédito',
      tipo: 'Cartão',
      status: 'Ativo',
      taxa: '2.99%',
      prazo: '30 dias'
    },
    {
      id: 2,
      nome: 'PIX',
      tipo: 'Digital',
      status: 'Ativo',
      taxa: '0.00%',
      prazo: 'Imediato'
    },
    {
      id: 3,
      nome: 'Dinheiro',
      tipo: 'Físico',
      status: 'Ativo',
      taxa: '0.00%',
      prazo: 'Imediato'
    },
    {
      id: 4,
      nome: 'Cartão de Débito',
      tipo: 'Cartão',
      status: 'Inativo',
      taxa: '1.99%',
      prazo: 'Imediato'
    }
  ]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddFormaPagamento = () => {
    setModalFormaPagamentoOpen(true);
  };

  const handleCloseModal = () => {
    setModalFormaPagamentoOpen(false);
  };

  const handleSubmitFormaPagamento = (dadosFormaPagamento) => {
    console.log('Dados da forma de pagamento:', dadosFormaPagamento);
    // Implementar lógica para salvar forma de pagamento
    setModalFormaPagamentoOpen(false);
  };

  const handleEditFormaPagamento = (id) => {
    console.log('Editar forma de pagamento:', id);
  };

  const handleDeleteFormaPagamento = (id) => {
    console.log('Deletar forma de pagamento:', id);
  };

  const handleToggleStatus = (id) => {
    console.log('Alternar status:', id);
  };

  const formasFiltradas = formasPagamento.filter(forma =>
    forma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forma.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Footer />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 pb-20 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Layout responsivo: em telas grandes tudo na mesma linha ocupando 100% da largura */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-3 w-full">
              {/* Primeira linha em telas pequenas, primeira coluna em telas grandes */}
              <div className="flex items-center gap-3 w-full lg:flex-1">
                {/* Botão Voltar */}
                <BackButton />
                
                {/* Ícone da página */}
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                
                {/* Barra de Pesquisa - ocupa o espaço restante */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Pesquisar formas de pagamento..."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Segunda linha em telas pequenas, segunda coluna em telas grandes */}
              <div className="flex justify-start lg:flex-shrink-0 w-full lg:w-auto">
                <AdicionarButton onClick={handleAddFormaPagamento} color="green" className="w-full lg:w-auto">
                  Nova Forma
                </AdicionarButton>
              </div>
            </div>
          </div>

          {/* Lista de Formas de Pagamento */}
          <ListagemFormasPagamento 
            formasPagamento={formasFiltradas}
            onEdit={handleEditFormaPagamento}
            onDelete={handleDeleteFormaPagamento}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Modal para Nova Forma de Pagamento */}
      <ModalBase 
        isOpen={modalFormaPagamentoOpen} 
        onClose={handleCloseModal}
      >
        <FormFormaPagamento 
          onClose={handleCloseModal}
          onSubmit={handleSubmitFormaPagamento}
        />
      </ModalBase>
    </div>
  );
};

export default FormasPagamento;
