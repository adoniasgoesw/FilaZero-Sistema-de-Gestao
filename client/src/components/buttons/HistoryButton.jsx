import React from 'react';
import { History } from 'lucide-react';

const HistoryButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors flex items-center justify-center"
      title="Histórico"
    >
      <History className="h-5 w-5" />
    </button>
  );
};

export default HistoryButton;
