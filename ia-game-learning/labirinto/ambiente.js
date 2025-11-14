/**
 * @module 🧩 fase-2/labirinto/ambiente.js
 * @project 📘 AI Game Learning
 *
 * Define o ambiente do Labirinto, que servirá como o 'mundo' para o nosso agente.
 *
 * Este módulo contém a classe `Labirinto`, que é responsável por:
 * - Armazenar a estrutura do labirinto (paredes, caminhos, saída).
 * - Rastrear a posição atual do agente.
 * - Fornecer as ações possíveis que o agente pode tomar.
 * - Executar uma ação e retornar o resultado (novo estado, recompensa, se terminou).
 * - Reiniciar o ambiente para um novo episódio de treinamento.
 *
 * A classe é projetada para ser independente do algoritmo de IA, seguindo os
 * padrões de ambientes de Aprendizado por Reforço.
 */

/**
 * @typedef {[number, number]} Posicao
 * Representa uma posição no labirinto como [linha, coluna].
 */

/**
 * @typedef {'cima' | 'baixo' | 'esquerda' | 'direita'} DirecaoPadrao
 * Representa uma direção padronizada internamente.
 */

/**
 * @typedef {'W' | 'w' | 'A' | 'a' | 'S' | 's' | 'D' | 'd' | 'cima' | 'baixo' | 'esquerda' | 'direita'} AcaoUsuario
 * Representa uma ação que o usuário pode fornecer (teclas WASD ou nomes completos).
 */

/**
 * Mapeamento de teclas WASD para direções padronizadas.
 * 
 * É como mapear os controles do teclado para movimentos no jogo.
 * Isso permite que jogadores humanos usem W,A,S,D enquanto o código
 * internamente trabalha com nomes descritivos e legíveis.
 * 
 * @constant
 * @type {Object.<string, DirecaoPadrao>}
 */
const MAPEAMENTO_TECLAS = {
  'W': 'cima',
  'w': 'cima',
  'A': 'esquerda',
  'a': 'esquerda',
  'S': 'baixo',
  's': 'baixo',
  'D': 'direita',
  'd': 'direita',
  'cima': 'cima',
  'baixo': 'baixo',
  'esquerda': 'esquerda',
  'direita': 'direita'
};

/**
 * Lista de todas as ações válidas (para validação).
 * 
 * @constant
 * @type {Array<string>}
 */
const ACOES_VALIDAS = Object.keys(MAPEAMENTO_TECLAS);

/**
 * Representa o ambiente do labirinto, gerenciando o estado, ações e recompensas.
 * 
 * É como a "arena" ou "dungeon" no Ragnarok onde as batalhas acontecem.
 * O ambiente mantém as regras do jogo e garante que tudo funcione corretamente.
 * 
 * O labirinto é representado por uma matriz onde:
 * - ' ' (espaço) representa um caminho livre
 * - '#' representa uma parede/obstáculo
 * - '•' representa um caminho por onde o agente já passou (rastro)
 * - 'A' é usado apenas para visualização (posição do agente)
 * - 'S' ou 'F' é usado apenas para visualização (saída do labirinto)
 * 
 * @property {Array<Array<string>>} matriz - A grade 2D que representa o labirinto
 * @property {Posicao} estadoInicial - A posição de início do agente
 * @property {Posicao} pontoFinal - A posição da saída do labirinto
 * @property {Posicao} posicaoAgente - A posição atual do agente, que muda a cada passo
 * @property {number} numeroLinhas - Quantidade de linhas do labirinto
 * @property {number} numeroColunas - Quantidade de colunas do labirinto
 */
class Labirinto {
  /**
   * Inicializa o ambiente do Labirinto.
   * 
   * É como criar uma nova "dungeon" no Ragnarok com um mapa específico.
   * O agente começa em uma posição inicial e deve encontrar a saída.
   * 
   * @param {Array<Array<string>>} matrizLabirinto - Uma grade representando o labirinto,
   *   onde ' ' é caminho, '#' é parede
   * @param {Posicao} pontoInicial - Uma tupla [linha, coluna] para a posição inicial
   * @param {Posicao} pontoFinal - Uma tupla [linha, coluna] para a posição final
   * @throws {Error} Se a matriz do labirinto estiver vazia ou malformada
   */
  constructor(matrizLabirinto, pontoInicial, pontoFinal) {
    if (!matrizLabirinto || matrizLabirinto.length === 0) {
      throw new Error('A matriz do labirinto não pode estar vazia.');
    }
    if (!matrizLabirinto[0] || matrizLabirinto[0].length === 0) {
      throw new Error('A matriz do labirinto está malformada.');
    }

    this.#matriz = matrizLabirinto;
    this.estadoInicial = pontoInicial;
    this.pontoFinal = pontoFinal;
    this.posicaoAgente = this.estadoInicial;
    this.#numeroLinhas = matrizLabirinto.length;
    this.#numeroColunas = matrizLabirinto[0].length;
  }

  /** @type {Array<Array<string>>} */
  #matriz;

  /** @type {number} */
  #numeroLinhas;

  /** @type {number} */
  #numeroColunas;

  /**
   * Reinicia o ambiente para o estado inicial.
   * 
   * Isso coloca o agente de volta na posição de partida. É chamado no início
   * de cada novo episódio de treinamento. É como resetar a dungeon para uma
   * nova tentativa no Ragnarok.
   * 
   * @returns {Posicao} O estado inicial do agente após reiniciar
   */
  reiniciar() {
    this.posicaoAgente = this.estadoInicial;
    return this.posicaoAgente;
  }

  /**
   * Executa uma ação e atualiza o estado do ambiente.
   * 
   * É como um jogador fazer um movimento na dungeon: o ambiente processa
   * a ação, atualiza o estado, verifica se chegou na saída e retorna as
   * informações necessárias para o aprendizado.
   * 
   * Aceita tanto teclas WASD quanto nomes completos (cima, baixo, esquerda, direita).
   * 
   * @param {AcaoUsuario} acao - A ação a ser executada ('W'/'w'/'cima', 'S'/'s'/'baixo', 'A'/'a'/'esquerda', 'D'/'d'/'direita')
   * @returns {[Posicao, number, boolean]} Uma tupla contendo:
   *   - O novo estado (a nova posição do agente)
   *   - A recompensa recebida por realizar a ação
   *   - Um booleano indicando se o episódio terminou (agente na saída)
   * @throws {Error} Se a ação fornecida for inválida
   */
  executarAcao(acao) {
    // Valida se a ação está no mapeamento
    if (!ACOES_VALIDAS.includes(acao)) {
      throw new Error(
        `Ação inválida: "${acao}". Use: W/A/S/D (ou cima/baixo/esquerda/direita)`
      );
    }

    // Normaliza a ação para o formato padrão interno
    const direcaoPadrao = this.#normalizarAcao(acao);
    
    const proximaPosicao = this.#calcularProximaPosicao(direcaoPadrao);

    if (this.#ehPosicaoValida(proximaPosicao)) {
      // Marca o rastro na posição anterior (antes de mover)
      const [linhaAtual, colunaAtual] = this.posicaoAgente;
      this.#matriz[linhaAtual][colunaAtual] = '•';
      
      // Move o agente para a nova posição
      this.posicaoAgente = proximaPosicao;
    }

    const recompensa = this.calcularRecompensa();
    const terminou = this.#verificarSeChegouNoFinal();

    return [this.posicaoAgente, recompensa, terminou];
  }

  /**
   * Normaliza a entrada do usuário para o formato padrão interno.
   * 
   * Converte teclas WASD (maiúsculas ou minúsculas) para as direções
   * padronizadas que o código usa internamente. Isso mantém o código
   * legível enquanto permite entradas amigáveis ao usuário.
   * 
   * @private
   * @param {AcaoUsuario} acao - A ação fornecida pelo usuário
   * @returns {DirecaoPadrao} A direção normalizada
   */
  #normalizarAcao(acao) {
    return MAPEAMENTO_TECLAS[acao];
  }

  /**
   * Calcula a posição resultante de uma ação, sem mover o agente.
   * 
   * É como simular o movimento antes de executá-lo de fato. Útil para
   * verificar se a posição é válida antes de atualizar o estado.
   * 
   * @private
   * @param {DirecaoPadrao} direcao - A direção normalizada
   * @returns {Posicao} A posição resultante da ação
   */
  #calcularProximaPosicao(direcao) {
    const [linhaAtual, colunaAtual] = this.posicaoAgente;

    switch (direcao) {
      case 'cima':
        return [linhaAtual - 1, colunaAtual];
      case 'baixo':
        return [linhaAtual + 1, colunaAtual];
      case 'esquerda':
        return [linhaAtual, colunaAtual - 1];
      case 'direita':
        return [linhaAtual, colunaAtual + 1];
      default:
        return this.posicaoAgente;
    }
  }

  /**
   * Verifica se uma posição está dentro dos limites e não é uma parede.
   * 
   * É como verificar se o jogador pode andar naquela célula da dungeon
   * ou se há um obstáculo bloqueando o caminho.
   * 
   * @private
   * @param {Posicao} posicao - A posição a ser verificada [linha, coluna]
   * @returns {boolean} True se a posição é válida, False caso contrário
   */
  #ehPosicaoValida(posicao) {
    const [linha, coluna] = posicao;

    // Verifica se está dentro dos limites verticais
    if (linha < 0 || linha >= this.#numeroLinhas) {
      return false;
    }

    // Verifica se está dentro dos limites horizontais
    if (coluna < 0 || coluna >= this.#numeroColunas) {
      return false;
    }

    // Verifica se não é uma parede
    if (this.#matriz[linha][coluna] === '#') {
      return false;
    }

    return true;
  }

  /**
   * Calcula a recompensa com base na posição atual do agente.
   * 
   * Sistema de recompensas:
   * - +10.0 * (linhas * colunas): Chegou na saída (objetivo alcançado!)
   * - -0.1: Qualquer outro movimento (incentiva caminhos mais curtos)
   * 
   * A recompensa de vitória é escalada pelo tamanho do labirinto para
   * incentivar a conclusão de labirintos maiores (mais desafiadores).
   * 
   * É como ganhar XP no Ragnarok: você ganha muito ao completar o objetivo,
   * mas perde um pouco a cada passo para incentivar eficiência.
   * 
   * @private
   * @returns {number} A recompensa calculada
   */
  calcularRecompensa() {
    if (this.#verificarSeChegouNoFinal()) {
      return 10.0 * (this.#numeroLinhas * this.#numeroColunas);
    } else {
      return -0.1;
    }
  }

  /**
   * Verifica se o agente chegou ao ponto final.
   * 
   * @private
   * @returns {boolean} True se chegou na saída, False caso contrário
   */
  #verificarSeChegouNoFinal() {
    const [linhaAgente, colunaAgente] = this.posicaoAgente;
    const [linhaFinal, colunaFinal] = this.pontoFinal;
    return linhaAgente === linhaFinal && colunaAgente === colunaFinal;
  }

  /**
   * Retorna uma representação em string do labirinto com o agente.
   * 
   * Exibe o labirinto no console de forma visual, mostrando:
   * - 'A' para a posição atual do agente
   * - 'S' para a saída (ponto final)
   * - '#' para paredes
   * - '•' para o rastro (caminhos por onde passou)
   * - Espaços para caminhos livres
   * 
   * É como o minimapa do Ragnarok, mostrando onde você está e onde
   * precisa chegar.
   * 
   * @returns {string} Representação visual do labirinto
   */
  toString() {
    // Cria uma cópia profunda da matriz para não modificar o original
    const matrizParaExibicao = this.#matriz.map(linha => [...linha]);

    // Marca a posição do agente
    const [linhaAgente, colunaAgente] = this.posicaoAgente;
    matrizParaExibicao[linhaAgente][colunaAgente] = 'A';

    // Marca a saída
    const [linhaSaida, colunaSaida] = this.pontoFinal;
    matrizParaExibicao[linhaSaida][colunaSaida] = 'S';

    // Formata cada linha com espaçamento entre células
    const linhasFormatadas = matrizParaExibicao.map(linha =>
      linha.map(celula => celula).join(' ')
    );

    return linhasFormatadas.join('\n');
  }

  /**
   * Imprime o labirinto em formato de grade com caracteres Unicode.
   * 
   * Função auxiliar para imprimir o estado atual do labirinto
   * em formato de GRADE, usando caracteres de desenho de caixa.
   * 
   * Marca:
   * - 'A' = Posição atual do Agente
   * - 'F' = Posição Final (objetivo)
   * - '#' = Parede
   * - ' ' = Caminho livre
   * - '•' = Caminho por onde passou (rastro)
   * 
   * É como ver o minimapa do Ragnarok com uma borda bonita!
   * 
   * @returns {void}
   */
  imprimirLabirinto() {
    try {
      // Cria uma cópia da matriz para "desenhar" nela
      const visualizacao = this.#matriz.map(linha => [...linha]);
      const linhas = visualizacao.length;
      
      if (linhas === 0) {
        console.log('Labirinto vazio.');
        return;
      }
      
      const colunas = visualizacao[0].length;
      const pontoFinal = this.pontoFinal;
      const posAgente = this.posicaoAgente;

      // 1. Marcar o ponto final (F)
      if (pontoFinal[0] >= 0 && pontoFinal[0] < linhas && 
          pontoFinal[1] >= 0 && pontoFinal[1] < colunas) {
        if (visualizacao[pontoFinal[0]][pontoFinal[1]] !== '#') {
          visualizacao[pontoFinal[0]][pontoFinal[1]] = 'F';
        }
      }

      // 2. Marcar o agente (A) (sobrepõe 'F' se estiver no final)
      if (posAgente[0] >= 0 && posAgente[0] < linhas && 
          posAgente[1] >= 0 && posAgente[1] < colunas) {
        visualizacao[posAgente[0]][posAgente[1]] = 'A';
      }

      // --- Caracteres de Desenho ---
      const BARRA_H = '───';
      const BARRA_V = '│';
      
      const CANTO_SE = '┌';
      const CANTO_SD = '┐';
      const CANTO_IE = '└';
      const CANTO_ID = '┘';
      
      const JUNCAO_CIMA = '┬';
      const JUNCAO_BAIXO = '┴';
      const JUNCAO_ESQ = '├';
      const JUNCAO_DIR = '┤';
      const JUNCAO_MEIO = '┼';

      // --- Impressão da Grade ---

      // 1. Linha Superior (Ex: ┌───┬───┬───┐)
      const linhaSuperior = CANTO_SE + 
        Array(colunas).fill(BARRA_H).join(JUNCAO_CIMA) + 
        CANTO_SD;
      console.log(linhaSuperior);

      // 2. Loop pelas linhas de conteúdo e separadores
      for (let i = 0; i < linhas; i++) {
        const linha = visualizacao[i];

        // Linha de Conteúdo (Ex: │ A │ # │ F │)
        const celulasConteudo = linha.map(c => ` ${c} `);
        const linhaConteudo = BARRA_V + celulasConteudo.join(BARRA_V) + BARRA_V;
        console.log(linhaConteudo);

        // Linha Separadora (se não for a última)
        if (i < linhas - 1) {
          const linhaMeio = JUNCAO_ESQ + 
            Array(colunas).fill(BARRA_H).join(JUNCAO_MEIO) + 
            JUNCAO_DIR;
          console.log(linhaMeio);
        }
      }

      // 3. Linha Inferior (Ex: └───┴───┴───┘)
      const linhaInferior = CANTO_IE + 
        Array(colunas).fill(BARRA_H).join(JUNCAO_BAIXO) + 
        CANTO_ID;
      console.log(linhaInferior);

    } catch (error) {
      console.error(`Erro ao imprimir labirinto: ${error.message}`);
      console.log(this.toString()); // Fallback para toString()
    }
  }
}

module.exports = { Labirinto };
