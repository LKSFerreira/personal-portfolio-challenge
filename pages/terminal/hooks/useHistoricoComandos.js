// pages/terminal/hooks/useHistoricoComandos.js
import { useState } from 'react';

export const useHistoricoComandos = () => {
  const [historicoComandos, definirHistoricoComandos] = useState([]);
  const [indiceHistorico, definirIndiceHistorico] = useState(0);

  const adicionarAoHistorico = (comando) => {
    definirHistoricoComandos((anterior) => [...anterior, comando]);
    definirIndiceHistorico((anterior) => anterior + 1);
  };

  const navegarHistorico = (direcao) => {
    if (direcao === 'cima' && indiceHistorico > 0) {
      const novoIndice = indiceHistorico - 1;
      definirIndiceHistorico(novoIndice);
      return historicoComandos[novoIndice];
    } else if (direcao === 'baixo') {
      if (indiceHistorico < historicoComandos.length - 1) {
        const novoIndice = indiceHistorico + 1;
        definirIndiceHistorico(novoIndice);
        return historicoComandos[novoIndice];
      } else {
        definirIndiceHistorico(historicoComandos.length);
        return '';
      }
    }
    return null;
  };

  return { historicoComandos, adicionarAoHistorico, navegarHistorico };
};
