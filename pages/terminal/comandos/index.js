// pages/terminal/comandos/index.js

import { comandoAjuda } from './ajuda';
import { comandoPerfil } from './perfil';
import { comandoProjetos } from './projetos';
import { comandoLimpar } from './limpar';
import { comandoIdioma } from './idioma';
import { aliasesComandos } from './aliases';

export const criarComandos = (dependencias) => {
  const { anexarAoTerminal, traducoes, definirIdioma, definirSaida, locales } = dependencias;

  return {
    ajuda: comandoAjuda(anexarAoTerminal, traducoes),
    perfil: comandoPerfil(anexarAoTerminal, traducoes),
    projetos: comandoProjetos(anexarAoTerminal, traducoes),
    limpar: comandoLimpar(definirSaida),
    lang: comandoIdioma(definirIdioma, anexarAoTerminal, locales),
  };
};

export { aliasesComandos };
