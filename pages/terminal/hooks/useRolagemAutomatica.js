// pages/terminal/hooks/useRolagemAutomatica.js
import { useEffect } from 'react';

export const useRolagemAutomatica = (areaSaidaRef, saida) => {
  useEffect(() => {
    if (areaSaidaRef.current) {
      areaSaidaRef.current.scrollTop = areaSaidaRef.current.scrollHeight;
    }
  }, [saida, areaSaidaRef]);
};
