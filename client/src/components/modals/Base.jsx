import React, { useEffect, useState } from 'react';

const ModalBase = ({ isOpen, onClose, children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Quando isOpen muda, montamos e animamos
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10); // ativa entrada
    } else if (isMounted) {
      setIsVisible(false); // ativa saída
      setTimeout(() => setIsMounted(false), 500); // desmonta após animação
    }
  }, [isOpen]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.id === 'modal-background') {
        handleClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Envolve onClose com animação
  const handleClose = () => {
    setIsVisible(false); // inicia animação de saída
    setTimeout(() => onClose(), 500); // espera animação e chama onClose
  };

  // Se não estiver montado, não renderiza nada
  if (!isMounted) return null;

  return (
    <div
      id="modal-background"
      className={`
        fixed inset-0 z-50 bg-black/20 transition-opacity duration-300 ease-in-out
        ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div
        className={`
          absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl rounded-l-2xl
          transform transition-transform duration-500 ease-in-out
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Botão de Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition"
        >
          ×
        </button>

        {/* Conteúdo do Modal */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalBase;
