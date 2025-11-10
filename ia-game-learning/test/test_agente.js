/**
 * @module 🧪 test_agente.js
 * @project 📘 AI Game Learning
 *
 * Este arquivo contém testes para a classe AgenteQLearning, verificando
 * se o "cérebro" da nossa IA funciona como esperado.
 *
 * Para executar:
 * node test_agente.js
 */

import { AgenteQLearning } from '../agente.js';

/**
 * Testa a inicialização correta do Agente Q-Learning.
 * 
 * Verifica se o Agente é criado com os parâmetros corretos, como um
 * personagem novo no Ragnarok com seus atributos iniciais configurados.
 * 
 * Validações:
 * - Jogador configurado corretamente (X ou O)
 * - Símbolo atribuído corretamente
 * - Hiperparâmetros nos valores padrão
 * - Tabela Q vazia (sem experiência prévia)
 * 
 * @returns {void}
 */
function testarInicializacao() {
  console.log("--- INICIANDO TESTE 1: INICIALIZAÇÃO DO AGENTE ---");
  const agente = new AgenteQLearning({ jogador: 2 });

  console.assert(agente.jogador === 2);
  console.assert(agente.simbolo === 'O');
  console.assert(agente.alpha === 0.5);
  console.assert(Object.keys(agente.tabelaQ).length === 0);

  console.log("✅ Agente criado com sucesso como jogador 'O'.");
  console.log("--- TESTE 1 FINALIZADO ---\n");
}

/**
 * Testa o aprendizado do Agente através da atualização de valores Q.
 * 
 * Simula uma situação de jogo e verifica se o Agente atualiza corretamente
 * sua "memória" (Tabela Q) usando a Equação de Bellman. É como ganhar EXP
 * no Ragnarok e aprender com a experiência.
 * 
 * Validações:
 * - Valor Q inicial é 0 (sem experiência)
 * - Após atualização, valor Q reflete o aprendizado
 * - Cálculo matemático da Equação de Bellman está correto
 * 
 * @returns {void}
 */
function testarAtualizacaoQValor() {
  console.log("--- INICIANDO TESTE 2: APRENDIZADO (ATUALIZAÇÃO DE Q-VALOR) ---");
  const agente = new AgenteQLearning({ alpha: 0.5, gamma: 0.9 });

  const estadoInicial = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const acao = 4;
  const proximoEstado = [0, 0, 0, 0, 1, 0, 0, 0, 0];
  const recompensa = 0.0;

  agente.tabelaQ[JSON.stringify(proximoEstado)] = { 0: 0.5, 1: 0.8, 2: 0.3 };

  const valorAntigo = agente.obterValorQ(estadoInicial, acao);
  console.log(`Opinião antiga sobre jogar no centro: ${valorAntigo}`);

  agente.atualizarValorQ(estadoInicial, acao, recompensa, proximoEstado);

  const valorNovo = agente.obterValorQ(estadoInicial, acao);
  console.log(`Nova opinião sobre jogar no centro: ${valorNovo.toFixed(2)}`);
  console.assert(Math.abs(valorNovo - 0.36) < 1e-6);

  console.log("✅ O Agente ajustou sua estratégia corretamente!");
  console.log("--- TESTE 2 FINALIZADO ---\n");
}

/**
 * Testa a escolha de ações usando a estratégia Epsilon-Greedy.
 * 
 * Verifica se o Agente equilibra corretamente exploração (tentar coisas novas)
 * e exploração (usar o que já sabe). É como um jogador de Ragnarok que às
 * vezes explora mapas novos e às vezes farma no mapa conhecido.
 * 
 * Validações:
 * - Agente com epsilon=1.0 explora aleatoriamente
 * - Agente com epsilon=0.0 sempre escolhe a melhor ação conhecida
 * - Ações escolhidas estão dentro das ações válidas
 * 
 * @returns {void}
 */
function testarEscolhaDeAcao() {
  console.log("--- INICIANDO TESTE 3: ESCOLHA DE AÇÃO (EPSILON-GREEDY) ---");
  const estado = [1, 2, 0, 0, 0, 0, 0, 0, 0];
  const acoesValidas = [2, 3, 4, 5, 6, 7, 8];

  const agenteAventureiro = new AgenteQLearning({ epsilon: 1.0 });
  const acao1 = agenteAventureiro.escolherAcao(estado, acoesValidas);
  console.log(`Agente Aventureiro (ε=1.0) escolheu a ação: ${acao1}`);
  console.assert(acoesValidas.includes(acao1));

  const agenteEstrategista = new AgenteQLearning({ epsilon: 0.0 });
  agenteEstrategista.tabelaQ[JSON.stringify(estado)] = { 2: 0.5, 3: 0.1, 4: 0.9 };
  const acao2 = agenteEstrategista.escolherAcao(estado, acoesValidas);
  console.log(`Agente Estrategista (ε=0.0) escolheu a ação: ${acao2}`);
  console.assert(acao2 === 4);

  console.log("✅ O Agente está balanceando exploração e estratégia como esperado.");
  console.log("--- TESTE 3 FINALIZADO ---\n");
}

/**
 * Executa toda a bateria de testes do Agente Q-Learning.
 * 
 * Função principal que orquestra todos os testes, garantindo que o "cérebro"
 * da IA funciona corretamente antes de começar o treinamento real. É como
 * fazer um "test server" no Ragnarok antes de jogar no servidor oficial.
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
