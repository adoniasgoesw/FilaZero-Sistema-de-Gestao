import { useState, useEffect } from 'react';

export const useTempoAtividade = (criadoEm) => {
  const [tempoAtividade, setTempoAtividade] = useState('');

  useEffect(() => {
    if (!criadoEm) {
      setTempoAtividade('0min');
      return;
    }

    const calcularTempo = () => {
      const agora = new Date();
      const criado = new Date(criadoEm);
      const diffMs = agora - criado;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      
      if (diffMin < 1) {
        setTempoAtividade('Agora');
      } else if (diffMin < 60) {
        setTempoAtividade(`${diffMin}min`);
      } else {
        const horas = Math.floor(diffMin / 60);
        const min = diffMin % 60;
        setTempoAtividade(`${horas}h ${min}min`);
      }
    };

    calcularTempo();
    const interval = setInterval(calcularTempo, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [criadoEm]);

  return tempoAtividade;
};
