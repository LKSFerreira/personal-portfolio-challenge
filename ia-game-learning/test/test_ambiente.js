// 1. Importamos a "cozinha" para que o inspetor possa usá-la.
// Esta linha diz: "Vá ao arquivo './ambiente.js' e me traga a classe 'AmbienteJogoDaVelha'".
import { AmbienteJogoDaVelha } from '../ambiente.js';

/* ----------------------------------------------------------------------
 🧪 MÓDULO DE TESTES PARA O AMBIENTE
 Este arquivo contém todos os testes para a classe AmbienteJogoDaVelha.
 Execute com:  node test_ambiente.js
---------------------------------------------------------------------- */

/**
 * Função auxiliar para simular uma partida completa e exibir os resultados.
 * @param {AmbienteJogoDaVelha} jogo - A instância do ambiente do jogo.
 * @param {string} titulo - O título do cenário de teste.
 * @param {number[]} jogadas - Um array com a sequência de jogadas a serem executadas.
 */
function simularPartida(jogo, titulo, jogadas) {
  // ... cole aqui exatamente a função simularPartida que eu te mostrei antes ...
  console.log("=".repeat(50));
  console.log(`➡️  Cenário: ${titulo}`);
  console.log("=".repeat(50));

  jogo.reiniciarPartida();
  console.log("Tabuleiro Inicial:");
  jogo.exibirTabuleiro();

  for (const [i, acao] of jogadas.entries()) {
    const jogador = jogo.jogadorAtual === 1 ? "X" : "O";
    console.log(`Turno ${i + 1}: Jogador '${jogador}' joga na posição ${acao}.`);

    try {
      const [, , fim] = jogo.executarJogada(acao);
      jogo.exibirTabuleiro();

      if (fim) {
        if (jogo.vencedor === 0) {
          console.log(`🏁 Partida finalizada! Resultado: Empate (Velha)!\n`);
        } else {
          const simboloVencedor = jogo.vencedor === 1 ? "X" : "O";
          console.log(`🏁 Partida finalizada! Vencedor: Jogador '${simboloVencedor}'\n`);
        }
        return;
      }
    } catch (e) {
      console.error(`❌ ERRO AO EXECUTAR JOGADA: ${e.message}`);
      return;
    }
  }
  console.log("⚠️  A sequência de jogadas terminou antes do fim da partida.");
}


// --- INÍCIO DA EXECUÇÃO DOS TESTES ---

console.log("\n" + "=".repeat(50));
console.log("🧪 INICIANDO BATERIA DE TESTES DO AMBIENTE 🧪");

// Testes para o tabuleiro 3x3
const jogo3x3 = new AmbienteJogoDaVelha();
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