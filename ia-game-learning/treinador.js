/**
 * Módulo: 🏛️ treinador.js
 * Projeto: 📘 AI Game Learning
 *
 * Este módulo é o "Mestre da Guilda" ou o "Dungeon Master".
 * Ele é responsável por orquestrar o treinamento dos Agentes,
 * colocando-os para batalhar entre si em um processo chamado "self-play".
 *
 * Responsabilidades:
 * - Gerenciar o loop de treinamento principal (milhares de partidas).
 * - Coordenar a interação entre os Agentes e o Ambiente.
 * - Atribuir as recompensas corretas a cada Agente no final da partida.
 * - Exibir estatísticas de treinamento em tempo real com uma interface rica.
 * - Salvar o conhecimento (modelos) e estatísticas dos Agentes treinados.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import { AmbienteJogoDaVelha } from './ambiente.js';
import { AgenteQLearning } from './agente.js';

// Obtém o diretório atual (equivalente ao __dirname do CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Orquestra o treinamento de dois agentes Q-Learning através de self-play,
 * com uma interface de usuário rica para acompanhamento em tempo real.
 * 
 * É como o "Mestre da Guilda" no Ragnarok que organiza as War of Emperium:
 * coloca dois times para batalhar, registra os resultados, cria checkpoints
 * (save points) e ajuda todos a evoluírem com a experiência adquirida.
 * 
 * @property {AgenteQLearning} agenteX - O agente que joga como 'X' (jogador 1)
 * @property {AgenteQLearning} agenteO - O agente que joga como 'O' (jogador 2)
 * @property {AmbienteJogoDaVelha} ambiente - O tabuleiro/arena onde as batalhas acontecem
 * @property {string} pastaModelos - Diretório onde os modelos treinados são salvos
 * @property {Array<Object>} #checkpoints - Lista de metadados dos checkpoints salvos
 */
export class Treinador {
  #checkpoints = [];

  /**
   * Cria um novo Treinador para orquestrar o treinamento por self-play.
   * 
   * É como criar um NPC Mestre de Guilda que vai organizar batalhas de treino
   * entre dois personagens, registrando tudo e ajudando-os a evoluir.
   * 
   * @param {AgenteQLearning} agenteX - O agente que jogará como 'X'
   * @param {AgenteQLearning} agenteO - O agente que jogará como 'O'
   * @param {AmbienteJogoDaVelha} ambiente - O ambiente/tabuleiro do jogo
   */
  constructor(agenteX, agenteO, ambiente, test_treinador = false) {
    this.agenteX = agenteX;
    this.agenteO = agenteO;
    this.ambiente = ambiente;
    this.test_treinador = test_treinador;
    this.pastaModelos = path.resolve(__dirname, 'modelos_treinados');

    // Cria o diretório se não existir
    if (!fs.existsSync(this.pastaModelos) && !this.test_treinador) {
      fs.mkdirSync(this.pastaModelos, { recursive: true });
    }
  }

  /**
   * Executa uma única partida (um episódio) entre os dois agentes.
   * 
   * É como organizar uma batalha de treino no Ragnarok: os dois jogadores
   * se enfrentam, cada um tomando suas decisões, até que haja um vencedor
   * ou empate. Depois, ambos aprendem com o resultado.
   * 
   * @returns {number} O jogador vencedor (1 para 'X', 2 para 'O', 0 para empate)
   */
  executarUmaPartida() {
    this.ambiente.reiniciarPartida();
    this.agenteX.iniciarNovaPartida();
    this.agenteO.iniciarNovaPartida();

    while (!this.ambiente.partidaFinalizada) {
      const agenteDaVez = this.ambiente.jogadorAtual === 1 ? this.agenteX : this.agenteO;
      const estadoAtual = this.ambiente.obterEstadoComoTupla();
      const acoesValidas = this.ambiente.obterAcoesValidas();
      const acaoEscolhida = agenteDaVez.escolherAcao(estadoAtual, acoesValidas, true);
      agenteDaVez.registrarJogada(estadoAtual, acaoEscolhida);
      this.ambiente.executarJogada(acaoEscolhida);
    }

    // Atribui recompensas baseado no resultado
    let recompensaX, recompensaO;
    if (this.ambiente.vencedor === 1) {
      recompensaX = 1.0;
      recompensaO = -1.0;
    } else if (this.ambiente.vencedor === 2) {
      recompensaX = -1.0;
      recompensaO = 1.0;
    } else {
      recompensaX = 0.0;
      recompensaO = 0.0;
    }

    this.agenteX.aprenderComFimDePartida(recompensaX);
    this.agenteO.aprenderComFimDePartida(recompensaO);

    return this.ambiente.vencedor;
  }

  /**
   * Executa o loop de treinamento principal com interface visual avançada.
   *
   * É como organizar um "bootcamp" intensivo no Ragnarok: milhares de batalhas
   * consecutivas onde os agentes aprendem e evoluem, com checkpoints periódicos
   * (save games) para preservar o progresso.
   *
   * Durante o loop os checkpoints são salvos silenciosamente. Ao final, é exibido
   * um resumo completo de todos os checkpoints criados.
   *
   * @param {number} [numeroDePartidas=50000] - Quantas partidas realizar no treinamento
   * @param {number} [intervaloLog=1000] - A cada quantas partidas resetar contadores da janela
   * @param {number} [intervaloCheckpoint=10000] - A cada quantas partidas criar um checkpoint
   * @returns {void}
   */
  treinar(numeroDePartidas = 50000, intervaloLog = 1000, intervaloCheckpoint = 10000) {
    console.log("\n" + "=".repeat(50));
    console.log("⚔️ INICIANDO TREINAMENTO INTENSIVO (SELF-PLAY) ⚔️");
    console.log("=".repeat(50));
    console.log(`Total de Partidas: ${numeroDePartidas.toLocaleString('pt-BR')}`);
    console.log(`Ambiente: Tabuleiro ${this.ambiente.dimensao}x${this.ambiente.dimensao}`);
    console.log("=".repeat(50) + "\n");

    let vitoriasXJanela = 0;
    let vitoriasOJanela = 0;
    let empatesJanela = 0;

    const tempoInicio = Date.now();

    // Reseta array de checkpoints
    this.#checkpoints = [];

    // Cria barra de progresso com formato personalizado
    const barraProgresso = new cliProgress.SingleBar({
      format: colors.cyan('{bar}') + ' | {percentage}% | {value}/{total} | ETA: {eta}s | ' +
        colors.green('εX: {epsilonX}') + ' | ' + colors.yellow('εO: {epsilonO}') + ' | ' +
        colors.blue('Empates: {taxaEmpate}%'),
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      clearOnComplete: false,
      stopOnComplete: true
    });

    // Inicia a barra
    barraProgresso.start(numeroDePartidas, 0, {
      epsilonX: this.agenteX.epsilon.toFixed(4),
      epsilonO: this.agenteO.epsilon.toFixed(4),
      taxaEmpate: '0.0'
    });

    for (let partidaAtual = 0; partidaAtual < numeroDePartidas; partidaAtual++) {
      const vencedor = this.executarUmaPartida();

      if (vencedor === 1) vitoriasXJanela++;
      else if (vencedor === 2) vitoriasOJanela++;
      else empatesJanela++;

      // Calcula taxa de empate da janela atual
      const totalJanela = vitoriasXJanela + vitoriasOJanela + empatesJanela || 1;
      const taxaEmpate = ((empatesJanela / totalJanela) * 100).toFixed(1);

      // Atualiza a barra de progresso
      barraProgresso.update(partidaAtual + 1, {
        epsilonX: this.agenteX.epsilon.toFixed(4),
        epsilonO: this.agenteO.epsilon.toFixed(4),
        taxaEmpate: taxaEmpate
      });

      // Reset dos contadores da janela
      if ((partidaAtual + 1) % intervaloLog === 0) {
        vitoriasXJanela = 0;
        vitoriasOJanela = 0;
        empatesJanela = 0;
      }

      // Salva checkpoint periódico
      if ((partidaAtual + 1) % intervaloCheckpoint === 0) {
        this.#salvarCheckpoint(partidaAtual + 1);
      }
    }

    // Finaliza a barra
    barraProgresso.stop();

    const tempoTotalSegundos = (Date.now() - tempoInicio) / 1000;
    const tempoTotal = tempoTotalSegundos > 0 ? tempoTotalSegundos.toFixed(2) : '0.00';
    const pps = tempoTotalSegundos > 0 ? (numeroDePartidas / tempoTotalSegundos).toFixed(2) : '—';

    // Exibe resumo de checkpoints
    this.#exibirResumoCheckpoints();

    // Informações finais do treinamento
    console.log("\n" + "=".repeat(50));
    console.log("✅ TREINAMENTO CONCLUÍDO!");
    console.log("=".repeat(50));
    console.log(`⏱️  Tempo total: ${tempoTotal}s`);
    console.log(`📊 Partidas por segundo: ${pps}`);
    console.log("=".repeat(50) + "\n");

    // Exibe estatísticas finais dos agentes
    this.agenteX.imprimirEstatisticas();
    this.agenteO.imprimirEstatisticas();

    // Salva modelos finais
    if (!this.test_treinador) this.#salvarModelosFinais();
  }

  /**
   * Salva o estado atual dos agentes em um checkpoint.
   *
   * É como fazer um "save game" no meio da jornada: preserva todo o conhecimento
   * adquirido até o momento para que não seja perdido em caso de problemas.
   *
   * Registra metadados (número da partida, timestamp, caminhos dos arquivos) em
   * `this.#checkpoints` para posterior exibição de resumo.
   *
   * @private
   * @param {number} numeroPartida - Número da partida atual (identificador do checkpoint)
   * @returns {void}
   */
  #salvarCheckpoint(numeroPartida) {
    const caminhoX = path.join(
      this.pastaModelos,
      `agente_x_checkpoint_${numeroPartida}.json`
    );
    const caminhoO = path.join(
      this.pastaModelos,
      `agente_o_checkpoint_${numeroPartida}.json`
    );

    try {
      fs.writeFileSync(caminhoX, JSON.stringify(this.agenteX.tabelaQ, null, 2));
      fs.writeFileSync(caminhoO, JSON.stringify(this.agenteO.tabelaQ, null, 2));

      // Registra metadados do checkpoint
      this.#checkpoints.push({
        numeroPartida,
        timestamp: Date.now(),
        pasta: this.pastaModelos,
        sucesso: true
      });
    } catch (err) {
      // Registra falha
      this.#checkpoints.push({
        numeroPartida,
        timestamp: Date.now(),
        erro: err.message,
        sucesso: false
      });
    }
  }

  /**
   * Exibe um resumo limpo e organizado dos checkpoints salvos durante o treinamento.
   *
   * É como mostrar o "log de expedições" no Ragnarok: lista todas as vezes que
   * o progresso foi salvo, com data, hora e número da partida.
   *
   * @private
   * @returns {void}
   */
  #exibirResumoCheckpoints() {
    if (!this.#checkpoints || this.#checkpoints.length === 0) {
      console.log('\n⚠️  Nenhum checkpoint foi salvo.\n');
      return;
    }

    const checkpointsSucesso = this.#checkpoints.filter(cp => cp.sucesso);

    console.log('\n' + '━'.repeat(80));
    console.log('💾 CHECKPOINTS SALVOS');
    console.log('━'.repeat(80) + '\n');

    if (checkpointsSucesso.length > 0) {
      console.log(`✅ ${checkpointsSucesso.length} checkpoint(s) criado(s) com sucesso\n`);
      console.log(`📁 Pasta: ${checkpointsSucesso[0].pasta}\n`);

      checkpointsSucesso.forEach(cp => {
        const data = new Date(cp.timestamp);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const horaFormatada = data.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const partidaFormatada = cp.numeroPartida.toLocaleString('pt-BR');
        console.log(`  🎯 Partida ${partidaFormatada} — ${dataFormatada} às ${horaFormatada}`);
      });
    }

    // Exibe erros se houver
    const checkpointsErro = this.#checkpoints.filter(cp => !cp.sucesso);
    if (checkpointsErro.length > 0) {
      console.log(`\n❌ ${checkpointsErro.length} checkpoint(s) com erro:\n`);
      checkpointsErro.forEach(cp => {
        const partidaFormatada = cp.numeroPartida.toLocaleString('pt-BR');
        console.log(`  ⚠️  Partida ${partidaFormatada} — ${cp.erro}`);
      });
    }

    console.log('\n' + '━'.repeat(80) + '\n');
  }

  /**
   * Salva os modelos finais após o término do treinamento.
   * 
   * É como fazer o "save game final" no Ragnarok: todo o conhecimento e
   * experiência acumulados durante o treinamento são preservados permanentemente.
   * 
   * @private
   * @returns {void}
   * @throws {Error} Se houver problema ao salvar os arquivos
   */
  #salvarModelosFinais() {
    const caminhoX = path.join(
      this.pastaModelos,
      `agente_x_final_${this.ambiente.dimensao}x${this.ambiente.dimensao}.json`
    );
    const caminhoO = path.join(
      this.pastaModelos,
      `agente_o_final_${this.ambiente.dimensao}x${this.ambiente.dimensao}.json`
    );

    try {
      this.agenteX.salvarMemoria(caminhoX);
      this.agenteO.salvarMemoria(caminhoO);
    } catch (err) {
      console.error(`❌ Erro ao salvar modelos finais: ${err.message}`);
      throw err;
    }
  }

  /**
   * Coloca os agentes para jogar um contra o outro em modo de "performance máxima",
   * sem exploração (epsilon = 0), para avaliar o desempenho real.
   * 
   * É como fazer um "torneio oficial" no Ragnarok depois de muito treino:
   * os agentes usam apenas suas melhores estratégias, sem experimentar coisas novas.
   * 
   * Se os agentes não estiverem treinados, tenta carregar modelos salvos do disco.
   * 
   * @param {number} [numeroDePartidas=100000] - Quantidade de partidas para avaliar
   * @returns {void}
   */
  avaliarAgentes(numeroDePartidas = 100000) {
    console.log("\n" + "=".repeat(50));
    console.log("🏆 INICIANDO MODO DE AVALIAÇÃO (SEM EXPLORAÇÃO) 🏆");
    console.log("=".repeat(50));

    // --- LÓGICA DE CARREGAMENTO AUTOMÁTICO ---
    if (Object.keys(this.agenteX.tabelaQ).length === 0) {
      console.log("Agente X não treinado. Tentando carregar modelo do disco...");
      const caminhoX = path.join(
        this.pastaModelos,
        `superagente_final_${this.ambiente.dimensao}x${this.ambiente.dimensao}.json`
      );
      this.agenteX = AgenteQLearning.carregar(caminhoX, { jogador: 1 });
    }

    if (Object.keys(this.agenteO.tabelaQ).length === 0) {
      console.log("Agente O não treinado. Tentando carregar modelo do disco...");
      const caminhoO = path.join(
        this.pastaModelos,
        `agente_o_final_${this.ambiente.dimensao}x${this.ambiente.dimensao}.json`
      );
      this.agenteO = AgenteQLearning.carregar(caminhoO, { jogador: 2 });
    }

    let vitoriasX = 0;
    let vitoriasO = 0;
    let empates = 0;

    // Cria barra de progresso para avaliação
    const barraProgresso = new cliProgress.SingleBar({
      format: colors.cyan('{bar}') + ' | {percentage}% | {value}/{total} | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    barraProgresso.start(numeroDePartidas, 0);

    for (let i = 0; i < numeroDePartidas; i++) {
      this.ambiente.reiniciarPartida();

      while (!this.ambiente.partidaFinalizada) {
        const agenteDaVez = this.ambiente.jogadorAtual === 1 ? this.agenteX : this.agenteO;
        const estado = this.ambiente.obterEstadoComoTupla();
        const acoes = this.ambiente.obterAcoesValidas();
        const acao = agenteDaVez.escolherAcao(estado, acoes, false); // em_treinamento = false
        this.ambiente.executarJogada(acao);
      }

      if (this.ambiente.vencedor === 1) vitoriasX++;
      else if (this.ambiente.vencedor === 2) vitoriasO++;
      else empates++;

      barraProgresso.update(i + 1);
    }

    barraProgresso.stop();

    console.log("\n--- RESULTADO FINAL DA AVALIAÇÃO ---");
    console.log(`Partidas Jogadas: ${numeroDePartidas.toLocaleString('pt-BR')}`);
    console.log(`Vitórias de X: ${vitoriasX.toLocaleString('pt-BR')} (${((vitoriasX / numeroDePartidas) * 100).toFixed(1)}%)`);
    console.log(`Vitórias de O: ${vitoriasO.toLocaleString('pt-BR')} (${((vitoriasO / numeroDePartidas) * 100).toFixed(1)}%)`);
    console.log(`Empates: ${empates.toLocaleString('pt-BR')} (${((empates / numeroDePartidas) * 100).toFixed(1)}%)`);
    console.log("=".repeat(50) + "\n");
  }

  /**
   * Executa o script mesclar_modelos.js para criar o superagente.
   *
   * É como fazer uma "fusão de personagens" no Ragnarok: combina o conhecimento
   * dos dois agentes (X e O) em um único superagente com o melhor de ambos.
   *
   * @returns {void}
   */
  mesclarAgentesTrainados() {
    console.log("\n" + "=".repeat(50));
    console.log("🔄 EXECUTANDO MESCLAGEM DOS MODELOS...");
    console.log("=".repeat(50) + "\n");

    try {
      // Executa o script Node.js
      execSync('node mesclarModelos.js', { stdio: 'inherit' });
      console.log("\n✅ Mesclagem concluída com sucesso!");
    } catch (err) {
      console.error(`\n❌ Erro ao executar mesclagem: ${err.message}`);
    }
  }
}

// --- Bloco de Execução Principal ---
// Este bloco permite que o arquivo seja executado como um script.
if (import.meta.url === `file://${process.argv[1]}`) {
  // Opção 1: Treinamento Padrão (3x3, 200.000 partidas)
  const ambientePadrao = new AmbienteJogoDaVelha(3);
  const agenteXPadrao = new AgenteQLearning({ jogador: 1 });
  const agenteOPadrao = new AgenteQLearning({ jogador: 2 });

  const treinadorPadrao = new Treinador(agenteXPadrao, agenteOPadrao, ambientePadrao);
  treinadorPadrao.treinar(400000, 5000, 100000);

  // Avalia os agentes após o treinamento
  treinadorPadrao.avaliarAgentes();

  // Mescla os modelos treinados
  treinadorPadrao.mesclarAgentesTrainados();

  // Opção 2: Treinamento Customizado (ex: 4x4, 100.000 partidas)
  // Descomente as linhas abaixo para rodar um treino diferente.
  // console.log("\n--- INICIANDO TREINAMENTO CUSTOMIZADO 4x4 ---");
  // const ambiente4x4 = new AmbienteJogoDaVelha(4);
  // const agenteX4x4 = new AgenteQLearning({ jogador: 1, taxaDecaimentoEpsilon: 0.9999 });
  // const agenteO4x4 = new AgenteQLearning({ jogador: 2, taxaDecaimentoEpsilon: 0.9999 });
  //
  // const treinador4x4 = new Treinador(agenteX4x4, agenteO4x4, ambiente4x4);
  // treinador4x4.treinar(100000, 10000, 25000);
}
