// pages/terminal/comandos/ajuda.js

export const comandoAjuda = (anexarAoTerminal, traducoes) => {
  return () => {
    anexarAoTerminal(traducoes.help_title);
    for (const comando in traducoes.help_commands) {
      anexarAoTerminal(`  ${traducoes.help_commands[comando]}`);
    }
  };
};
