import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Se não houver histórico, volta para a página de ajuste
    if (window.history.length <= 1) {
      navigate('/ajuste');
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-sm"
      title="Voltar"
    >
      <ArrowLeft className="h-5 w-5 text-gray-600" />
    </button>
  );
};

export default BackButton;
