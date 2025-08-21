import React from 'react';
import { DollarSign } from 'lucide-react';

const AcrescimoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center shadow-sm"
      title="Acréscimo"
    >
      <DollarSign className="h-5 w-5" />
    </button>
  );
};

export default AcrescimoButton;
