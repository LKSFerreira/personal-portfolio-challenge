// pages/terminal/hooks/useAnimacaoDigitacao.js
import { useState, useEffect } from 'react';

export const useAnimacaoDigitacao = (idioma) => {
  const [palavraDigitacao, definirPalavraDigitacao] = useState('');

  const frasesDigitacao = {
    'pt-br': ['Interativo', 'de LKSFerreira', 'feito para você', '/ajuda', '/lang en', '/help'],
    'en': ['Interactive', 'by LKSFerreira', 'made for you', '/help', '/lang pt-br', '/ajuda'],
  };

  useEffect(() => {
    let animacaoAtiva = true;
    let indice = 0;

    const animar = async () => {
      definirPalavraDigitacao('');

      while (animacaoAtiva) {
        const frases = frasesDigitacao[idioma];
        const palavra = frases[indice % frases.length];

        // Digitar
        for (let j = 1; j <= palavra.length; j++) {
          if (!animacaoAtiva) return;
          definirPalavraDigitacao(' ' + palavra.slice(0, j));
          await new Promise((resolver) => setTimeout(resolver, 80));
        }

        await new Promise((resolver) => setTimeout(resolver, 1200));

        // Apagar
        for (let j = palavra.length; j >= 0; j--) {
          if (!animacaoAtiva) return;
          definirPalavraDigitacao(j > 0 ? ' ' + palavra.slice(0, j) : '');
          await new Promise((resolver) => setTimeout(resolver, 40));
        }

        await new Promise((resolver) => setTimeout(resolver, 400));
        indice++;
      }
    };

    animar();

    return () => {
      animacaoAtiva = false;
    };
  }, [idioma]);

  return palavraDigitacao;
};
