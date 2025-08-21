import React from 'react';
import { Receipt } from 'lucide-react';

const AbrirCaixaButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base shadow-sm"
    >
      <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline">Abrir Caixa</span>
      <span className="sm:hidden">Caixa</span>
    </button>
  );
};

export default AbrirCaixaButton;
