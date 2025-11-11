/**
 * Módulo: 🧪 test_agente.js
 * Projeto: 📘 AI Game Learning
 *
 * Este arquivo contém testes para a classe AgenteQLearning, verificando
 * se o "cérebro" da nossa IA funciona como esperado.
 *
 * Para executar, use o comando no terminal:
 * node test_agente.js
 */

import { AgenteQLearning } from '../agente.js';

/**
 * Verifica se o Agente é criado com os atributos corretos.
 * 
 * É como criar um personagem novo no Ragnarok e verificar se todos
 * os atributos iniciais (STR, AGI, INT, etc.) foram configurados
 * corretamente no momento da criação.
 * 
 * Validações:
 * - Jogador configurado corretamente (1 para X, 2 para O)
 * - Símbolo atribuído corretamente ('X' ou 'O')
 * - Hiperparâmetros nos valores padrão esperados
 * - Tabela Q vazia (sem experiência prévia)
 * 
 * @returns {void}
 */
function testarInicializacao() {
  console.log("--- INICIANDO TESTE 1: INICIALIZAÇÃO DO AGENTE ---");
  const agente = new AgenteQLearning({ jogador: 2 });
  
  console.assert(agente.jogador === 2, "❌ Jogador deveria ser 2");
  console.assert(agente.simbolo === 'O', "❌ Símbolo deveria ser 'O'");
  console.assert(agente.alpha === 0.5, "❌ Alpha deveria ser 0.5");
  console.assert(Object.keys(agente.tabelaQ).length === 0, "❌ Tabela Q deveria estar vazia");
  
  console.log("✅ Agente criado com sucesso como jogador 'O'.");
  console.log("--- TESTE 1 FINALIZADO ---\n");
}

/**
 * Testa se a Equação de Bellman está sendo aplicada corretamente.
 * 
 * É como verificar se o sistema de EXP no Ragnarok está calculando
 * corretamente quanto um jogador aprende depois de derrotar um monstro.
 * 
 * A Equação de Bellman é o coração do Q-Learning:
 * Novo Q = Q_antigo + alpha × (recompensa + gamma × max_Q_futuro - Q_antigo)
 * 
 * Validações:
 * - Valor Q inicial é 0 (sem experiência)
 * - Após atualização, valor Q reflete o aprendizado correto
 * - Cálculo matemático está preciso (0.36 esperado)
 * 
 * @returns {void}
 */
function testarAtualizacaoQValor() {
  console.log("--- INICIANDO TESTE 2: APRENDIZADO (ATUALIZAÇÃO DE Q-VALOR) ---");
  const agente = new AgenteQLearning({ alpha: 0.5, gamma: 0.9 });
  
  const estadoInicial = JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const acao = 4; // Jogar no centro
  const proximoEstado = JSON.stringify([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  const recompensa = 0.0;
  
  // Simula que a melhor jogada futura vale 0.8
  agente.tabelaQ[proximoEstado] = { 0: 0.5, 1: 0.8, 2: 0.3 };
  
  const valorAntigo = agente.obterValorQ(estadoInicial, acao);
  console.log(`Opinião antiga sobre jogar no centro: ${valorAntigo}`);
  
  agente.atualizarValorQ(estadoInicial, acao, recompensa, proximoEstado);
  
  const valorNovo = agente.obterValorQ(estadoInicial, acao);
  // Cálculo esperado: 0 + 0.5 * (0 + 0.9 * 0.8 - 0) = 0.36
  console.log(`Nova opinião sobre jogar no centro: ${valorNovo.toFixed(2)}`);
  console.assert(
    Math.abs(valorNovo - 0.36) < 0.01,
    `❌ Valor deveria ser 0.36, mas é ${valorNovo.toFixed(2)}`
  );
  
  console.log("✅ O Agente ajustou sua estratégia corretamente!");
  console.log("--- TESTE 2 FINALIZADO ---\n");
}

/**
 * Verifica se a estratégia Epsilon-Greedy funciona corretamente.
 * 
 * É como testar se um jogador de Ragnarok consegue equilibrar entre
 * "explorar novos mapas" (epsilon alto) e "farmar no mapa conhecido"
 * (epsilon baixo). A estratégia epsilon-greedy é fundamental para
 * o aprendizado por reforço.
 * 
 * Cenários testados:
 * 1. Agente Aventureiro (ε=1.0): sempre explora aleatoriamente
 * 2. Agente Estrategista (ε=0.0): sempre escolhe a melhor ação conhecida
 * 
 * Validações:
 * - Ações escolhidas estão dentro das ações válidas
 * - Com epsilon=0, sempre escolhe a ação com maior valor Q
 * - Com epsilon=1, escolhe qualquer ação válida (exploração total)
 * 
 * @returns {void}
 */
function testarEscolhaDeAcao() {
  console.log("--- INICIANDO TESTE 3: ESCOLHA DE AÇÃO (EPSILON-GREEDY) ---");
  const estado = JSON.stringify([1, 2, 0, 0, 0, 0, 0, 0, 0]);
  const acoesValidas = [2, 3, 4, 5, 6, 7, 8];
  
  // Cenário 1: Agente Aventureiro (epsilon alto)
  const agenteAventureiro = new AgenteQLearning({ epsilon: 1.0 }); // 100% de chance de explorar
  const acaoEscolhida1 = agenteAventureiro.escolherAcao(estado, acoesValidas);
  console.log(`Agente Aventureiro (ε=1.0) escolheu a ação: ${acaoEscolhida1}`);
  console.assert(
    acoesValidas.includes(acaoEscolhida1),
    `❌ Ação ${acaoEscolhida1} não está nas ações válidas`
  );

  // Cenário 2: Agente Estrategista (epsilon baixo)
  const agenteEstrategista = new AgenteQLearning({ epsilon: 0.0 }); // 0% de chance de explorar
  agenteEstrategista.tabelaQ[estado] = { 2: 0.5, 3: 0.1, 4: 0.9 }; // Ação 4 é a melhor
  const acaoEscolhida2 = agenteEstrategista.escolherAcao(estado, acoesValidas);
  console.log(`Agente Estrategista (ε=0.0) escolheu a ação: ${acaoEscolhida2}`);
  console.assert(
    acaoEscolhida2 === 4,
    `❌ Agente deveria escolher ação 4 (melhor valor Q), mas escolheu ${acaoEscolhida2}`
  );
  
  console.log("✅ O Agente está balanceando exploração e estratégia como esperado.");
  console.log("--- TESTE 3 FINALIZADO ---\n");
}

/**
 * Função principal para rodar toda a suíte de testes do Agente.
 * 
 * É como fazer um "test server" completo no Ragnarok: testa todos
 * os sistemas críticos antes de ir para o servidor oficial (produção).
 * 
 * @returns {void}
 */
export function executarTodosTestes() {
  console.log("\n" + "=".repeat(50));
  console.log("🧪 INICIANDO BATERIA DE TESTES DO AGENTE 🧪");
  console.log("=".repeat(50) + "\n");
  
  testarInicializacao();
  testarAtualizacaoQValor();
  testarEscolhaDeAcao();
  
  console.log("=".repeat(50));
  console.log("✅ TODOS OS TESTES DO AGENTE CONCLUÍDOS COM SUCESSO!");
  console.log("=".repeat(50) + "\n");
}

// Executa os testes se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTodosTestes();
}
