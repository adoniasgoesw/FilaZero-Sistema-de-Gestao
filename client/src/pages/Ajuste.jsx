import React from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ProfileCard from '../components/cards/ProfileCard.jsx';
import UsuarioCard from '../components/cards/UsuarioCard.jsx';
import FormaPagamentoCard from '../components/cards/FormaPagamentoCard.jsx';
import ClientesCard from '../components/cards/ClientesCard.jsx';
import CategoriasCard from '../components/cards/CategoriasCard.jsx';
import ProdutosCard from '../components/cards/ProdutosCard.jsx';
import CaixasCard from '../components/cards/CaixasCard.jsx';
import PainelAdminCard from '../components/cards/PainelAdminCard.jsx';
import { Settings } from 'lucide-react';

const Ajuste = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Footer />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 pb-20 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header com ícone */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Seção 1: Perfil */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Perfil</h2>
              <div className="max-w-sm mx-auto lg:mx-0">
                <ProfileCard />
              </div>
            </div>

            {/* Seção 2: Gestão */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestão</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                <UsuarioCard />
                <FormaPagamentoCard />
                <ClientesCard />
                <CategoriasCard />
                <ProdutosCard />
              </div>
            </div>

            {/* Seção 3: Administrativo */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrativo</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                <CaixasCard />
                <PainelAdminCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajuste;
