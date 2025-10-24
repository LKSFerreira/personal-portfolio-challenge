// pages/api/v1/projetos/index.js
// Endpoint para buscar e retornar os projetos do GitHub.

export default async function handler(req, res) {
  const GITHUB_USERNAME = "LKSFerreira";
  const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc`;

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        // Para evitar rate limiting em desenvolvimento, considere usar um token de acesso pessoal.
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar dados do GitHub: ${response.statusText}`);
    }

    const allRepos = await response.json();

    // Filtra e mapeia os repositórios para enviar apenas os dados necessários.
    const projects = allRepos
      // Filtra repositórios que não são forks
      .filter(repo => !repo.fork)
      // Mapeia para a estrutura de dados desejada
      .map(repo => ({
        name: repo.name,
        description: repo.description || "Sem descrição.",
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        updated_at: repo.updated_at,
      }));

    res.status(200).json(projects);

  } catch (error) {
    console.error("Erro no endpoint /api/v1/projetos:", error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar projetos." });
  }
}
