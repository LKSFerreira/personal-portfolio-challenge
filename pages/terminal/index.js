// pages/terminal/index.js
import { useState, useEffect, useRef } from 'react';
import styles from './terminal.module.css';
import ptBr from '../../locales/pt-br.json';
import en from '../../locales/en.json';
import { criarComandos, aliasesComandos } from './comandos';
import { escaparHtml } from './utils/escaparHtml';
import { useDeteccaoIdioma } from './hooks/useDeteccaoIdioma';
import { useAnimacaoDigitacao } from './hooks/useAnimacaoDigitacao';
import { useHistoricoComandos } from './hooks/useHistoricoComandos';
import { useRolagemAutomatica } from './hooks/useRolagemAutomatica';

export default function Terminal() {
  // Estados
  const [idioma, definirIdioma] = useDeteccaoIdioma();
  const [comando, definirComando] = useState('');
  const [saida, definirSaida] = useState([]);

  // Hooks customizados
  const palavraDigitacao = useAnimacaoDigitacao(idioma);
  const { historicoComandos, adicionarAoHistorico, navegarHistorico } = useHistoricoComandos();

  // Refs
  const areaSaidaRef = useRef(null);
  const entradaComandoRef = useRef(null);

  // Scroll automático
  useRolagemAutomatica(areaSaidaRef, saida);

  // Traduções
  const locales = { 'pt-br': ptBr, 'en': en };
  const traducoes = locales[idioma];

  // ========== Utilitários ==========

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
      anexarAoTerminal('\n');
    } else {
      anexarAoTerminal(`${traducoes.command_not_found}: ${comandoBase}`, 'erro');
      anexarAoTerminal('\n');
    }
  };

  // ========== Handler de Teclado ==========

  const manipularTecla = async (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      const entrada = comando.trim();
      if (!entrada) return;

      anexarAoTerminal(entrada, 'usuario');
      adicionarAoHistorico(entrada);
      await processarComando(entrada);
      definirComando('');
      entradaComandoRef.current?.focus();
    }

    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      const comandoHistorico = navegarHistorico('cima');
      if (comandoHistorico !== null) {
        definirComando(comandoHistorico);
      }
    }

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      const comandoHistorico = navegarHistorico('baixo');
      if (comandoHistorico !== null) {
        definirComando(comandoHistorico);
      }
    }
  };

// ========== Inicialização ==========

useEffect(() => {
  // Limpa saídas anteriores para evitar duplicação
  definirSaida([]);
  
  // Adiciona mensagens de boas-vindas no idioma detectado
  anexarAoTerminal(traducoes.welcome);
  anexarAoTerminal(traducoes.prompt);
  
  // Foca no input
  entradaComandoRef.current?.focus();
}, [idioma]); // ✅ Observa mudanças no idioma


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
