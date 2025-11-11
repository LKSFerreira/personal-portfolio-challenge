/**
 * Módulo: 🕹️ jogar.js
 * Projeto: 📘 AI Game Learning
 *
 * Este módulo é a arena onde um jogador humano pode desafiar a IA que treinamos.
 * 
 * É como desafiar um NPC mestre de Ragnarok Online depois de semanas de treino:
 * você vai testar suas habilidades contra uma IA que treinou por milhares de partidas.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readlineSync from 'readline-sync';
import { AmbienteJogoDaVelha } from './ambiente.js';
import { AgenteQLearning } from './agente.js';

// Obtém o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Limpa o console para uma melhor experiência de usuário.
 * 
 * É como limpar a tela do Ragnarok quando você entra em um novo mapa:
 * remove toda a informação antiga e deixa tudo pronto para o novo conteúdo.
 * 
 * Funciona em Windows (cls) e Unix/Linux/Mac (clear).
 * 
 * @returns {void}
 */
function limparTela() {
  console.clear();
}

/**
 * Cria uma função auxiliar para pausar a execução (sleep).
 * 
 * É como quando você espera um cast de skill no Ragnarok terminar:
 * o jogo pausa por alguns segundos antes de continuar.
 * 
 * @param {number} ms - Tempo em milissegundos para pausar
 * @returns {Promise<void>} Promise que resolve após o tempo especificado
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Pede ao jogador humano para escolher uma jogada válida e a retorna.
 * 
 * É como escolher qual habilidade usar no Ragnarok: você vê as opções
 * disponíveis e escolhe uma. Se escolher uma inválida, o jogo te avisa
 * e pede para escolher de novo.
 * 
 * @param {AmbienteJogoDaVelha} ambiente - O ambiente do jogo com o tabuleiro atual
 * @returns {number} A posição escolhida pelo jogador (0-8)
 */
function obterJogadaHumano(ambiente) {
  const acoesValidas = ambiente.obterAcoesValidas();
  
  console.log("\n--- Tabuleiro com Posições Livres ---");
  const simbolos = { 0: ' ', 1: 'X', 2: 'O' };
  
  for (let i = 0; i < ambiente.dimensao; i++) {
    const inicio = i * ambiente.dimensao;
    const fim = inicio + ambiente.dimensao;
    const linha = [];
    
    for (let idx = inicio; idx < fim; idx++) {
      if (ambiente.tabuleiro[idx] === 0) {
        linha.push(String(idx));
      } else {
        linha.push(simbolos[ambiente.tabuleiro[idx]]);
      }
    }
    
    console.log(" " + linha.join(" | "));
    if (i < ambiente.dimensao - 1) {
      console.log("---" + "+---".repeat(ambiente.dimensao - 1));
    }
  }
  console.log("------------------------------------");

  while (true) {
    const posicaoStr = readlineSync.question(
      `Sua vez. Escolha uma posição livre (${acoesValidas.join(', ')}): `
    );
    
    const posicao = parseInt(posicaoStr);
    
    if (!isNaN(posicao) && acoesValidas.includes(posicao)) {
      return posicao;
    } else if (isNaN(posicao)) {
      console.log("❌ Entrada inválida. Por favor, digite um número.");
    } else {
      console.log("❌ Jogada inválida! A posição não está livre ou não existe.");
    }
  }
}

/**
 * Determina quem começa a próxima partida com base no resultado anterior.
 * 
 * É como as regras de "winner stays" em jogos de luta do Ragnarok:
 * - Se você perdeu: a IA começa (punição)
 * - Se você ganhou: você escolhe quem começa (recompensa)
 * - Se empatou ou é a primeira partida: sorteia
 * 
 * @param {number} resultadoAnterior - O vencedor da partida anterior (-1 se primeira partida)
 * @param {number} jogadorHumano - O ID do jogador humano (1 ou 2)
 * @returns {number} O jogador que começará a próxima partida (1 ou 2)
 */
function determinarJogadorInicial(resultadoAnterior, jogadorHumano) {
  const jogadorIA = jogadorHumano === 1 ? 2 : 1;
  
  if (resultadoAnterior === -1 || resultadoAnterior === 0) {
    console.log("\n🎲 Resultado anterior foi empate ou é a primeira partida. Sorteando quem começa...");
    return Math.random() < 0.5 ? 1 : 2;
  } else if (resultadoAnterior === jogadorIA) {
    console.log("\n🤖 Você perdeu a última partida. A IA começa como punição!");
    return jogadorIA;
  } else {
    console.log("\n🏆 Você venceu a última partida! Como recompensa, você escolhe quem começa.");
    while (true) {
      const escolha = readlineSync.question("Você quer começar (S) ou deixar a IA começar (N)? [S/N]: ").toUpperCase();
      if (escolha === 'S') {
        return jogadorHumano;
      } else if (escolha === 'N') {
        return jogadorIA;
      } else {
        console.log("Opção inválida.");
      }
    }
  }
}

/**
 * Exibe as regras especiais do jogo no início da primeira partida.
 * 
 * É como o tutorial que aparece quando você joga um jogo pela primeira vez:
 * explica as mecânicas especiais antes de começar.
 * 
 * @returns {void}
 */
function exibirRegrasIniciais() {
  console.log("\n" + "-".repeat(50));
  console.log("📜 REGRAS ESPECIAIS DE QUEM COMEÇA 📜");
  console.log("-".repeat(50));
  console.log("A cada nova partida, a ordem de início é decidida assim:");
  console.log(" • Se você VENCEU: Você tem o direito de escolher quem começa.");
  console.log(" • Se você PERDEU: A IA sempre começará a próxima partida.");
  console.log(" • Se houve EMPATE: Um novo sorteio decidirá quem começa.");
  console.log("-".repeat(50));
  readlineSync.question("\nPressione Enter para continuar...");
}

/**
 * Gerencia o fluxo de uma única partida entre um humano e a IA.
 * 
 * É como entrar em uma sala de duelo no Ragnarok: configura tudo,
 * gerencia os turnos alternados, e no final declara o vencedor.
 * 
 * O jogo alterna entre o humano e a IA até que alguém ganhe ou empate.
 * A IA sempre joga com epsilon=0 (sem exploração), usando apenas o
 * conhecimento adquirido no treinamento.
 * 
 * @param {AgenteQLearning} agenteIA - O agente treinado que será o oponente
 * @param {number} [resultadoAnterior=-1] - Vencedor da partida anterior (-1 se primeira)
 * @param {number|null} [jogadorHumanoDefinido=null] - ID do jogador humano ou null
 * @returns {Array<number>} Tupla [vencedor, jogadorHumano]
 */
async function iniciarPartidaHumanoVsIA(agenteIA, resultadoAnterior = -1, jogadorHumanoDefinido = null) {
  limparTela();
  console.log("\n" + "=".repeat(50));
  console.log("⚔️ NOVA PARTIDA ⚔️");
  console.log("=".repeat(50));

  const ambiente = new AmbienteJogoDaVelha(3);
  
  let jogadorHumano = jogadorHumanoDefinido;
  
  if (resultadoAnterior === -1) {
    while (jogadorHumano === null) {
      const escolha = readlineSync.question("Você quer ser 'X' ou 'O'? [X/O]: ").toUpperCase();
      if (escolha === 'X') {
        jogadorHumano = 1;
      } else if (escolha === 'O') {
        jogadorHumano = 2;
      } else {
        console.log("Opção inválida.");
      }
    }
    
    agenteIA.jogador = jogadorHumano === 1 ? 2 : 1;
    agenteIA.simbolo = agenteIA.jogador === 2 ? 'O' : 'X';
  }
  
  const simboloHumano = jogadorHumano === 1 ? 'X' : 'O';
  console.log(`\nVocê joga como '${simboloHumano}'. A IA jogará como '${agenteIA.simbolo}'.`);
  
  ambiente.jogadorAtual = determinarJogadorInicial(resultadoAnterior, jogadorHumano);
  const simboloInicio = ambiente.jogadorAtual === 1 ? 'X' : 'O';
  console.log(`O jogador '${simboloInicio}' começa a partida!`);
  
  if (resultadoAnterior === -1) {
    exibirRegrasIniciais();
  } else {
    readlineSync.question("\nPressione Enter para começar a partida...");
  }

  while (!ambiente.partidaFinalizada) {
    limparTela();
    console.log(`Você ('${simboloHumano}') vs. IA ('${agenteIA.simbolo}')\n`);
    ambiente.exibirTabuleiro();
    
    const estadoAtual = ambiente.obterEstadoComoTupla();
    const acoesValidas = ambiente.obterAcoesValidas();

    let acao;
    if (ambiente.jogadorAtual === jogadorHumano) {
      acao = obterJogadaHumano(ambiente);
    } else {
      console.log(`\nTurno da IA (${agenteIA.simbolo})... pensando...`);
      await sleep(1000);
      acao = agenteIA.escolherAcao(estadoAtual, acoesValidas, false); // em_treinamento=false
      console.log(`IA escolheu a posição ${acao}.`);
      await sleep(1000);
    }

    ambiente.executarJogada(acao);
  }

  limparTela();
  console.log("\n" + "=".repeat(50));
  console.log("FIM DE JOGO!");
  console.log("=".repeat(50));
  ambiente.exibirTabuleiro();
  
  if (ambiente.vencedor === 0) {
    console.log("Resultado: 🤝 EMPATE! Você conseguiu igualar o mestre!");
  } else if (ambiente.vencedor === jogadorHumano) {
    console.log("Resultado: 🏆 IMPOSSÍVEL! Você venceu! Encontrou um bug ou uma falha no treinamento?");
  } else {
    console.log("Resultado: 🤖 DERROTA! A IA venceu, como esperado.");
  }
  
  console.log("=".repeat(50) + "\n");
  return [ambiente.vencedor, jogadorHumano];
}

/**
 * Função principal que gerencia o jogo e as novas partidas.
 * 
 * É como o lobby principal do Ragnarok: carrega seus dados salvos,
 * te permite jogar quantas partidas quiser, e mantém controle de tudo.
 * 
 * Responsabilidades:
 * - Carregar o modelo treinado da IA
 * - Gerenciar múltiplas partidas consecutivas
 * - Manter o histórico de resultados para determinar quem começa
 * - Permitir ao jogador decidir se quer jogar de novo
 * 
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  limparTela();
  console.log("\n" + "=".repeat(50));
  console.log("🤖 BEM-VINDO AO DESAFIO CONTRA A IA MESTRE! 🤖");
  console.log("=".repeat(50));

  const caminhoModelo = path.join(__dirname, 'modelos_treinados', 'superagente_final_3x3.json');
  
  if (!fs.existsSync(caminhoModelo)) {
    console.log(`\n❌ ERRO: Modelo '${caminhoModelo}' não encontrado.`);
    process.exit(1);
  }
  
  // Carrega o agente com epsilon=0 (sem exploração, apenas exploração)
  const agenteIA = AgenteQLearning.carregar(caminhoModelo, { jogador: 0, epsilon: 0 });

  let jogarNovamente = true;
  let resultadoAnterior = -1;
  let jogadorHumano = null;

  while (jogarNovamente) {
    const [resultadoAtual, jogadorHumanoAtual] = await iniciarPartidaHumanoVsIA(
      agenteIA, 
      resultadoAnterior, 
      jogadorHumano
    );
    
    resultadoAnterior = resultadoAtual;
    
    if (jogadorHumano === null) {
      jogadorHumano = jogadorHumanoAtual;
    }
    
    const resposta = readlineSync.question("🎮 Jogar novamente? (s/n): ").trim().toLowerCase();
    if (resposta !== 's' && resposta !== 'sim') {
      jogarNovamente = false;
    }
  }
  
  console.log("\n👋 Obrigado por jogar! Até a próxima.");
}

// --- Bloco de Execução Principal ---
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`❌ Erro fatal: ${error.message}`);
    process.exit(1);
  });
}
