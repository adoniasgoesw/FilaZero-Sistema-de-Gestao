import React from 'react';
import { Info } from 'lucide-react';

const InfoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center shadow-sm"
      title="Informações"
    >
      <Info className="h-5 w-5" />
    </button>
  );
};

export default InfoButton;
