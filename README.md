# Personal Portfolio Challenge 🚀

Este repositório foi criado para o Monthly Challenge da Codedex (outubro/2025), com o objetivo de desenvolver e publicar um portfólio pessoal moderno utilizando Next.js e Vercel.

***

## 📋 Sobre o Projeto

- Portfólio interativo, inspirado em terminais, com visual neon minimalista  
- Inclui comandos para visualização automática de informações, projetos, habilidades e contatos  
- Sistema de internacionalização (i18n): suporta português e inglês  
- Integração direta com a API do GitHub para exibir seus projetos em tempo real  
- Frontend via Next.js, React e CSS Modules para total isolamento de estilos  
- Deploy automatizado via Vercel, com push na branch principal disparando o build

***

## 🛠️ Tecnologias Utilizadas

- Next.js 15+
- React
- Vercel
- CSS Modules  
- Docker (opcional, ambiente isolado de desenvolvimento)

***

## 🚀 Como rodar localmente

**Pré-requisitos:** Docker instalado OU Node.js 22+

**Com Docker (recomendado):**

```bash
# Clone o repositório
git clone https://github.com/LKSFerreira/personal-portfolio-challenge.git
cd personal-portfolio-challenge

# Inicie o ambiente de desenvolvimento
docker-compose up

# Acesse http://localhost:3000 no navegador
```

**Sem Docker:**

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000 no navegador
```

***

## 🌐 Principais Rotas

- `/` → Redireciona automaticamente para o terminal interativo
- `/terminal` → Portfólio interativo, comandos como `/ajuda`, `/perfil`, `/projetos`, `/lang en`
- `/api/v1/projetos` → Endpoint que retorna projetos do GitHub em tempo real (JSON)
- `/api/v1/status` → Endpoint healthcheck estático (“ok”)
- Rotas inexistentes → Redirecionam para `/terminal` (experiência fluida)

***

## 💻 Funcionalidades

- Interface interativa via comandos no estilo terminal
- Histórico de comandos e navegação (setas ↑↓)
- Detecção automática de idioma (PT/EN)
- Animações dinâmicas e alta responsividade
- Integração de projetos via API em tempo real
- Totalmente migrado para arquitetura Next.js e React

***

## 🌐 Deploy

O deploy é realizado pela Vercel. Basta importar o repositório diretamente da dashboard Vercel, e o processo de build será automatizado. Toda push na branch principal aciona novo deploy.

***

## 🐳 Desenvolvimento com Docker

Veja todos os comandos essenciais em [docker.md](./docker.md).

***

## 📄 Licença

Este projeto está licenciado sob a licença MIT.

***

Feito com 💙 por [LKSFerreira](https://github.com/LKSFerreira) para o desafio da comunidade Codedex  
Participante do [Monthly Challenge Codedex](https://www.codedex.io/community/monthly-challenge/rxszczV44NOqXn80BC7Y)
