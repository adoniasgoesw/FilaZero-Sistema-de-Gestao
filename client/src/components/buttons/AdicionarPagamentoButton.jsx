import React from 'react';
import { CreditCard } from 'lucide-react';

const AdicionarPagamentoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-11 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-sm"
    >
      <CreditCard className="h-5 w-5" />
      Adicionar Pagamento
    </button>
  );
};

export default AdicionarPagamentoButton;
