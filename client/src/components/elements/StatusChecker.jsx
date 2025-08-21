import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import useNotification from './useNotification.js';

const StatusChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { showInfo } = useNotification();

  useEffect(() => {
    const checkUserStatus = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        setIsChecking(true);
        const response = await api.get(`/usuarios/${userId}`);
        const user = response.data.usuario;

        // Se o usuário foi desativado, mostra notificação e redireciona
        if (!user.status) {
          showInfo(
            'Conta Desativada',
            'Sua conta foi desativada. Entre em contato com o administrador para reativá-la.',
            0 // Não fecha automaticamente
          );
          
          // Limpa localStorage e redireciona para login
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        console.error('Erro ao verificar status do usuário:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Verifica status a cada 30 segundos
    const interval = setInterval(checkUserStatus, 30000);
    
    // Verifica status inicial
    checkUserStatus();

    return () => clearInterval(interval);
  }, [showInfo]);

  // Não renderiza nada visualmente
  return null;
};

export default StatusChecker;
