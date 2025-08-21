import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import BackButton from '../../components/buttons/BackButton.jsx';
import AdicionarButton from '../../components/buttons/AdicionarButton.jsx';
import ListagemClientes from '../../components/list/ListagemClientes.jsx';
import ModalBase from '../../components/modals/Base.jsx';
import FormCliente from '../../components/forms/FormCliente.jsx';
import { Users, Search } from 'lucide-react';

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [clientes] = useState([
    {
      id: 1,
      nome: 'Ana Silva',
      email: 'ana@email.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      status: 'Ativo',
      totalCompras: 'R$ 1.250,00'
    },
    {
      id: 2,
      nome: 'Carlos Santos',
      email: 'carlos@email.com',
      telefone: '(11) 88888-8888',
      endereco: 'Av. Paulista, 456 - São Paulo/SP',
      status: 'Ativo',
      totalCompras: 'R$ 890,00'
    },
    {
      id: 3,
      nome: 'Mariana Costa',
      email: 'mariana@email.com',
      telefone: '(11) 77777-7777',
      endereco: 'Rua Augusta, 789 - São Paulo/SP',
      status: 'Inativo',
      totalCompras: 'R$ 450,00'
    },
    {
      id: 4,
      nome: 'Roberto Lima',
      email: 'roberto@email.com',
      telefone: '(11) 66666-6666',
      endereco: 'Rua Oscar Freire, 321 - São Paulo/SP',
      status: 'Ativo',
      totalCompras: 'R$ 2.100,00'
    }
  ]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddCliente = () => {
    setModalClienteOpen(true);
  };

  const handleCloseModal = () => {
    setModalClienteOpen(false);
  };

  const handleSubmitCliente = (dadosCliente) => {
    console.log('Dados do cliente:', dadosCliente);
    // Implementar lógica para salvar cliente
    setModalClienteOpen(false);
  };

  const handleEditCliente = (id) => {
    console.log('Editar cliente:', id);
  };

  const handleDeleteCliente = (id) => {
    console.log('Deletar cliente:', id);
  };

  const handleToggleStatus = (id) => {
    console.log('Alternar status do cliente:', id);
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
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
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                
                {/* Barra de Pesquisa - ocupa o espaço restante */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Pesquisar clientes..."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Segunda linha em telas pequenas, segunda coluna em telas grandes */}
              <div className="flex justify-start lg:flex-shrink-0 w-full lg:w-auto">
                <AdicionarButton onClick={handleAddCliente} color="purple" className="w-full lg:w-auto">
                  Novo Cliente
                </AdicionarButton>
              </div>
            </div>
          </div>

          {/* Lista de Clientes */}
          <ListagemClientes 
            clientes={clientesFiltrados}
            onEdit={handleEditCliente}
            onDelete={handleDeleteCliente}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Modal para Novo Cliente */}
      <ModalBase 
        isOpen={modalClienteOpen} 
        onClose={handleCloseModal}
      >
        <FormCliente 
          onClose={handleCloseModal}
          onSubmit={handleSubmitCliente}
        />
      </ModalBase>
    </div>
  );
};

export default Clientes;
