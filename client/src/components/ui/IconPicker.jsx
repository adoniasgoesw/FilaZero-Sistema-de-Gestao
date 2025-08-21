import React from 'react';

const IconPicker = ({ isOpen, onClose, onSelectIcon, selectedIcon }) => {
  const icones = [
    '🍕', '🍔', '🌭', '🌮', '🌯', '🥪', '🥙', '🥗', '🥘', '🍝',
    '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🥠', '🍤', '🍙', '🍚',
    '🍖', '🍗', '🥩', '🥓', '🍳', '🥚', '🧀', '🥛', '🍼', '☕'
  ];

  if (!isOpen) return null;

  const handleIconSelect = (icone) => {
    onSelectIcon(icone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay transparente para fechar ao clicar fora */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Card de ícones */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 min-w-[400px] max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Escolher Ícone
        </h3>
        
        <div className="grid grid-cols-6 gap-3">
          {icones.map(icone => (
            <button
              key={icone}
              onClick={() => handleIconSelect(icone)}
              className={`flex items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                selectedIcon === icone ? 'bg-blue-50 ring-2 ring-blue-200' : ''
              }`}
            >
              <span className="text-3xl">{icone}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
