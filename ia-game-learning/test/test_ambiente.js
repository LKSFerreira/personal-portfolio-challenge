/**
 * Módulo: 🧪 test_ambiente.js
 * Projeto: 📘 AI Game Learning
 *
 * Este arquivo contém todos os testes para a classe AmbienteJogoDaVelha.
 * Ele é projetado para ser executado diretamente do terminal para verificar
 * se o ambiente do jogo está funcionando corretamente.
 *
 * Para executar, use o comando no terminal:
 * node test_ambiente.js
 */

import { AmbienteJogoDaVelha } from '../ambiente.js';

/**
 * Função auxiliar para simular uma partida completa e exibir os resultados.
 * 
 * É como gravar um replay de uma partida no Ragnarok: executa todas as
 * jogadas na sequência e mostra o que aconteceu em cada turno, verificando
 * se as regras do jogo estão sendo respeitadas.
 * 
 * @param {AmbienteJogoDaVelha} jogo - A instância do ambiente do jogo
 * @param {string} titulo - O título do cenário de teste
 * @param {Array<number>} jogadas - Uma lista com a sequência de jogadas a serem executadas
 * @returns {void}
 */
function simularPartida(jogo, titulo, jogadas) {
  console.log("=".repeat(50));
  console.log(`➡️  Cenário: ${titulo}`);
  console.log("=".repeat(50));

  jogo.reiniciarPartida();
  console.log("Tabuleiro Inicial:");
  jogo.exibirTabuleiro();

  for (let i = 0; i < jogadas.length; i++) {
    const acao = jogadas[i];
    const jogador = jogo.jogadorAtual === 1 ? 'X' : 'O';
    console.log(`Turno ${i + 1}: Jogador '${jogador}' joga na posição ${acao}.`);
    
    try {
      const [_, __, fim] = jogo.executarJogada(acao);
      jogo.exibirTabuleiro();

      if (fim) {
        if (jogo.vencedor === 0) {
          console.log(`🏁 Partida finalizada! Resultado: Empate (Velha)!\n`);
        } else {
          const simboloVencedor = jogo.vencedor === 1 ? 'X' : 'O';
          console.log(`🏁 Partida finalizada! Vencedor: Jogador '${simboloVencedor}'\n`);
        }
        return; // Termina a simulação para este cenário
      }
      
    } catch (error) {
      console.log(`❌ ERRO AO EXECUTAR JOGADA: ${error.message}`);
      return;
    }
  }
  
  console.log("⚠️  A sequência de jogadas terminou antes do fim da partida.\n");
}

/**
 * Executa toda a bateria de testes do ambiente do Jogo da Velha.
 * 
 * É como fazer testes de qualidade em todas as arenas do Ragnarok:
 * verifica se as regras funcionam em diferentes tamanhos de tabuleiro
 * e em diferentes cenários (vitória, empate, diferentes posições).
 * 
 * Cenários testados:
 * - Tabuleiro 3x3: vitória linha, empate, vitória coluna
 * - Tabuleiro 4x4: vitória diagonal
 * 
 * @returns {void}
 */
function executarTodosTestes() {
  console.log("\n" + "=".repeat(50));
  console.log("🧪 INICIANDO BATERIA DE TESTES DO AMBIENTE 🧪");

  // Testes para o tabuleiro 3x3
  const jogo3x3 = new AmbienteJogoDaVelha(3);
  console.log("\n✅ Jogo 3x3 criado com sucesso!");
  
  simularPartida(jogo3x3, "X vence na primeira linha", [0, 4, 1, 5, 2]);
  simularPartida(jogo3x3, "Empate (Velha)", [0, 4, 8, 2, 6, 3, 5, 7, 1]);
  simularPartida(jogo3x3, "O vence na coluna do meio", [0, 4, 2, 1, 3, 7]);

  // Testes para o tabuleiro 4x4
  const jogo4x4 = new AmbienteJogoDaVelha(4);
  console.log("\n✅ Jogo 4x4 criado com sucesso!");
  simularPartida(jogo4x4, "X vence na diagonal principal (4x4)", [0, 1, 5, 2, 10, 3, 15]);

  console.log("\n" + "=".repeat(50));
  console.log("✅ BATERIA DE TESTES CONCLUÍDA!");
  console.log("=".repeat(50) + "\n");
}

// Executa os testes se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTodosTestes();
}

// Exporta as funções para uso em outros módulos
export { simularPartida, executarTodosTestes };
