// script.js
// Gerencia a lógica do terminal interativo para o portfólio.
document.addEventListener("DOMContentLoaded", () => {
  // Elementos DOM
  const areaSaida = document.getElementById("area-saida");
  const entradaComando = document.getElementById("entrada-comando");
  const palavraDigitacao = document.getElementById("palavra-digitacao");

  // Estado do terminal
  const historicoComandos = [];
  let indiceHistorico = 0;
  let lang = "pt-br";
  let translations = window.locales[lang];

  // Configuração
  const alturaMaximaTextareaPx = Math.floor(window.innerHeight * 0.4);

  // ========== Utilitários ==========

  function anexarAoTerminal(texto, tipo = "info") {
    const p = document.createElement("p");
    p.style.whiteSpace = "pre-wrap"; // Garante quebra de linha
    switch (tipo) {
      case "usuario":
        p.innerHTML = `<span class="prompt">></span> ${escapeHtml(texto)}`;
        break;
      case "resultado":
        p.innerHTML = texto; // Usa innerHTML para renderizar links
        break;
      case "erro":
        p.style.color = "var(--error-color)";
        p.textContent = texto;
        break;
      default: // info
        p.textContent = texto;
    }
    areaSaida.appendChild(p);
    areaSaida.scrollTop = areaSaida.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function ajustarAlturaTextarea() {
    entradaComando.style.height = "auto";
    const alturaConteudo = entradaComando.scrollHeight;
    const alturaAplicada = Math.min(alturaConteudo, alturaMaximaTextareaPx);
    entradaComando.style.height = alturaAplicada + "px";
    entradaComando.style.overflowY =
      alturaConteudo > alturaMaximaTextareaPx ? "auto" : "hidden";
  }

  // ========== Animação de Digitação ==========

  let frasesDigitacao = {
    "pt-br": ["Interativo", "de LKSFerreira", "feito para você", "/ajuda", "/lang en", "/help"],
    "en": ["Interactive", "by LKSFerreira", "made for you", "/help", "/lang pt-br", "/ajuda"],
  };
  let animacaoEmExecucao = true;

  async function loopDigitacao() {
    let i = 0;
    palavraDigitacao.textContent = "";
    while (animacaoEmExecucao) {
      const frases = frasesDigitacao[lang];
      const palavra = frases[i % frases.length];
      for (let j = 1; j <= palavra.length; j++) {
        if (!animacaoEmExecucao) return;
        palavraDigitacao.textContent = " " + palavra.slice(0, j);
        await new Promise((r) => setTimeout(r, 80));
      }
      await new Promise((r) => setTimeout(r, 1200));
      for (let j = palavra.length; j >= 0; j--) {
        if (!animacaoEmExecucao) return;
        palavraDigitacao.textContent = j > 0 ? " " + palavra.slice(0, j) : "";
        await new Promise((r) => setTimeout(r, 40));
      }
      await new Promise((r) => setTimeout(r, 400));
      i++;
    }
  }

  // ========== Lógica dos Comandos ==========

  const comandos = {
    ajuda: () => {
      anexarAoTerminal(translations.help_title);
      for (const comando in translations.help_commands) {
        anexarAoTerminal(`  ${translations.help_commands[comando]}`);
      }
    },
    perfil: () => {
      const perfil = translations.profile_content;
      anexarAoTerminal(`## ${perfil.name}`);
      anexarAoTerminal(`**${perfil.title}**`);
      anexarAoTerminal(perfil.about);
      anexarAoTerminal(
        perfil.contact.replace(/\(LinkedIn\)/, `(<a href="https://www.linkedin.com/in/lksferreira/" target="_blank">LinkedIn</a>)`)
          .replace(/\(GitHub\)/, `(<a href="https://github.com/LKSFerreira" target="_blank">GitHub</a>)`),
        "resultado"
      );
    },
    projetos: async () => {
      anexarAoTerminal(translations.projects_title);
      try {
        const response = await fetch("/api/v1/projetos");
        if (!response.ok) {
          throw new Error("Falha ao carregar projetos.");
        }
        const projects = await response.json();

        if (projects.length === 0) {
          anexarAoTerminal("Nenhum projeto encontrado.");
          return;
        }

        projects.forEach(proj => {
          const projectOutput = `\n<a href="${proj.url}" target="_blank">${proj.name}</a>\n  <span class="project-description">${proj.description}</span>\n  <span class="project-stats"> Linguagem: ${proj.language || 'N/A'} | ★ ${proj.stars}</span>`;
          anexarAoTerminal(projectOutput, "resultado");
        });

      } catch (error) {
        anexarAoTerminal(`Erro ao buscar projetos: ${error.message}`, "erro");
      }
    },
    limpar: () => {
      areaSaida.innerHTML = "";
    },
    lang: (args) => {
      const novoLang = args[0];
      if (window.locales[novoLang]) {
        lang = novoLang;
        translations = window.locales[lang];
        anexarAoTerminal(translations.lang_changed);
      } else {
        anexarAoTerminal(`Idioma '${novoLang}' não suportado. Use 'pt-br' ou 'en'.`, "erro");
      }
    },
  };

  const aliasComandos = {
    help: "ajuda",
    profile: "perfil",
    projects: "projetos",
    clear: "limpar",
  };

  async function processarComando(entrada) {
    const partes = entrada.trim().split(" ");
    let comandoBase = partes[0].toLowerCase().replace("/", "");
    const args = partes.slice(1);

    // Verifica se é um alias
    if (aliasComandos[comandoBase]) {
      comandoBase = aliasComandos[comandoBase];
    }

    if (comandos[comandoBase]) {
      await comandos[comandoBase](args);
    } else {
      anexarAoTerminal(`${translations.command_not_found}: ${comandoBase}`, "erro");
    }
  }

  // ========== Inicialização e Eventos ==========

  function inicializarTerminal() {
    anexarAoTerminal(translations.welcome);
    anexarAoTerminal(translations.prompt);
    entradaComando.disabled = false;
    entradaComando.placeholder = "Digite um comando...";
    entradaComando.focus();
    ajustarAlturaTextarea();
    loopDigitacao();
  }

  entradaComando.addEventListener("input", ajustarAlturaTextarea);

  entradaComando.addEventListener("keydown", async (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      const entrada = entradaComando.value;
      if (!entrada.trim()) return;

      anexarAoTerminal(entrada, "usuario");
      historicoComandos.push(entrada);
      indiceHistorico = historicoComandos.length;

      await processarComando(entrada);

      entradaComando.value = "";
      ajustarAlturaTextarea();
      entradaComando.focus();
    }

    // Histórico
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      if (indiceHistorico > 0) {
        indiceHistorico--;
        entradaComando.value = historicoComandos[indiceHistorico];
        ajustarAlturaTextarea();
      }
    } else if (evento.key === "ArrowDown") {
      evento.preventDefault();
      if (indiceHistorico < historicoComandos.length - 1) {
        indiceHistorico++;
        entradaComando.value = historicoComandos[indiceHistorico];
      } else {
        indiceHistorico = historicoComandos.length;
        entradaComando.value = "";
      }
      ajustarAlturaTextarea();
    }
  });

  inicializarTerminal();
});
