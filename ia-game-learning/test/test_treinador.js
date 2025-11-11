/**
 * Módulo: 🧪 test_treinador.js
 * Projeto: 📘 AI Game Learning
 *
 * Este arquivo realiza um teste de integração rápido para a classe Treinador.
 * Ele verifica se o ciclo completo de treinamento (partida -> aprendizado)
 * funciona sem erros para um número pequeno de partidas.
 *
 * Para executar, use o comando no terminal:
 * node test_treinador.js
 */

import { AmbienteJogoDaVelha } from '../ambiente.js';
import { AgenteQLearning } from '../agente.js';
import { Treinador } from '../treinador.js';

/**
 * Verifica se o treinador consegue executar um ciclo de treinamento
 * curto sem levantar exceções.
 * 
 * É como fazer um "test server" no Ragnarok: antes de colocar o sistema
 * em produção (treinar por 200.000 partidas), fazemos um teste rápido
 * com apenas 100 partidas para garantir que tudo funciona corretamente.
 * 
 * Este é um teste de integração completo que verifica:
 * - O ambiente funciona corretamente
 * - Os agentes conseguem tomar decisões
 * - O ciclo de aprendizado está funcionando
 * - As estatísticas estão sendo registradas
 * 
 * Validações:
 * - O treinamento executa sem erros
 * - Os agentes aprendem algo (Tabela Q não vazia)
 * - O contador de partidas está correto
 * - A memória dos agentes pode ser acessada
 * 
 * @returns {void}
 * @throws {Error} Se qualquer validação falhar
 */
function testarCicloDeTreinamentoRapido() {
  console.log("--- INICIANDO TESTE 1: CICLO DE TREINAMENTO RÁPIDO ---");
  
  // 1. Configuração do cenário de teste
  const ambienteTeste = new AmbienteJogoDaVelha(3);
  const agenteXTeste = new AgenteQLearning({ jogador: 1 });
  const agenteOTeste = new AgenteQLearning({ jogador: 2 });
  
  const treinadorTeste = new Treinador(agenteXTeste, agenteOTeste, ambienteTeste, true);
  
  const numeroDePartidasTeste = 100;
  
  console.log(`Executando um mini-treinamento de ${numeroDePartidasTeste} partidas...`);
  
  // 2. Execução do método a ser testado
  // (Usamos um try/catch para capturar qualquer erro inesperado)
  try {
    // Passa intervaloCheckpoint muito alto para evitar criar arquivos durante teste
    treinadorTeste.treinar(numeroDePartidasTeste, 50, 999999);
  } catch (error) {
    // Se qualquer erro ocorrer, o teste falha
    const mensagemErro = `O treinamento falhou com um erro: ${error.message}`;
    console.error(`❌ ${mensagemErro}`);
    throw new Error(mensagemErro);
  }
  
  // 3. Verificação dos resultados
  // Verificamos se os agentes realmente aprenderam algo (suas memórias não estão vazias)
  const tamanhoTabelaX = Object.keys(agenteXTeste.tabelaQ).length;
  const tamanhoTabelaO = Object.keys(agenteOTeste.tabelaQ).length;
  
  if (tamanhoTabelaX === 0) {
    throw new Error("❌ A Tabela Q do Agente X não deveria estar vazia.");
  }
  
  if (tamanhoTabelaO === 0) {
    throw new Error("❌ A Tabela Q do Agente O não deveria estar vazia.");
  }
  
  // Verificamos se o número de partidas treinadas foi registrado corretamente
  if (agenteXTeste.partidasTreinadas !== numeroDePartidasTeste) {
    throw new Error(
      `❌ Agente X deveria ter ${numeroDePartidasTeste} partidas, mas tem ${agenteXTeste.partidasTreinadas}`
    );
  }
  
  if (agenteOTeste.partidasTreinadas !== numeroDePartidasTeste) {
    throw new Error(
      `❌ Agente O deveria ter ${numeroDePartidasTeste} partidas, mas tem ${agenteOTeste.partidasTreinadas}`
    );
  }
  
  console.log(`\n✅ O Agente X conhece ${tamanhoTabelaX} situações.`);
  console.log(`✅ O Agente O conhece ${tamanhoTabelaO} situações.`);
  console.log("✅ O ciclo de treinamento rápido foi concluído com sucesso!");
  console.log("--- TESTE 1 FINALIZADO ---\n");
}

/**
 * Função principal para rodar toda a suíte de testes do Treinador.
 * 
 * É como fazer um "system check" completo antes de começar um grande
 * evento no Ragnarok: garante que todos os sistemas de treinamento
 * estão funcionando perfeitamente.
 * 
 * @returns {void}
 * @throws {Error} Se qualquer teste falhar
 */
export function executarTodosTestes() {
  console.log("\n" + "=".repeat(50));
  console.log("🧪 INICIANDO BATERIA DE TESTES DO TREINADOR 🧪");
  console.log("=".repeat(50) + "\n");
  
  testarCicloDeTreinamentoRapido();
  
  console.log("=".repeat(50));
  console.log("✅ TODOS OS TESTES DO TREINADOR CONCLUÍDOS COM SUCESSO!");
  console.log("=".repeat(50) + "\n");
}

// Executa os testes se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTodosTestes();

}
