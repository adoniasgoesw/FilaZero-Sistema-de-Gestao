import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import ConfirmButton from '../buttons/ConfirmButton.jsx';
import CancelButton from '../buttons/CancelButton.jsx';

const Notification = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  duration = 5000,
  showButtons = true,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'info' // 'info', 'warning', 'danger'
}) => {
  // Auto-close após duração especificada
  React.useEffect(() => {
    if (isOpen && duration > 0 && !onConfirm) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose, onConfirm]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // SEMPRE fecha a notificação primeiro
    onClose();
    
    // Depois executa a ação (se existir)
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    // Sempre chama onCancel se existir (para lógica adicional)
    if (onCancel) {
      onCancel();
    }
    // SEMPRE fecha a notificação
    onClose();
  };

  // Configuração baseada no tipo
  const getIconConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
    }
  };

  const iconConfig = getIconConfig();
  const IconComponent = iconConfig.icon;

  // Determina a cor do botão de confirmação
  const getConfirmButtonVariant = () => {
    if (confirmText.toLowerCase().includes('excluir') || confirmText.toLowerCase().includes('deletar')) {
      return 'red';
    }
    if (type === 'warning') {
      return 'red';
    }
    return 'blue';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Card de Notificação */}
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl transform transition-all duration-300 ease-out">
        
        {/* Ícone do Sistema (bolinha menor sobrepondo o card) */}
        <div className={`absolute -top-4 -left-4 w-16 h-16 ${iconConfig.bgColor} rounded-full flex items-center justify-center shadow-xl z-10`}>
          <IconComponent className={`w-8 h-8 ${iconConfig.iconColor}`} />
        </div>

        {/* Conteúdo da Notificação */}
        <div className="pt-12 pb-8 px-8 text-center">
          {/* Título */}
          {title && (
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {title}
            </h3>
          )}

          {/* Mensagem */}
          {message && (
            <div className="text-base text-gray-700 mb-8 leading-relaxed">
              {message.split('\n').map((line, index) => (
                <p key={index} className={index > 0 ? 'mt-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Botões */}
          {showButtons && (
            <div className="flex justify-end gap-3">
              {onCancel && (
                <CancelButton onClick={handleCancel}>
                  {cancelText}
                </CancelButton>
              )}
              <ConfirmButton 
                onClick={handleConfirm}
                variant={getConfirmButtonVariant()}
              >
                {confirmText}
              </ConfirmButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
