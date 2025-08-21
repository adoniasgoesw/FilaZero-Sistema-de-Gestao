import React from 'react';
import Notification from './Notification.jsx';
import useNotification from './useNotification.js';

const NotificationExample = () => {
  const { notification, showError, showInfo, showConfirm, hideNotification } = useNotification();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Sistema de Notificações</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => showInfo('Informação', 'Esta é uma mensagem informativa.')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Info
        </button>
        
        <button
          onClick={() => showError('Erro!', 'Ocorreu um erro na operação.')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Erro
        </button>
        
        <button
          onClick={() => showConfirm(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este item?',
            () => showInfo('Confirmado!', 'Item foi excluído com sucesso.'),
            () => showInfo('Cancelado', 'Exclusão foi cancelada.'),
            'Sim, Excluir',
            'Cancelar',
            'danger'
          )}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Confirmar Exclusão
        </button>
      </div>

      {/* Componente de Notificação Unificado */}
      <Notification
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
        showButtons={notification.showButtons}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        type={notification.type}
      />
    </div>
  );
};

export default NotificationExample;
