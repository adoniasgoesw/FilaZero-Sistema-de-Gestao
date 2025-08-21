import React from 'react';
import { DollarSign } from 'lucide-react';

const ListagemValores = ({ valorTotal }) => {
  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-gray-700">Valor Total</span>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-green-600 text-base">R$ {valorTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListagemValores;
