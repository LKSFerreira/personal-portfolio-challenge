/**
 * Módulo: 🧠 agente.js
 * Projeto: 📘 AI Game Learning
 *
 * Este módulo define o Agente que utiliza o algoritmo Q-Learning.
 * Ele é projetado para ser compatível tanto com o treinamento em massa (treinador.js)
 * quanto com o aprendizado interativo (jogar.js).
 */

import fs from 'fs';
import path from 'path';

/**
 * Um Agente que aprende a jogar Jogo da Velha usando Q-Learning.
 * 
 * Pense neste Agente como um jogador de Ragnarok Online que está aprendendo
 * a melhor estratégia para derrotar monstros.
 *
 * Hiperparâmetros (os "atributos" do nosso jogador):
 * - alpha (α): A "Velocidade de Aprendizado"
 *   - Quão rápido o jogador ajusta sua estratégia após uma batalha
 *   - Valores altos = impulsivo, aprende rápido com uma única experiência
 *   - Valores baixos = cético, precisa de muitas experiências para mudar de ideia
 *
 * - gamma (γ): A "Visão de Futuro" (Fator de Desconto)
 *   - O quanto o jogador valoriza recompensas futuras
 *   - Valor alto = estrategista, pensa nos próximos passos
 *   - Valor baixo = imediatista, foca apenas na recompensa de agora
 *
 * - epsilon (ε): O "Medidor de Curiosidade" (Taxa de Exploração)
 *   - A chance do jogador tentar uma tática nova e desconhecida
 *   - Valor alto = aventureiro, adora explorar o mapa
 *   - Valor baixo = conservador, prefere usar a tática que já sabe que funciona
 * 
 * @property {number} alpha - Taxa de aprendizado (0 a 1)
 * @property {number} gamma - Fator de desconto (0 a 1)
 * @property {number} epsilon - Taxa de exploração (0 a 1)
 * @property {number} epsilonMinimo - Valor mínimo que epsilon pode atingir
 * @property {number} taxaDecaimentoEpsilon - Multiplicador de decaimento do epsilon
 * @property {number} jogador - Identificador do jogador (1 ou 2)
 * @property {string} simbolo - Símbolo visual ('X' ou 'O')
 * @property {Object} tabelaQ - Memória do agente (Q-Table)
 * @property {number} partidasTreinadas - Contador de partidas de treino
 * @property {number} vitorias - Contador de vitórias
 * @property {number} derrotas - Contador de derrotas
 * @property {number} empates - Contador de empates
 * @property {Array<Array>} historicoPartida - Memória de curto prazo da partida atual
 */
export class AgenteQLearning {
  /**
   * Inicializa os atributos e a memória do Agente.
   * 
   * É como criar um personagem novo no Ragnarok: você define seus atributos iniciais
   * (INT, DEX, etc.) que vão determinar como ele vai evoluir durante o jogo.
   * 
   * @param {Object} config - Objeto de configuração com os hiperparâmetros do agente
   * @param {number} [config.alpha=0.5] - Taxa de aprendizado (0 a 1)
   * @param {number} [config.gamma=1.0] - Fator de desconto (0 a 1)
   * @param {number} [config.epsilon=1.0] - Taxa de exploração inicial (0 a 1)
   * @param {number} [config.epsilonMinimo=0.001] - Valor mínimo que epsilon pode atingir
   * @param {number} [config.taxaDecaimentoEpsilon=0.99999] - Multiplicador de decaimento do epsilon
   * @param {number} [config.jogador=1] - Identificador do jogador (1 para X, 2 para O)
   */
  constructor({
    alpha = 0.5,
    gamma = 1.0,
    epsilon = 1.0,
    epsilonMinimo = 0.001,
    taxaDecaimentoEpsilon = 0.99999,
    jogador = 1
  } = {}) {
    // --- HIPERPARÂMETROS (Atributos do Agente) ---
    this.alpha = alpha;
    this.gamma = gamma;
    this.epsilon = epsilon;
    this.epsilonMinimo = epsilonMinimo;
    this.taxaDecaimentoEpsilon = taxaDecaimentoEpsilon;

    // --- IDENTIDADE ---
    this.jogador = jogador;
    this.simbolo = jogador === 1 ? 'X' : 'O';

    // --- MEMÓRIA (A "Enciclopédia de Monstros" do Jogador) ---
    this.tabelaQ = {};

    // --- ESTATÍSTICAS DE TREINO ---
    this.partidasTreinadas = 0;
    this.vitorias = 0;
    this.derrotas = 0;
    this.empates = 0;

    // --- MEMÓRIA DE CURTO PRAZO (para a partida atual) ---
    this.historicoPartida = [];
  }

  /**
   * Consulta a "memória" (Q-Table) para ver o valor de uma ação em um estado.
   * 
   * Se o Agente nunca viu essa situação antes, ele assume que o valor é 0,
   * como um jogador que nunca enfrentou aquele tipo de monstro e não sabe
   * se a estratégia será boa ou ruim.
   * 
   * @param {string} estado - O estado atual do jogo (representação do tabuleiro)
   * @param {number} acao - A ação (posição de 0 a 8) que o agente quer avaliar
   * @returns {number} O valor Q da ação naquele estado (recompensa esperada)
   */
  obterValorQ(estado, acao) {
    if (!(estado in this.tabelaQ)) {
      this.tabelaQ[estado] = {};
    }
    if (!(acao in this.tabelaQ[estado])) {
      this.tabelaQ[estado][acao] = 0.0;
    }
    return this.tabelaQ[estado][acao];
  }

  /**
   * Atualiza a "memória" do Agente usando a Equação de Bellman (Método TD Learning).
   * É aqui que o aprendizado a cada passo realmente acontece!
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
   * @param {string} estado - O estado do tabuleiro antes da jogada
   * @param {number} acao - A ação (posição 0-8) que foi tomada
   * @param {number} recompensa - A recompensa recebida (+1, -1 ou 0)
   * @param {string} proximoEstado - O estado do tabuleiro após a jogada
   * @param {boolean} finalizado - Se true, não considera valores futuros (jogo acabou)
   * @returns {void}
   */
  aprender(estado, acao, recompensa, proximoEstado, finalizado) {
    const opiniaoAntiga = this.obterValorQ(estado, acao);
    
    // Se o jogo finalizou, não há valor futuro a considerar
    const melhorValorFuturo = finalizado ? 0.0 : this.#obterMelhorValorQDoEstado(proximoEstado);
    
    const valorRealDaJogada = recompensa + this.gamma * melhorValorFuturo;
    const surpresa = valorRealDaJogada - opiniaoAntiga;
    const novoValorQ = opiniaoAntiga + this.alpha * surpresa;

    if (!(estado in this.tabelaQ)) {
      this.tabelaQ[estado] = {};
    }
    this.tabelaQ[estado][acao] = novoValorQ;
  }

  /**
   * Verifica na "memória" qual é a melhor jogada possível a partir de um estado.
   * 
   * É como se o Agente olhasse todas as táticas que ele já testou naquela
   * situação e escolhesse aquela que teve o melhor resultado no passado.
   * Se ele nunca viu aquela situação antes, retorna 0 (neutro).
   * 
   * @private
   * @param {string} estado - O estado do tabuleiro que queremos avaliar
   * @returns {number} O maior valor Q encontrado para aquele estado (melhor recompensa esperada)
   */
  #obterMelhorValorQDoEstado(estado) {
    if (!(estado in this.tabelaQ) || Object.keys(this.tabelaQ[estado]).length === 0) {
      return 0.0;
    }
    return Math.max(...Object.values(this.tabelaQ[estado]));
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
   * @param {string} estado - O estado atual do tabuleiro
   * @param {Array<number>} acoesValidas - Lista de posições disponíveis para jogar (0-8)
   * @param {boolean} [emTreinamento=true] - Se true, usa epsilon-greedy. Se false, sempre escolhe a melhor ação
   * @returns {number} A ação escolhida (posição de 0 a 8 no tabuleiro)
   * @throws {Error} Se não houver ações válidas disponíveis
   */
  escolherAcao(estado, acoesValidas, emTreinamento = true) {
    if (!acoesValidas || acoesValidas.length === 0) {
      throw new Error("Não há ações válidas para escolher.");
    }

    if (!emTreinamento) {
      return this.#escolherMelhorAcao(estado, acoesValidas);
    }

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
   * @param {string} estado - O estado atual do tabuleiro
   * @param {Array<number>} acoesValidas - Lista de posições disponíveis para jogar (0-8)
   * @returns {number} A melhor ação escolhida (posição de 0 a 8 no tabuleiro)
   */
  #escolherMelhorAcao(estado, acoesValidas) {
    const valoresQDasAcoes = {};
    for (const acao of acoesValidas) {
      valoresQDasAcoes[acao] = this.obterValorQ(estado, acao);
    }

    const valorMaximoQ = Math.max(...Object.values(valoresQDasAcoes));
    const melhoresAcoes = Object.entries(valoresQDasAcoes)
      .filter(([_, valor]) => valor === valorMaximoQ)
      .map(([acao]) => parseInt(acao));

    return melhoresAcoes[Math.floor(Math.random() * melhoresAcoes.length)];
  }

  // --- MÉTODOS PARA O CICLO DE TREINAMENTO (GERENCIADOS PELO TREINADOR) ---

  /**
   * Limpa a memória de curto prazo para o início de uma nova partida.
   * 
   * É como começar uma nova "quest" no Ragnarok: você esquece o que aconteceu
   * na última e foca totalmente na nova missão.
   * 
   * @returns {void}
   */
  iniciarNovaPartida() {
    this.historicoPartida = [];
  }

  /**
   * Guarda a jogada (estado, ação) feita nesta partida.
   * 
   * É como anotar no "diário de bordo" cada movimento que você fez na quest,
   * para depois analisar o que deu certo e o que deu errado.
   * 
   * @param {string} estado - O estado do tabuleiro no momento da jogada
   * @param {number} acao - A ação (posição) escolhida
   * @returns {void}
   */
  registrarJogada(estado, acao) {
    this.historicoPartida.push([estado, acao]);
  }

  /**
   * Processa o histórico da partida finalizada para aprender com ela (Método Monte Carlo).
   * 
   * É como ganhar EXP no Ragnarok: depois da batalha, você revisa tudo que fez
   * (do fim para o começo) e aprende quais movimentos foram bons ou ruins.
   * O Agente também fica menos curioso (epsilon decay) à medida que ganha experiência.
   * 
   * O aprendizado acontece de trás pra frente porque:
   * - A última jogada teve impacto direto no resultado
   * - Jogadas anteriores tiveram impacto mais indireto (multiplicado por gamma)
   * 
   * Este método é chamado pelo Treinador ao final de cada jogo.
   * 
   * @param {number} recompensaFinal - Recompensa final da partida (+1 vitória, -1 derrota, 0 empate)
   * @returns {void}
   */
  aprenderComFimDePartida(recompensaFinal) {
    this.partidasTreinadas += 1;
    
    if (recompensaFinal > 0) this.vitorias++;
    else if (recompensaFinal < 0) this.derrotas++;
    else this.empates++;

    // Propaga a recompensa final para trás, valorizando as jogadas
    // que levaram a este resultado. Reutiliza o método 'aprender' para
    // manter a lógica centralizada.
    for (let i = this.historicoPartida.length - 1; i >= 0; i--) {
      const [estado, acao] = this.historicoPartida[i];
      this.aprender(estado, acao, recompensaFinal, estado, true); // finalizado=true
      // A recompensa perde um pouco de força a cada passo para trás
      recompensaFinal *= this.gamma;
    }

    this.reduzirEpsilon();
  }

  /**
   * Reduz a "curiosidade" do Agente (epsilon decay).
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
    this.epsilon = Math.max(
      this.epsilonMinimo,
      this.epsilon * this.taxaDecaimentoEpsilon
    );
  }

  /**
   * Salva o conhecimento do Agente (a Tabela Q) em um arquivo JSON.
   * 
   * É como salvar o "save game" no Ragnarok: toda a experiência e conhecimento
   * adquirido é preservado para ser usado depois. O diretório é criado
   * automaticamente se não existir.
   * 
   * Nota: O salvamento é silencioso para não poluir o console durante
   * treinamentos em massa com muitos checkpoints.
   * 
   * @param {string} caminho - Caminho onde salvar o arquivo JSON
   * @returns {void}
   * @throws {Error} Se houver problema ao salvar o arquivo
   */
  salvarMemoria(caminho) {
    const caminhoCompleto = path.resolve(caminho);
    const diretorio = path.dirname(caminhoCompleto);

    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio, { recursive: true });
    }

    try {
      fs.writeFileSync(
        caminhoCompleto,
        JSON.stringify(this.tabelaQ, null, 2)
      );
    } catch (err) {
      throw new Error(`Erro ao salvar memória: ${err.message}`);
    }
  }

  /**
   * Cria uma instância de Agente e carrega seu conhecimento de um arquivo.
   * 
   * É como carregar um "save game" no Ragnarok: o Agente recupera toda
   * a experiência e conhecimento que tinha antes. Se o arquivo não existir,
   * o Agente começa do zero (tabela Q vazia).
   * 
   * Permite sobrescrever hiperparâmetros no momento do carregamento.
   * 
   * @static
   * @param {string} caminho - Caminho do arquivo JSON contendo a tabela Q
   * @param {Object} kwargs - Hiperparâmetros customizados (alpha, gamma, etc.)
   * @returns {AgenteQLearning} Nova instância do agente com memória carregada
   */
  static carregar(caminho, kwargs = {}) {
    // Cria um novo agente, passando quaisquer hiperparâmetros customizados
    const agente = new AgenteQLearning(kwargs);

    const caminhoCompleto = path.resolve(caminho);

    if (fs.existsSync(caminhoCompleto)) {
      const dados = fs.readFileSync(caminhoCompleto, 'utf-8');
      agente.tabelaQ = JSON.parse(dados);

      console.log(`✅ Memória do Agente (${agente.simbolo}) carregada de: ${caminhoCompleto}`);
      console.log(`   - O Agente conhece ${Object.keys(agente.tabelaQ).length.toLocaleString('pt-BR')} situações de jogo.`);
    } else {
      console.log(`⚠️  Aviso: Nenhum arquivo de memória encontrado em ${caminho}. O Agente (${agente.simbolo}) começará do zero.`);
    }

    return agente;
  }

  /**
   * Imprime as estatísticas de forma legível no console.
   * 
   * É como abrir a tela de "Character Info" no Ragnarok e ver
   * todos os detalhes do seu personagem formatados de forma bonita.
   * 
   * @returns {void}
   */
  imprimirEstatisticas() {
    const totalJogos = this.vitorias + this.derrotas + this.empates;
    
    let taxaVitoria, taxaEmpate, taxaDerrota;
    if (totalJogos === 0) {
      taxaVitoria = 0.0;
      taxaEmpate = 0.0;
      taxaDerrota = 0.0;
    } else {
      taxaVitoria = this.vitorias / totalJogos;
      taxaEmpate = this.empates / totalJogos;
      taxaDerrota = this.derrotas / totalJogos;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 ESTATÍSTICAS DO AGENTE (${this.simbolo})`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Partidas treinadas:   ${this.partidasTreinadas.toLocaleString('pt-BR')}`);
    console.log(`Estados conhecidos:   ${Object.keys(this.tabelaQ).length.toLocaleString('pt-BR')}`);
    console.log(`Curiosidade (Epsilon):${this.epsilon.toFixed(4)}`);
    console.log(`\n--- Desempenho ---`);
    console.log(`Vitórias:   ${String(this.vitorias).padStart(6)} (${(taxaVitoria * 100).toFixed(1).padStart(5)}%)`);
    console.log(`Empates:    ${String(this.empates).padStart(6)} (${(taxaEmpate * 100).toFixed(1).padStart(5)}%)`);
    console.log(`Derrotas:   ${String(this.derrotas).padStart(6)} (${(taxaDerrota * 100).toFixed(1).padStart(5)}%)`);
    console.log(`${'='.repeat(50)}\n`);
  }
}
