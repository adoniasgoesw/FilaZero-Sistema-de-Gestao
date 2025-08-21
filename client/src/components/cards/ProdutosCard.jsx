import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Settings } from 'lucide-react';

const ProdutosCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/produtos');
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-indigo-600" />
        </div>
        <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      </div>
      
      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Produtos</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 lg:mb-4 hidden sm:block">Gerencie catálogo de produtos</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Total: 89 produtos</span>
        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
        </div>
      </div>
    </div>
  );
};

export default ProdutosCard;
