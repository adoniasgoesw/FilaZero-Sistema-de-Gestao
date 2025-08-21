import React from 'react';
import { Utensils } from 'lucide-react';

const CozinhaButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center shadow-sm"
      title="Cozinha"
    >
      <Utensils className="h-5 w-5" />
    </button>
  );
};

export default CozinhaButton;
