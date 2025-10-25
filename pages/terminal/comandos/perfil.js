// pages/terminal/comandos/perfil.js

export const comandoPerfil = (anexarAoTerminal, traducoes) => {
  return () => {
    const perfil = traducoes.profile_content;
    anexarAoTerminal(`## ${perfil.name}`);
    anexarAoTerminal(`**${perfil.title}**`);
    anexarAoTerminal(perfil.about);
    anexarAoTerminal(
      perfil.contact
        .replace(
          /\(LinkedIn\)/,
          `(<a href="https://www.linkedin.com/in/lksferreira/" target="_blank">LinkedIn</a>)`
        )
        .replace(/\(GitHub\)/, `(<a href="https://github.com/LKSFerreira" target="_blank">GitHub</a>)`),
      'resultado'
    );
  };
};
