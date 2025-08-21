import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';
import SearchBar from '../components/layout/SearchBar.jsx';
import ConfigButton from '../components/buttons/ConfigButton.jsx';
import PontosList from '../components/list/PontosList.jsx';
import FormConfig from '../components/forms/FormConfig.jsx';
import { Home as HomeIcon } from 'lucide-react';

const Home = () => {
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const handleSearch = (searchTerm) => {
    console.log('Pesquisando:', searchTerm);
    // Implementar lógica de pesquisa
  };

  const handleConfig = () => {
    setConfigModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Footer />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 pb-20 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header da página com ícone, barra de pesquisa e botão de configuração */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <SearchBar 
                placeholder="Pesquisar mesas..." 
                onSearch={handleSearch}
              />
            </div>
            
            <ConfigButton onClick={handleConfig} />
          </div>
          
          {/* Listagem de pontos de atendimento */}
          <PontosList />
        </div>
      </div>

      {/* Modal de Configuração */}
      <FormConfig 
        isOpen={configModalOpen} 
        onClose={() => setConfigModalOpen(false)} 
      />
    </div>
  );
};

export default Home;