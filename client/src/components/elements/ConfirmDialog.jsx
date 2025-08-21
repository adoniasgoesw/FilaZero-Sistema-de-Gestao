import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja realizar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const config = {
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700',
      logoBg: 'bg-yellow-100'
    },
    danger: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      confirmButtonColor: 'bg-red-600 hover:bg-red-700',
      logoBg: 'bg-red-100'
    }
  };

  const currentConfig = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* Card de Confirmação */}
      <div className={`relative w-full max-w-md ${currentConfig.bgColor} border ${currentConfig.borderColor} rounded-3xl shadow-2xl transform transition-all duration-300 ease-out overflow-hidden`}>
        
        {/* Logo do Sistema (SVG moderno) */}
        <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 ${currentConfig.logoBg} rounded-2xl flex items-center justify-center shadow-xl`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`w-8 h-8 ${currentConfig.iconColor}`}
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Botão Fechar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Conteúdo da Confirmação */}
        <div className="pt-12 pb-6 px-8 text-center">
          {/* Ícone de Aviso */}
          <div className="flex justify-center mb-5">
            <AlertTriangle className={`w-14 h-14 ${currentConfig.iconColor}`} />
          </div>

          {/* Título */}
          <h3 className={`text-xl font-bold ${currentConfig.titleColor} mb-3`}>
            {title}
          </h3>

          {/* Mensagem */}
          <p className={`text-base ${currentConfig.messageColor} mb-8 leading-relaxed`}>
            {message}
          </p>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-all duration-200 text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 text-white font-medium rounded-xl ${currentConfig.confirmButtonColor} transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
