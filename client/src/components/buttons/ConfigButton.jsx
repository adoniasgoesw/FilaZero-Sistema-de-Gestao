import React from 'react';
import { Settings } from 'lucide-react';

const ConfigButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${className}`}
      title="Configurações"
    >
      <Settings className="h-5 w-5" />
    </button>
  );
};

export default ConfigButton;
