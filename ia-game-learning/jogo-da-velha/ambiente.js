/**
 * @Modulo 🧩 jogo-da-velha/ambiente.js
 * @Projeto 📘 AI Game Learning
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
 */

/**
 * Representa o ambiente completo do Jogo da Velha, com suporte a tabuleiros
 * de tamanho N x N (Mínimo de 3x3 até 9x9).
 * 
 * É como a "arena" ou "mapa" no Ragnarok onde as batalhas acontecem.
 * O ambiente mantém as regras do jogo e garante que tudo funcione corretamente.
 * 
 * O estado do tabuleiro é um array onde:
 * - 0 representa uma casa vazia
 * - 1 representa o jogador 'X'
 * - 2 representa o jogador 'O'
 * 
 * @property {number} dimensao - Tamanho do tabuleiro (NxN)
 * @property {number} numeroDeCasas - Total de casas no tabuleiro
 * @property {number} jogadorInicial - Jogador que inicia (sempre 1/'X')
 * @property {Array<Array<number>>} combinacoesDeVitoria - Todas as combinações vencedoras possíveis
 * @property {Array<number>} tabuleiro - Estado atual do tabuleiro
 * @property {number} jogadorAtual - Jogador da vez (1 ou 2)
 * @property {boolean} partidaFinalizada - Indica se a partida terminou
 * @property {number|null} vencedor - Vencedor da partida (1, 2 ou 0 para empate)
 */
export class AmbienteJogoDaVelha {
  /**
   * Inicializa o ambiente do jogo.
   * 
   * É como criar uma nova "sala de batalha" no Ragnarok com um mapa específico.
   * 
   * @param {number} [dimensao=3] - Tamanho do tabuleiro (entre 3 e 9). Padrão é 3
   * @throws {Error} Se o tamanho for fora dos limites permitidos
   */
  constructor(dimensao = 3) {
    if (dimensao < 3 || dimensao > 9) {
      throw new Error("O tamanho do tabuleiro deve estar entre 3 e 9.");
    }

    this.dimensao = dimensao;
    this.numeroDeCasas = dimensao * dimensao;
    this.jogadorInicial = 1; // Significa que o jogador 'X' sempre inicia

    this.combinacoesDeVitoria = this.#gerarCombinacoesDeVitoria();

    this.reiniciarPartida();
  }

  /**
   * Gera todas as combinações vencedoras para o tabuleiro atual.
   * 
   * Condição para vitória: Completar uma linha, uma coluna ou uma diagonal.
   * É como mapear todas as "rotas de vitória" possíveis no tabuleiro.
   * 
   * @private
   * @returns {Array<Array<number>>} Uma lista de listas com todas as combinações de vitória
   */
  #gerarCombinacoesDeVitoria() {
    const combinacoes = [];

    // 1️⃣ Linhas (horizontais)
    for (let i = 0; i < this.numeroDeCasas; i += this.dimensao) {
      const linha = [];
      for (let j = 0; j < this.dimensao; j++) {
        linha.push(i + j);
      }
      combinacoes.push(linha);
    }

    // 2️⃣ Colunas (verticais)
    for (let i = 0; i < this.dimensao; i++) {
      const coluna = [];
      for (let j = 0; j < this.dimensao; j++) {
        coluna.push(i + j * this.dimensao);
      }
      combinacoes.push(coluna);
    }

    // 3️⃣ Diagonal principal (↘)
    const diagonalPrincipal = [];
    for (let i = 0; i < this.dimensao; i++) {
      diagonalPrincipal.push(i * (this.dimensao + 1));
    }
    combinacoes.push(diagonalPrincipal);

    // 4️⃣ Diagonal secundária (↙)
    const diagonalSecundaria = [];
    for (let i = 0; i < this.dimensao; i++) {
      diagonalSecundaria.push((i + 1) * (this.dimensao - 1));
    }
    combinacoes.push(diagonalSecundaria);

    return combinacoes;
  }

  /**
   * Reinicia o jogo, limpando o tabuleiro e resetando as variáveis internas.
   * 
   * É como iniciar uma nova partida no Ragnarok: tudo volta ao estado inicial.
   * O jogador inicial é escolhido aleatoriamente entre X e O.
   * 
   * @returns {Array<number>} O estado inicial do tabuleiro (vetor de zeros)
   */
  reiniciarPartida() {
    this.tabuleiro = new Array(this.numeroDeCasas).fill(0);
    this.jogadorAtual = Math.random() < 0.5 ? 1 : 2;
    this.partidaFinalizada = false;
    this.vencedor = null;
    return this.obterEstado();
  }

  /**
   * Retorna uma cópia do estado atual do tabuleiro.
   * 
   * É como tirar uma "foto" do estado atual da arena. A cópia evita
   * que modificações externas afetem o estado real do jogo.
   * 
   * @returns {Array<number>} Estado atual do tabuleiro
   */
  obterEstado() {
    return [...this.tabuleiro];
  }

  /**
   * Retorna uma lista de índices de todas as jogadas possíveis.
   * 
   * É como identificar todas as "posições vazias" onde um jogador
   * pode se posicionar no campo de batalha.
   * 
   * @returns {Array<number>} Lista de casas vazias (índices onde tabuleiro === 0)
   */
  obterAcoesValidas() {
    return this.tabuleiro
      .map((valor, indice) => (valor === 0 ? indice : null))
      .filter(indice => indice !== null);
  }

  /**
   * Retorna o estado como tupla (string imutável), essencial para a Q-Table.
   * 
   * Em JavaScript, usamos strings JSON como chave imutável para objetos.
   * É como criar um "ID único" para cada configuração possível do tabuleiro.
   * 
   * @returns {string} Versão imutável do estado (JSON stringificado)
   */
  obterEstadoComoTupla() {
    return JSON.stringify(this.tabuleiro);
  }

  /**
   * Executa uma jogada no ambiente.
   * 
   * É como um jogador fazer um movimento no campo de batalha: o ambiente
   * processa a ação, atualiza o estado, verifica se alguém ganhou e
   * retorna as informações necessárias para o aprendizado.
   * 
   * @param {number} acao - Índice da casa vazia (0 a N²-1)
   * @returns {[Array<number>, number, boolean]} Tupla com [próximo_estado, recompensa, partida_finalizada]
   * @throws {Error} Se a jogada for inválida ou a partida já terminou
   */
  executarJogada(acao) {
    if (this.tabuleiro[acao] !== 0) {
      throw new Error(`Ação inválida: posição ${acao} ocupada.`);
    }
    if (this.partidaFinalizada) {
      throw new Error("Partida finalizada.");
    }

    this.tabuleiro[acao] = this.jogadorAtual;
    let recompensa = 0.0;

    if (this.#verificarVitoria(this.jogadorAtual)) {
      this.partidaFinalizada = true;
      this.vencedor = this.jogadorAtual;
      recompensa = 1.0;
    } else if (this.obterAcoesValidas().length === 0) {
      this.partidaFinalizada = true;
      this.vencedor = 0; // 0 significa empate
      // Mantemos a recompensa em 0.0 para empate
    }

    this.#trocarJogador();
    return [this.obterEstado(), recompensa, this.partidaFinalizada];
  }

  /**
   * Verifica se o jogador atual venceu.
   * 
   * Percorre todas as combinações de vitória e verifica se o jogador
   * completou alguma delas. É como verificar se alguém capturou todos
   * os objetivos necessários para vencer a WoE no Ragnarok.
   * 
   * @private
   * @param {number} jogador - 1 ('X') ou 2 ('O')
   * @returns {boolean} True se venceu, False caso contrário
   */
  #verificarVitoria(jogador) {
    return this.combinacoesDeVitoria.some(combinacao =>
      combinacao.every(casa => this.tabuleiro[casa] === jogador)
    );
  }

  /**
   * Altera o jogador atual.
   * 
   * É como passar o turno para o próximo jogador no Ragnarok.
   * 
   * @private
   * @returns {void}
   */
  #trocarJogador() {
    this.jogadorAtual = this.jogadorAtual === 1 ? 2 : 1;
  }

  /**
   * Exibe o tabuleiro no formato console com caracteres Unicode.
   * 
   * Usa caracteres de desenho de caixas para criar um tabuleiro visual
   * bonito no terminal, como uma interface de texto no Ragnarok.
   * 
   * @returns {void}
   */
  exibirTabuleiro() {
    const simbolos = { 0: " ", 1: "X", 2: "O" };
    
    console.log();
    
    for (let i = 0; i < this.dimensao; i++) {
      const inicio = i * this.dimensao;
      const fim = inicio + this.dimensao;
      const linha = this.tabuleiro
        .slice(inicio, fim)
        .map(casa => simbolos[casa]);
      
      console.log(" " + linha.join(" │ "));
      
      if (i < this.dimensao - 1) {
        console.log("───" + "┼───".repeat(this.dimensao - 1));
      }
    }
    
    console.log();
  }
}
