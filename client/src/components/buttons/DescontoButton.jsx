import React from 'react';
import { Percent } from 'lucide-react';

const DescontoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors flex items-center justify-center shadow-sm"
      title="Desconto"
    >
      <Percent className="h-5 w-5" />
    </button>
  );
};

export default DescontoButton;
