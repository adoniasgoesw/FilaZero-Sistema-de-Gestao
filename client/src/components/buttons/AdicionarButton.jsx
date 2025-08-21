import React from 'react';
import { Plus } from 'lucide-react';

const AdicionarButton = ({ onClick, children, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full sm:w-auto px-6 py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${colorClasses[color]}`}
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
};

export default AdicionarButton;
