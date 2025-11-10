'Use Strict'

/**
 * @module 🧩 ambiente.js
 * @project 📘 AI Game Learning
 *
 * Este módulo define o ambiente para o Jogo da Velha (Tic-Tac-Toe).
 * No paradigma de Aprendizado por Reforço (Reinforcement Learning),
 * este código representa o "Environment".
 *
 * A classe principal, `AmbienteJogoDaVelha`, é responsável por:
 * - Manter e gerenciar o estado do tabuleiro.
 * - Processar e validar as ações (jogadas) dos jogadores.
 * - Verificar o fim da partida (vitória, derrota ou empate).
 * - Fornecer recompensas com base no resultado da partida.
 *
 * 💡 Totalmente implementado em JavaScript puro, sem dependências externas.
 */

export class AmbienteJogoDaVelha {
  /**
   * Representa o ambiente completo do Jogo da Velha, com suporte a tabuleiros
   * de tamanh N x N (Mínimo de 3x3 até 9x9).
   * 
   * O estado do tabuleiro é um array onde:
   * - 0 representa uma casa vazia.
   * - 1 represeta o jogador 'X'.
   * - 2 representa o jogador 'O'.
   * 
   * @param {number} [dimensao = 3] - Tamanho do tabuleiro (entre 3 e 9)
   * @throws {Error} Se o tamanho for fora dos limites permitidos.
   */

  constructor(dimensao = 3) {
    if (dimensao < 3 || dimensao > 9) {
      throw new Error("O tamanho do tabuleiro deve estar entre 3 e 9");
    }

    /** @type {number} */
    this.dimensao = dimensao;

    /** @type {number} */
    this.numeroDeCasas = dimensao * dimensao;

    /** @type {number} */
    this.jogadorInicial = 1 // Significa que o jogado 'X' sempre inicia a partida

    /** @type {Array<Array<number>>} */
    this.combinacoesDeVitoria = this.#gerarCombinacoesDeVitoria();

    this.reiniciarPartida();
  }

  /**
   * Gera todas as combinações vencedoras para o tabuleiro atual.
   * Condição para vitória: Completar uma linha ou uma coluna ou uma diagonal.
   * 
   * @returns {Array<Array<number>>} - Retorna uma lista de combinações de vitória de acordo
   * com tamanho do tabuleiro.
   * 
   * @private
   */
  #gerarCombinacoesDeVitoria() {
    const combinacoesDeVitoria = [];

    // 1️⃣ Linhas
    for (let i = 0; i < this.numeroDeCasas; i += this.dimensao) {
      combinacoesDeVitoria.push([...Array(this.dimensao).keys()].map(j => i + j));
    }

    // 2️⃣ Colunas
    for (let i = 0; i < this.dimensao; i++) {
      combinacoesDeVitoria.push([...Array(this.dimensao).keys()].map(j => i + j * this.dimensao));
    }

    // 3️⃣ Diagonal principal
    combinacoesDeVitoria.push([...Array(this.dimensao).keys()].map(j => (j * (this.dimensao + 1))));


    // 4️⃣ Diagonal secundária
    combinacoesDeVitoria.push([...Array(this.dimensao).keys()].map(j => (j + 1) * (this.dimensao - 1)));

    return combinacoesDeVitoria;
  }

  /**
   * Reinicia o jogo, limpando o tabuleiro e resetando as variáveis internas.
   * 
   * @returns {number[]} O estado inicial do tabuleiro (vetor de zeros).
   */
  reiniciarPartida() {
    /** @type {number[]} */
    this.tabuleiro = Array(this.numeroDeCasas).fill(0);

    /** @type {number} */
    this.jogadorAtual = this.jogadorInicial;

    /** @type {bollean} */
    this.partidaFinalizada = false;

    /** @type {nmber | null} */
    this.vencedor = null;

    return this.obterEstado();
  }

  /**
   * Retorna uma cópia do estado atual do tabuleiro.
   * 
   * @returns {number[]} Estado atual do tabuleiro.
   */
  obterEstado() {
    return [...this.tabuleiro];
  }

  /**
   * Retorna uma lista de índices de todas as jogadas possíveis.
   * 
   * @returns {number[]} Lista de casas vazias.
   */

  obterAcoesValidas() {
    return this.tabuleiro.map((valor, i) => (valor === 0 ? i : null)).filter(i => i !== null);
  }

  /**
   * Retorna o estado como tupla (imutável).
   * 
   * @return {ReadonlyArray<number>} Versão imutável do estado.
   */
  obterEstadoImutavel() {
    return Object.freeze([...this.tabuleiro]);
  }

  /**
   * Executa uma jogada no ambiente.
   * 
   * @param {number} acao - ìndice da casa vazia (0 a N²-1).
   * @return {[number[], number, boolean]} Uma tupla que representa respectivamente:
   * - Próximo estado,
   * - Recompensa,
   * - Indicador de Fim de Partida.
   * 
   * @throws {Error} Se a jogada for inválida.
   */
  executarJogada(acao) {
    if (this.tabuleiro[acao] !== 0) {
      throw new Error(`Ação inválida: posição ${acao} ocupada.`);
    }

    if (this.partidaFinalizada) {
      throw new Error("Partida finalizada");
    }

    // Insere a jogada no tabuleiro
    this.tabuleiro[acao] = this.jogadorAtual;

    let recompensa = 0.0;

    // Verifica vitória
    if (this.#verificarVitoria(this.jogadorAtual)) {
      this.partidaFinalizada = true;
      this.vencedor = this.jogadorAtual;
      recompensa = 1.0
    } else if (this.obterAcoesValidas().length === 0) { // Verificando empate
      this.partidaFinalizada = true;
      this.vencedor = 0; // Atribuimos 0 ao vencedor pois não existe jogador 0.
    }

    this.#trocarJogador();
    return [this.obterEstado(), recompensa, this.partidaFinalizada];
  }

  /**
   * Verifica se o jogador atuall venceu.
   * 
   * @param {number} jogador - 1 ('X') ou 2 ('O')
   * @returns {boolean} - True se venceu.
   * @private
   */
  #verificarVitoria(jogador) {
    return this.combinacoesDeVitoria.some(combinacao =>
      combinacao.every(casa => this.tabuleiro[casa] === jogador));
  }

  /**
   * Altera o jogador atual
   * @private
   */
  #trocarJogador() {
    this.jogadorAtual = this.jogadorAtual === 1 ? 2 : 1;
  }

  /**
   * Exibe o tabuleiro no formato console.
   */
  exibirTabuleiro() {
    const simbolos = {
      0: " ",
      1: "X",
      2: "O"
    }

    console.log();

    for (let i = 0; i < this.dimensao; i++) {
      const linha = this.tabuleiro
        .slice(i * this.dimensao, (i + 1) * this.dimensao)
        .map(item => simbolos[item]);

      console.log(" " + linha.join(" │ "));
      if (i < this.dimensao - 1) {
        console.log("───" + "┼───".repeat(this.dimensao - 1));
      }
    }
    console.log();
  }
}
