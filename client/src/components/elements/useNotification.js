import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    duration: 5000,
    showButtons: true,
    confirmText: 'OK',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null,
    type: 'info'
  });

  const showNotification = useCallback(({ title, message, duration = 5000, showButtons = true, confirmText = 'OK', cancelText = 'Cancelar', onConfirm = null, onCancel = null, type = 'info' }) => {
    setNotification({
      isOpen: true,
      title,
      message,
      duration,
      showButtons,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      type
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Métodos de conveniência para notificações simples
  const showSuccess = useCallback((title, message, duration = 5000) => {
    showNotification({ title, message, duration, showButtons: true, confirmText: 'OK', type: 'info' });
  }, [showNotification]);

  const showError = useCallback((title, message, duration = 5000) => {
    showNotification({ title, message, duration, showButtons: true, confirmText: 'OK', type: 'danger' });
  }, [showNotification]);

  const showInfo = useCallback((title, message, duration = 5000) => {
    showNotification({ title, message, duration, showButtons: true, confirmText: 'OK', type: 'info' });
  }, [showNotification]);

  // Método para diálogos de confirmação
  const showConfirm = useCallback((title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning') => {
    showNotification({ 
      title, 
      message, 
      duration: 0, 
      showButtons: true, 
      confirmText, 
      cancelText, 
      onConfirm, 
      onCancel,
      type
    });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showConfirm
  };
};

export default useNotification;
