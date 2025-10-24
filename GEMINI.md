# Log de Interação Gemini

## Nova Missão: Portfólio Interativo em Terminal

O objetivo do projeto foi redefinido para criar um portfólio pessoal com uma interface de linha de comando (CLI), abandonando a ideia original de um terminal Python com Pyodide. A meta é entregar uma experiência de usuário única e criativa, alinhada ao desafio "Main Character Energy".

### Requisitos Principais

1.  **Interface de Terminal:** A navegação será baseada em comandos digitados pelo usuário.
2.  **Estética Hacker:** Manter o layout e a identidade visual de terminal já existentes.
3.  **Internacionalização (i18n):**
    *   Suporte para Português (pt-br) como idioma principal e Inglês (en) como secundário.
    *   O código-fonte (variáveis, comentários) será mantido em `pt-br`.
4.  **Comandos:**
    *   `/ajuda` ou `/help`: Lista os comandos disponíveis.
    *   `/perfil` ou `/profile`: Exibe informações do perfil (Sobre Mim, Habilidades, Contato).
    *   `/projetos` ou `/projects`: Busca e exibe os projetos do GitHub.
    *   `/lang <idioma>`: Altera o idioma da interface (`pt-br` ou `en`).
    *   `/limpar` ou `/clear`: Limpa o conteúdo do terminal.
5.  **Flexibilidade:** A estrutura de exibição dos dados deve ser modular e fácil de modificar.

### Plano de Ação

1.  **Reestruturação:**
    *   Renomear a pasta `pyodide` para `terminal`.
    *   Remover toda a lógica do Pyodide do arquivo `terminal/script.js`.
2.  **Internacionalização (i18n):**
    *   Criar a pasta `locales` com os arquivos `pt-br.json` e `en.json`.
    *   Implementar a lógica para carregar e trocar os idiomas.
3.  **Implementação dos Comandos:**
    *   Desenvolver o parser de comandos em `terminal/script.js`.
    *   Criar um objeto ou `Map` para associar os comandos às suas respectivas funções.
    *   Implementar as funções para cada comando (`/ajuda`, `/perfil`, `/lang`, `/limpar`).
4.  **Integração com GitHub API:**
    *   Criar um novo endpoint na API do Next.js (`pages/api/v1/projects.js`).
    *   Este endpoint fará a chamada segura para a API do GitHub para buscar os repositórios públicos.
    *   Implementar o comando `/projetos` para consumir este endpoint e exibir os dados.
5.  **Componentização da Saída:**
    *   Criar funções auxiliares para renderizar diferentes tipos de conteúdo (títulos, listas, texto) no terminal, garantindo um código mais limpo e fácil de manter.

---

## Padrão de Commits
 
Utilize o seguinte padrão para as mensagens de commit, incluindo o emoji correspondente para facilitar a identificação do tipo de alteração:
 
- 🎉 `:tada: Commit inicial`
- 📚 `:books: docs: Atualização do README`
- 🐛 `:bug: fix: Loop infinito na linha 50`
- ✨ `:sparkles: feat: Página de login`
- 🧱 `:bricks: ci: Modificação no Dockerfile`
- ♻️ `:recycle: refactor: Passando para arrow functions`
- ⚡ `:zap: performance: Melhoria no tempo de resposta`
- 💥 `:boom: fix: Revertendo mudanças ineficientes`
- 💄 `:lipstick: feat: Estilização CSS do formulário`
- 🧪 `:test_tube: test: Criando novo teste`
- 💡 `:bulb: docs: Comentários sobre a função LoremIpsum()`
- 🗃️ `:card_file_box: raw: RAW Data do ano aaaa`
- 🧹 `:broom: cleanup: Eliminando blocos de código comentados e variáveis não utilizadas`
- 🗑️ `:wastebasket: remove: Removendo arquivos não utilizados do projeto`
 
> Imporante: Os commits devem ser individuais e atômicos, exceto em casos no qual a alteração/adição/remoção seja identica ou muito similar, nesses casos é permitido agrupar o commit em lotes.
 
---
 
## Padrão de Código
 
Todo o código (nomes de variáveis, funções, classes, métodos, etc.) deve ser escrito em **Português do Brasil (pt-br)**. A escrita deve ser clara, legível e **sem o uso de abreviações**, visando a máxima compreensibilidade do código.
 
---
 
## Análise de Código
 
Ao realizar a leitura e análise do projeto para obter contexto, todos os arquivos e diretórios listados no arquivo `.gitignore` devem ser ignorados.