import React from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Truck } from 'lucide-react';

const Delivery = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Footer />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 pb-20 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:py-8 py-6 lg:py-8">
          {/* Header com ícone */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          
          {/* Placeholder para conteúdo do delivery */}
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestão de Delivery</h3>
            <p className="text-gray-50">Gerencie pedidos de delivery e acompanhe entregas em tempo real.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
