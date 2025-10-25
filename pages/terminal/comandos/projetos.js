// pages/terminal/comandos/projetos.js

export const comandoProjetos = (anexarAoTerminal, traducoes) => {
  return async () => {
    anexarAoTerminal(traducoes.projects_title);
    try {
      const resposta = await fetch('/api/v1/projetos');
      if (!resposta.ok) {
        throw new Error('Falha ao carregar projetos.');
      }
      const projetos = await resposta.json();

      if (projetos.length === 0) {
        anexarAoTerminal('Nenhum projeto encontrado.');
        return;
      }

      projetos.forEach((projeto) => {
        const saidaProjeto = `\n<a href="${projeto.url}" target="_blank">${projeto.name}</a>\n  <span class="project-description">${projeto.description}</span>\n  <span class="project-stats"> Linguagem: ${projeto.language || 'N/A'} | ★ ${projeto.stars}</span>`;
        anexarAoTerminal(saidaProjeto, 'resultado');
      });
    } catch (erro) {
      anexarAoTerminal(`Erro ao buscar projetos: ${erro.message}`, 'erro');
    }
  };
};
