// pages/terminal/comandos/idioma.js

export const comandoIdioma = (definirIdioma, anexarAoTerminal, locales) => {
  return (argumentos) => {
    const novoIdioma = argumentos[0];
    if (locales[novoIdioma]) {
      definirIdioma(novoIdioma);
      anexarAoTerminal(locales[novoIdioma].lang_changed);
    } else {
      anexarAoTerminal(`Idioma '${novoIdioma}' não suportado. Use 'pt-br' ou 'en'.`, 'erro');
    }
  };
};
