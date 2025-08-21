import React from 'react';

const ColorPicker = ({ isOpen, onClose, onSelectColor, selectedColor }) => {
  const cores = [
    { nome: 'Vermelho', valor: '#FF6B6B' },
    { nome: 'Laranja', valor: '#FFA500' },
    { nome: 'Amarelo', valor: '#FFD93D' },
    { nome: 'Verde', valor: '#4ECDC4' },
    { nome: 'Azul', valor: '#45B7D1' },
    { nome: 'Roxo', valor: '#9B59B6' },
    { nome: 'Rosa', valor: '#FF69B4' },
    { nome: 'Marrom', valor: '#8B4513' },
    { nome: 'Cinza', valor: '#808080' },
    { nome: 'Preto', valor: '#2C3E50' },
    { nome: 'Turquesa', valor: '#1ABC9C' },
    { nome: 'Lavanda', valor: '#E8D5FF' }
  ];

  if (!isOpen) return null;

  const handleColorSelect = (cor) => {
    onSelectColor(cor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay transparente para fechar ao clicar fora */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Card de cores */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Escolher Cor
        </h3>
        
        <div className="grid grid-cols-4 gap-3">
          {cores.map(cor => (
            <button
              key={cor.valor}
              onClick={() => handleColorSelect(cor)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div 
                className={`w-12 h-12 rounded-full border-2 shadow-sm ${
                  selectedColor === cor.valor 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: cor.valor }}
              />
              <span className="text-xs text-gray-600 text-center font-medium">
                {cor.nome}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
