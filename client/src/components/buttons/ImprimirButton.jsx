import React from 'react';
import { Printer } from 'lucide-react';

const ImprimirButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors flex items-center justify-center shadow-sm"
      title="Imprimir"
    >
      <Printer className="h-5 w-5" />
    </button>
  );
};

export default ImprimirButton;
