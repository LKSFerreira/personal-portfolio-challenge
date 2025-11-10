/**
 * @module 🧠 agente.js
 * @project 📘 AI Game Learning
 * 
 * Este módulo define o Agente que utiliza o algoritmo Q-Learning.
 * No paradigma de Aprendizado por Reforço (RL), este código representa o "Agent".
 * 
 * Resposabilidades do Agente:
 * - Mante uma "memória de jogo", a Tabela Q (Q-Table).
 * - Decidir qual ação tomar, balanceando entre explorar e usar seu conhecimento.
 * - Aprender com os resultados de suas ações, atualizando sua memória.
 */

import fs from "fs";

/**
 * Classe que representa um Agente que aprende a jogar o Jogo da Velha usando Q-Learning.
 * 
 * Pense neste Agente como um jogador de Ragnarok Online que está aprendendo
 * a melhor estratégia para derrotar monstros.
 * 
 * Hiperparâmetros (os "atributos" do nosso jogador):
 * 
 * @property {number} alpha (α) - A "Velocidade de Aprendizado"
 *   - Quão rápido o jogador ajusta sua estratégia após uma batalha.
 *   - Valores altos = impulsivo, aprende rápido com uma única experiência.
 *   - Valores baixos = cético, precisa de muitas experiências para mudar de ideia.
 * 
 * @property {number} gamma (γ) - A "Visão de Futuro" (Fator de Desconto)
 *   - O quanto o jogador valoriza recompensas futuras.
 *   - Valor alto = estrategista, pensa nos próximos passos.
 *   - Valor baixo = imediatista, foca apenas na recompensa de agora.
 * 
 * @property {number} epsilon (ε) - O "Medidor de Curiosidade" (Taxa de Exploração)
 *   - A chance do jogador tentar uma tática nova e desconhecida.
 *   - Valor alto = aventureiro, adora explorar o mapa.
 *   - Valor baixo = conservador, prefere usar a tática que já sabe que funciona.
 */
export class AgenteQLearning {
  /**
   * Cria um novo Agente de Q-Learning para jogar o Jogo da Velha.
   * 
   * É como criar um personagem novo no Ragnarok: você define seus atributos iniciais
   * (INT, DEX, etc.) que vão determinar como ele vai evoluir durante o jogo.
   * 
   * @param {Object} config - Objeto de configuração com os hiperparâmetros do agente
   * @param {number} [config.alpha=0.5] - Taxa de aprendizado (0 a 1). Controla a velocidade de aprendizado
   * @param {number} [config.gamma=0.9] - Fator de desconto (0 a 1). Valor dado a recompensas futuras
   * @param {number} [config.epsilon=1.0] - Taxa de exploração inicial (0 a 1). Chance de fazer jogadas aleatórias
   * @param {number} [config.epsilonMinimo=0.01] - Valor mínimo que epsilon pode atingir durante o decaimento
   * @param {number} [config.taxaDecaimentoEpsilon=0.9995] - Multiplicador de decaimento aplicado ao epsilon a cada episódio
   * @param {number} [config.jogador=1] - Identificador do jogador (1 para X, 2 para O)
   */
  constructor({
    alpha = 0.5,
    gamma = 0.9,
    epsilon = 1.0,
    epsilonMinimo = 0.01,
    taxaDecaimentoEpsilon = 0.9995,
    jogador = 1
  } = {}) {
    /** --- HIPERPARÂMETROS (Atributos do Agente) --- */
    this.alpha = alpha;
    this.gamma = gamma;
    this.epsilon = epsilon;
    this.epsilonMinimo = epsilonMinimo;
    this.taxaDecaimentoEpsilon = taxaDecaimentoEpsilon;

    /** --- IDENTIDADE --- */
    this.jogador = jogador;
    this.simbolo = jogador === 1 ? 'X' : 'O';

    /** --- MEMÓRIA (A "Enciclopédia de Monstros" do Jogador) --- */
    // Estrutura: { estado_do_tabuleiro: { acao: valor_q } }
    this.tabelaQ = {};

    /** --- ESTATÍSTICAS DE TREINO --- */
    this.partidasTreinadas = 0;
    this.vitorias = 0;
    this.derrotas = 0;
    this.empates = 0;
  }


  /**
   * Consulta a "memória" (Q-Table) para ver o valor de uma ação em um estado.
   * 
   * Se o Agente nunca viu essa situação antes, ele assume que o valor é 0,
   * como um jogador que nunca enfrentou aquele tipo de monstro e não sabe
   * se a estratégia será boa ou ruim.
   * 
   * @param {Array} estado - O estado atual do jogo (representação do tabuleiro)
   * @param {number} acao - A ação (posição de 0 a 8) que o agente quer avaliar
   * @returns {number} O valor Q da ação naquele estado (recompensa esperada)
   */
  obterValorQ(estado, acao) {
    const estadoKey = JSON.stringify(estado);

    if (!this.tabelaQ[estadoKey]) {
      this.tabelaQ[estadoKey] = {}
    };

    if (!(acao in this.tabelaQ[estadoKey])) {
      this.tabelaQ[estadoKey][acao] = 0.0;
    }

    return this.tabelaQ[estadoKey][acao];
  }

  /**
 * Atualiza a "memória" do Agente usando a Equação de Bellman.
 * É aqui que o aprendizado realmente acontece!
 * 
 * Pense como se fosse ganhar EXP no Ragnarok: depois de uma batalha,
 * você aprende se aquela estratégia foi boa ou ruim e ajusta sua
 * "experiência" com base na recompensa que recebeu e no que espera
 * das próximas batalhas.
 * 
 * A Equação de Bellman calcula:
 * Novo Valor Q = Opinião Antiga + Taxa de Aprendizado × (Surpresa)
 * Onde Surpresa = Valor Real - Opinião Antiga
 * 
 * @param {Array} estado - O estado atual do tabuleiro antes da jogada
 * @param {number} acao - A ação (posição 0-8) que foi tomada
 * @param {number} recompensa - A recompensa recebida (+1, -1 ou 0)
 * @param {Array} proximoEstado - O estado do tabuleiro após a jogada
 * @returns {void}
 */
  atualizarValorQ(estado, acao, recompensa, proximoEstado) {
    const estadoKey = JSON.stringify(estado);

    const opiniaoAntiga = this.obterValorQ(estado, acao);
    const melhorValorFuturo = this.#melhorValorQEstado(proximoEstado);
    const valorRealDaJogada = recompensa + this.gamma * melhorValorFuturo;
    const surpresa = valorRealDaJogada - opiniaoAntiga;
    const novoValorQ = opiniaoAntiga + this.alpha * surpresa;

    if (!this.tabelaQ[estadoKey]) {
      this.tabelaQ[estadoKey] = {}
    };

    this.tabelaQ[estadoKey][acao] = novoValorQ;
  }

  /**
 * Verifica na "memória" qual é a melhor jogada possível a partir de um estado.
 * 
 * É como se o Agente olhasse todas as táticas que ele já testou naquela
 * situação e escolhesse aquela que teve o melhor resultado no passado.
 * Se ele nunca viu aquela situação antes, retorna 0 (neutro).
 * 
 * @private
 * @param {Array} estado - O estado do tabuleiro que queremos avaliar
 * @returns {number} O maior valor Q encontrado para aquele estado (melhor recompensa esperada)
 */
  #melhorValorQEstado(estado) {
    const estadoKey = JSON.stringify(estado);
    const acoes = this.tabelaQ[estadoKey];
    if (!acoes || Object.keys(acoes).length === 0) return 0.0;
    return Math.max(...Object.values(acoes));
  }

  /**
 * Decide qual jogada fazer usando a estratégia Epsilon-Greedy.
 * 
 * É a estratégia que equilibra "Aventura" (exploração) e "Farm" (exploração).
 * Como um jogador de Ragnarok que às vezes sai do caminho conhecido para
 * explorar novos mapas (pode encontrar algo melhor) ou fica no mapa conhecido
 * farmando o que já sabe que funciona.
 * 
 * A estratégia funciona assim:
 * - Durante o treinamento: com probabilidade epsilon (ε), escolhe ação aleatória
 *   (exploração). Caso contrário, escolhe a melhor ação conhecida (exploração).
 * - Fora do treinamento: sempre escolhe a melhor ação conhecida.
 * 
 * @param {Array} estado - O estado atual do tabuleiro
 * @param {Array<number>} acoesValidas - Lista de posições disponíveis para jogar (0-8)
 * @param {boolean} [emTreinamento=true] - Se true, usa epsilon-greedy. Se false, sempre escolhe a melhor ação
 * @returns {number} A ação escolhida (posição de 0 a 8 no tabuleiro)
 * @throws {Error} Se não houver ações válidas disponíveis
 */
escolherAcao(estado, acoesValidas, emTreinamento = true) {
  if (!acoesValidas || acoesValidas.length === 0)
    throw new Error("Não há ações válidas para escolher.");

  if (!emTreinamento)
    return this.#escolherMelhorAcao(estado, acoesValidas);

  if (Math.random() < this.epsilon) {
    // "Modo Aventura": explora
    return acoesValidas[Math.floor(Math.random() * acoesValidas.length)];
  } else {
    // "Modo Farm": usa melhor tática
    return this.#escolherMelhorAcao(estado, acoesValidas);
  }
}

/**
 * Consulta a "memória" e escolhe a ação com o maior valor Q.
 * 
 * É como olhar na "Enciclopédia de Monstros" e escolher a tática que
 * já provou ser a mais eficaz. Se houver empate (várias táticas igualmente
 * boas), escolhe aleatoriamente entre elas para evitar sempre fazer o mesmo
 * padrão de jogadas.
 * 
 * Processo:
 * 1. Avalia o valor Q de todas as ações válidas
 * 2. Encontra o maior valor Q
 * 3. Se houver empate, escolhe aleatoriamente entre as melhores
 * 
 * @private
 * @param {Array} estado - O estado atual do tabuleiro
 * @param {Array<number>} acoesValidas - Lista de posições disponíveis para jogar (0-8)
 * @returns {number} A melhor ação escolhida (posição de 0 a 8 no tabuleiro)
 */
#escolherMelhorAcao(estado, acoesValidas) {
  const valoresQdasAcoes = {};
  for (const acao of acoesValidas) {
    valoresQdasAcoes[acao] = this.obterValorQ(estado, acao);
  }
  const valorMaximoQ = Math.max(...Object.values(valoresQdasAcoes));
  const melhoresAcoes = Object.entries(valoresQdasAcoes)
    .filter(([_, v]) => v === valorMaximoQ)
    .map(([k]) => parseInt(k));

  return melhoresAcoes[Math.floor(Math.random() * melhoresAcoes.length)];
}

/**
 * Processa o histórico de uma partida finalizada para aprender com ela.
 * 
 * É como ganhar EXP no Ragnarok: depois da batalha, você revisa tudo que fez
 * (do fim para o começo) e aprende quais movimentos foram bons ou ruins.
 * O Agente também fica menos curioso (epsilon decay) à medida que ganha experiência.
 * 
 * O aprendizado acontece de trás pra frente porque:
 * - A última jogada teve impacto direto no resultado
 * - Jogadas anteriores tiveram impacto mais indireto (multiplicado por gamma)
 * 
 * @param {Array<Array>} historicoPartida - Array de tuplas [estado, acao, proximo_estado]
 * @param {number} recompensaFinal - Recompensa final da partida (+1 vitória, -1 derrota, 0 empate)
 * @returns {void}
 */
aprenderJogando(historicoPartida, recompensaFinal) {
  this.partidasTreinadas += 1;
  if (recompensaFinal > 0.5) this.vitorias++;
  else if (recompensaFinal < 0.5) this.derrotas++;
  else this.empates++;

  for (let i = historicoPartida.length - 1; i >= 0; i--) {
    const [estado, acao, proximoEstado] = historicoPartida[i];
    this.atualizarValorQ(estado, acao, recompensaFinal, proximoEstado);
    recompensaFinal *= this.gamma;
  }

  this.reduzirEpsilon();
}

/**
 * Reduz a "curiosidade" do Agente ao longo do tempo (epsilon decay).
 * 
 * É como um jogador de Ragnarok que, conforme ganha experiência,
 * para de explorar mapas aleatórios e foca nas rotas que já conhece.
 * O epsilon nunca fica menor que o mínimo configurado.
 * 
 * Fórmula: epsilon = max(epsilon_minimo, epsilon × taxa_decaimento)
 * 
 * @returns {void}
 */
reduzirEpsilon() {
  this.epsilon = Math.max(this.epsilonMinimo, this.epsilon * this.taxaDecaimentoEpsilon);
}

/**
 * Salva o conhecimento do Agente (a Tabela Q) em um arquivo JSON.
 * 
 * É como salvar o "save game" no Ragnarok: toda a experiência e conhecimento
 * adquirido é preservado para ser usado depois. O diretório é criado
 * automaticamente se não existir.
 * 
 * @param {string} [caminho="agente_treinado.json"] - Caminho onde salvar o arquivo JSON
 * @returns {void}
 */
salvarMemoria(caminho = "agente_treinado.json") {
  const caminhoCompleto = path.resolve(caminho);
  fs.mkdirSync(path.dirname(caminhoCompleto), { recursive: true });
  fs.writeFileSync(caminhoCompleto, JSON.stringify(this.tabelaQ, null, 2));
  console.log(`💾 Memória do Agente salva em: ${caminhoCompleto}`);
}

/**
 * Carrega o conhecimento de um Agente previamente treinado.
 * 
 * É como carregar um "save game" no Ragnarok: o Agente recupera toda
 * a experiência e conhecimento que tinha antes. Se o arquivo não existir,
 * o Agente começa do zero (tabela Q vazia).
 * 
 * @param {string} caminho - Caminho do arquivo JSON contendo a tabela Q
 * @returns {void}
 */
carregarMemoria(caminho) {
  const caminhoCompleto = path.resolve(caminho);
  if (!fs.existsSync(caminhoCompleto)) {
    console.log(`⚠️  Aviso: Nenhum arquivo de memória encontrado em ${caminho}. O Agente começará do zero.`);
    return;
  }

  this.tabelaQ = JSON.parse(fs.readFileSync(caminhoCompleto, 'utf-8'));
  console.log(`✅ Memória do Agente carregada de: ${caminhoCompleto}`);
  console.log(`   - O Agente conhece ${Object.keys(this.tabelaQ).length.toLocaleString()} situações de jogo.`);
}






}