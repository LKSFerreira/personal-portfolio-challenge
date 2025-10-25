// pages/terminal/comandos/limpar.js

export const comandoLimpar = (definirSaida) => {
  return () => {
    definirSaida([]);
  };
};
