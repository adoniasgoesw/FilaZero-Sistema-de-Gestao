import React, { useEffect, useState } from "react";

const ModalBase = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Espera animação antes de fechar
  };

  if (!isOpen) return null; // Não monta se não estiver aberto

  return (
    <div
      id="modal-background"
      onClick={(e) => e.target.id === "modal-background" && handleClose()}
      className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ease-in-out
        ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 transition"
        >
          ×
        </button>

        <div className="p-6 overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );
};

export default ModalBase;