import React from 'react';
import { Trash2 } from 'lucide-react';

const DeletarPedidoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center shadow-sm"
      title="Deletar Pedido"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
};

export default DeletarPedidoButton;
