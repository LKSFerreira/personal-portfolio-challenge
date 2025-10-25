// pages/terminal/hooks/useDeteccaoIdioma.js
import { useState, useEffect } from 'react';

export const useDeteccaoIdioma = () => {
  const [idioma, definirIdioma] = useState('en'); // Default para inglês

  useEffect(() => {
    // Detecta o idioma do navegador
    const idiomaNavegador = navigator.language || navigator.userLanguage;
    
    // Se o idioma for português (pt, pt-BR, pt-PT), usa pt-br
    if (idiomaNavegador.toLowerCase().startsWith('pt')) {
      definirIdioma('pt-br');
    } else {
      definirIdioma('en');
    }
  }, []);

  return [idioma, definirIdioma];
};
