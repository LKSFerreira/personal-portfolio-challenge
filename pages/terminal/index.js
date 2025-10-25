// pages/terminal/index.js
import { useState, useEffect, useRef } from 'react';
import styles from './terminal.module.css';
import ptBr from '../../locales/pt-br.json';
import en from '../../locales/en.json';
import { criarComandos, aliasesComandos } from './comandos';

export default function Terminal() {
  // Estados
  const [idioma, definirIdioma] = useState('pt-br');
  const [historicoComandos, definirHistoricoComandos] = useState([]);
  const [indiceHistorico, definirIndiceHistorico] = useState(0);
  const [comando, definirComando] = useState('');
  const [saida, definirSaida] = useState([]);
  const [palavraDigitacao, definirPalavraDigitacao] = useState('');

  // Refs
  const areaSaidaRef = useRef(null);
  const entradaComandoRef = useRef(null);

  // Traduções
  const locales = { 'pt-br': ptBr, 'en': en };
  const traducoes = locales[idioma];

  // Frases de digitação
  const frasesDigitacao = {
    'pt-br': ['Interativo', 'de LKSFerreira', 'feito para você', '/ajuda', '/lang en', '/help'],
    'en': ['Interactive', 'by LKSFerreira', 'made for you', '/help', '/lang pt-br', '/ajuda'],
  };

  // ========== Utilitários ==========

  const escaparHtml = (texto) => {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const anexarAoTerminal = (texto, tipo = 'info') => {
    definirSaida((anterior) => [...anterior, { texto, tipo, id: Date.now() + Math.random() }]);
  };

  // ========== Comandos ==========

  const comandos = criarComandos({
    anexarAoTerminal,
    traducoes,
    definirIdioma,
    definirSaida,
    locales,
  });

  const processarComando = async (entrada) => {
    const partes = entrada.trim().split(' ');
    let comandoBase = partes[0].toLowerCase().replace('/', '');
    const argumentos = partes.slice(1);

    if (aliasesComandos[comandoBase]) {
      comandoBase = aliasesComandos[comandoBase];
    }

    if (comandos[comandoBase]) {
      await comandos[comandoBase](argumentos);
      // Adiciona uma linha em branco após a execução do comando
      anexarAoTerminal('\n');
    } else {
      anexarAoTerminal(`${traducoes.command_not_found}: ${comandoBase}`, 'erro');
      // Adiciona uma linha em branco após mensagem de erro
      anexarAoTerminal('\n');
    }
  };


  // ========== Animação de Digitação ==========

  useEffect(() => {
    let animacaoAtiva = true;
    let indice = 0;

    const animar = async () => {
      definirPalavraDigitacao('');

      while (animacaoAtiva) {
        const frases = frasesDigitacao[idioma];
        const palavra = frases[indice % frases.length];

        // Digitar
        for (let j = 1; j <= palavra.length; j++) {
          if (!animacaoAtiva) return;
          definirPalavraDigitacao(' ' + palavra.slice(0, j));
          await new Promise((resolver) => setTimeout(resolver, 80));
        }

        await new Promise((resolver) => setTimeout(resolver, 1200));

        // Apagar
        for (let j = palavra.length; j >= 0; j--) {
          if (!animacaoAtiva) return;
          definirPalavraDigitacao(j > 0 ? ' ' + palavra.slice(0, j) : '');
          await new Promise((resolver) => setTimeout(resolver, 40));
        }

        await new Promise((resolver) => setTimeout(resolver, 400));
        indice++;
      }
    };

    animar();

    return () => {
      animacaoAtiva = false;
    };
  }, [idioma]);

  // ========== Scroll Automático ==========

  useEffect(() => {
    if (areaSaidaRef.current) {
      areaSaidaRef.current.scrollTop = areaSaidaRef.current.scrollHeight;
    }
  }, [saida]);

  // ========== Handler de Teclado ==========

  const manipularTecla = async (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      const entrada = comando.trim();
      if (!entrada) return;

      anexarAoTerminal(entrada, 'usuario');
      definirHistoricoComandos((anterior) => [...anterior, entrada]);
      definirIndiceHistorico((anterior) => anterior + 1);

      await processarComando(entrada);

      definirComando('');
      entradaComandoRef.current?.focus();
    }

    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (indiceHistorico > 0) {
        const novoIndice = indiceHistorico - 1;
        definirIndiceHistorico(novoIndice);
        definirComando(historicoComandos[novoIndice]);
      }
    }

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      if (indiceHistorico < historicoComandos.length - 1) {
        const novoIndice = indiceHistorico + 1;
        definirIndiceHistorico(novoIndice);
        definirComando(historicoComandos[novoIndice]);
      } else {
        definirIndiceHistorico(historicoComandos.length);
        definirComando('');
      }
    }
  };

  // ========== Inicialização ==========

  useEffect(() => {
    anexarAoTerminal(traducoes.welcome);
    anexarAoTerminal(traducoes.prompt);
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
                <span className={styles.prompt}>{'>'}</span> {escaparHtml(item.texto)}
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
          onChange={(evento) => definirComando(evento.target.value)}
          onKeyDown={manipularTecla}
          placeholder="Digite um comando..."
          className={styles.inputComando}
        />
      </div>
    </div>
  );
}
