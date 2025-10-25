// pages/terminal/index.js
import { useState, useEffect, useRef } from 'react';
import styles from './terminal.module.css';
import ptBr from '../../locales/pt-br.json';
import en from '../../locales/en.json';

export default function Terminal() {
  // Estados
  const [lang, setLang] = useState('pt-br');
  const [historicoComandos, setHistoricoComandos] = useState([]);
  const [indiceHistorico, setIndiceHistorico] = useState(0);
  const [comando, setComando] = useState('');
  const [saida, setSaida] = useState([]);
  const [palavraDigitacao, setPalavraDigitacao] = useState('');

  // Refs
  const areaSaidaRef = useRef(null);
  const entradaComandoRef = useRef(null);

  // Traduções
  const locales = { 'pt-br': ptBr, 'en': en };
  const translations = locales[lang];

  // Frases de digitação
  const frasesDigitacao = {
    'pt-br': ['Interativo', 'de LKSFerreira', 'feito para você', '/ajuda', '/lang en', '/help'],
    'en': ['Interactive', 'by LKSFerreira', 'made for you', '/help', '/lang pt-br', '/ajuda'],
  };

  // ========== Utilitários ==========

  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const anexarAoTerminal = (texto, tipo = 'info') => {
    setSaida((prev) => [...prev, { texto, tipo, id: Date.now() + Math.random() }]);
  };

  // ========== Animação de Digitação ==========

  useEffect(() => {
    let animacaoAtiva = true;
    let i = 0;

    const animar = async () => {
      setPalavraDigitacao('');

      while (animacaoAtiva) {
        const frases = frasesDigitacao[lang];
        const palavra = frases[i % frases.length];

        // Digitar
        for (let j = 1; j <= palavra.length; j++) {
          if (!animacaoAtiva) return;
          setPalavraDigitacao(' ' + palavra.slice(0, j));
          await new Promise((r) => setTimeout(r, 80));
        }

        await new Promise((r) => setTimeout(r, 1200));

        // Apagar
        for (let j = palavra.length; j >= 0; j--) {
          if (!animacaoAtiva) return;
          setPalavraDigitacao(j > 0 ? ' ' + palavra.slice(0, j) : '');
          await new Promise((r) => setTimeout(r, 40));
        }

        await new Promise((r) => setTimeout(r, 400));
        i++;
      }
    };

    animar();

    return () => {
      animacaoAtiva = false;
    };
  }, [lang]);

  // ========== Scroll Automático ==========

  useEffect(() => {
    if (areaSaidaRef.current) {
      areaSaidaRef.current.scrollTop = areaSaidaRef.current.scrollHeight;
    }
  }, [saida]);

  // ========== Comandos ==========

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
        perfil.contact
          .replace(
            /\(LinkedIn\)/,
            `(<a href="https://www.linkedin.com/in/lksferreira/" target="_blank">LinkedIn</a>)`
          )
          .replace(/\(GitHub\)/, `(<a href="https://github.com/LKSFerreira" target="_blank">GitHub</a>)`),
        'resultado'
      );
    },
    projetos: async () => {
      anexarAoTerminal(translations.projects_title);
      try {
        const response = await fetch('/api/v1/projetos');
        if (!response.ok) {
          throw new Error('Falha ao carregar projetos.');
        }
        const projects = await response.json();

        if (projects.length === 0) {
          anexarAoTerminal('Nenhum projeto encontrado.');
          return;
        }

        projects.forEach((proj) => {
          const projectOutput = `\n<a href="${proj.url}" target="_blank">${proj.name}</a>\n  <span class="project-description">${proj.description}</span>\n  <span class="project-stats"> Linguagem: ${proj.language || 'N/A'} | ★ ${proj.stars}</span>`;
          anexarAoTerminal(projectOutput, 'resultado');
        });
      } catch (error) {
        anexarAoTerminal(`Erro ao buscar projetos: ${error.message}`, 'erro');
      }
    },
    limpar: () => {
      setSaida([]);
    },
    lang: (args) => {
      const novoLang = args[0];
      if (locales[novoLang]) {
        setLang(novoLang);
        anexarAoTerminal(locales[novoLang].lang_changed);
      } else {
        anexarAoTerminal(`Idioma '${novoLang}' não suportado. Use 'pt-br' ou 'en'.`, 'erro');
      }
    },
  };

  const aliasComandos = {
    help: 'ajuda',
    profile: 'perfil',
    projects: 'projetos',
    clear: 'limpar',
  };

  const processarComando = async (entrada) => {
    const partes = entrada.trim().split(' ');
    let comandoBase = partes[0].toLowerCase().replace('/', '');
    const args = partes.slice(1);

    if (aliasComandos[comandoBase]) {
      comandoBase = aliasComandos[comandoBase];
    }

    if (comandos[comandoBase]) {
      await comandos[comandoBase](args);
    } else {
      anexarAoTerminal(`${translations.command_not_found}: ${comandoBase}`, 'erro');
    }
  };

  // ========== Handler de Teclado ==========

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const entrada = comando.trim();
      if (!entrada) return;

      anexarAoTerminal(entrada, 'usuario');
      setHistoricoComandos((prev) => [...prev, entrada]);
      setIndiceHistorico((prev) => prev + 1);

      await processarComando(entrada);

      setComando('');
      entradaComandoRef.current?.focus();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (indiceHistorico > 0) {
        const novoIndice = indiceHistorico - 1;
        setIndiceHistorico(novoIndice);
        setComando(historicoComandos[novoIndice]);
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (indiceHistorico < historicoComandos.length - 1) {
        const novoIndice = indiceHistorico + 1;
        setIndiceHistorico(novoIndice);
        setComando(historicoComandos[novoIndice]);
      } else {
        setIndiceHistorico(historicoComandos.length);
        setComando('');
      }
    }
  };

  // ========== Inicialização ==========

  useEffect(() => {
    anexarAoTerminal(translations.welcome);
    anexarAoTerminal(translations.prompt);
    entradaComandoRef.current?.focus();
  }, []);

  // ========== Renderização ==========

  return (
    <div className={styles.container}>
      <h1>
        <span className={styles.fixedPrefix}>// Portfólio</span>
        <span id="palavra-digitacao" aria-hidden="true">
          {palavraDigitacao}
        </span>
        <span className={styles.simCursor}>▌</span>
      </h1>

      <div ref={areaSaidaRef} className={styles.terminalOutput}>
        {saida.map((item) => {
          if (item.tipo === 'usuario') {
            return (
              <p key={item.id} style={{ whiteSpace: 'pre-wrap' }}>
                <span className={styles.prompt}>{'>'}</span> {escapeHtml(item.texto)}
              </p>
            );
          } else if (item.tipo === 'resultado') {
            return (
              <p key={item.id} style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: item.texto }} />
            );
          } else if (item.tipo === 'erro') {
            return (
              <p key={item.id} style={{ whiteSpace: 'pre-wrap', color: 'var(--error-color)' }}>
                {item.texto}
              </p>
            );
          } else {
            return (
              <p key={item.id} style={{ whiteSpace: 'pre-wrap' }}>
                {item.texto}
              </p>
            );
          }
        })}
      </div>

      <div className={styles.terminalInput}>
        <span className={styles.prompt}>{'>'}</span>
        <input
          type="text"
          ref={entradaComandoRef}
          id="entrada-comando"
          value={comando}
          onChange={(e) => setComando(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando..."
          className={styles.inputComando}
        />
      </div>
    </div>
  );
}
