/**
 * @module 🎮 fase-2/labirinto/main.js
 * @project 📘 AI Game Learning
 *
 * Arquivo de demonstração e teste do ambiente do Labirinto.
 * 
 * Este arquivo contém:
 * - Exemplo de uso básico do ambiente
 * - Simulação de sequências de ações
 * - Tratamento de erros e casos extremos
 * - Teste completo de solução do labirinto
 */

const { Labirinto } = require('./ambiente.js');

// TODO: O CÓDIGO EXECUTÁVEL DEVE FICAR AQUI DENTRO
(function main() {
  console.log('='.repeat(50));
  console.log('🎮 DEMONSTRAÇÃO DO AMBIENTE LABIRINTO');
  console.log('='.repeat(50));
  console.log();

  // Define a matriz do labirinto
  const matrizExemplo = [
    [' ', ' ', '#', ' ', ' ', ' '],
    ['#', ' ', ' ', ' ', '#', ' '],
    ['#', '#', '#', '#', ' ', ' '],
    [' ', '#', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', '#'],
    [' ', '#', ' ', ' ', ' ', ' ']
  ];
  const pontoInicialExemplo = [0, 0];
  const pontoFinalExemplo = [5, 5]; // O 'F' será desenhado aqui

  // Cria uma instância do labirinto
  const ambienteJogo = new Labirinto(
    matrizExemplo,
    pontoInicialExemplo,
    pontoFinalExemplo
  );

  console.log('--- Labirinto Inicial ---');
  ambienteJogo.imprimirLabirinto();
  console.log(`Posição inicial do agente: [${ambienteJogo.posicaoAgente}]`);
  console.log(`Ponto final: [${ambienteJogo.pontoFinal}]\n`);

  // Simulação de algumas ações
  console.log('--- Executando Ações (Simulação Padrão) ---');
  const acoes = [
    'baixo',
    'direita',
    'direita',
    'baixo',
    'esquerda',
    'baixo',
    'direita',
    'direita'
  ];

  let terminouSimulacao = false;
  
  for (let i = 0; i < acoes.length; i++) {
    const acao = acoes[i];
    console.log(`Ação ${i + 1}: '${acao}'`);

    try {
      const [novoEstado, recompensa, terminou] = ambienteJogo.executarAcao(acao);

      ambienteJogo.imprimirLabirinto();

      console.log(`   Novo Estado (Posição): [${novoEstado}]`);
      console.log(`   Recompensa: ${recompensa}`);
      console.log(`   Terminou: ${terminou}`);
      console.log('-'.repeat(20));

      if (terminou) {
        console.log('🎉 Agente chegou ao ponto final!');
        terminouSimulacao = true;
        break;
      }
    } catch (error) {
      // Captura ações inválidas como "pular"
      console.error(`Erro ao executar ação: ${error.message}`);
      ambienteJogo.imprimirLabirinto();
      console.log('-'.repeat(20));
    }
  }

  if (!terminouSimulacao) {
    console.log('Simulação terminada sem chegar ao objetivo.\n');
  }

  // Reinicia o ambiente
  console.log('\n--- Reiniciando o Ambiente ---');
  ambienteJogo.reiniciar();
  ambienteJogo.imprimirLabirinto();
  console.log(`Posição do agente após reiniciar: [${ambienteJogo.posicaoAgente}]\n`);

  // Exemplo de ação inválida (nome)
  console.log('--- Tentando Ação Inválida (Nome) ---');
  try {
    ambienteJogo.executarAcao('pular');
  } catch (error) {
    console.log(`Erro capturado com sucesso: ${error.message}\n`);
  }

  // Exemplo de ação inválida (movimento para parede)
  console.log('--- Tentando Andar na Parede ---');
  console.log(`Posição atual: [${ambienteJogo.posicaoAgente}]`);
  console.log("Executando 'cima' (deve bater na borda/parede imaginária)");
  
  const [novoEstado, recompensa, terminou] = ambienteJogo.executarAcao('cima');
  
  ambienteJogo.imprimirLabirinto();
  console.log(`   Novo Estado: [${novoEstado}] (provavelmente o mesmo)`);
  console.log(`   Recompensa: ${recompensa} (provavelmente negativa)`);

  console.log('\n' + '='.repeat(30) + '\n');

  // --- NOVO BLOCO: TESTE DA SOLUÇÃO COMPLETA ---
  console.log('--- 🎯 Teste de Solução Completa (Labirinto Principal) ---');

  // Reinicia o ambiente principal para o teste de vitória
  ambienteJogo.reiniciar();
  console.log('Labirinto principal reiniciado.');
  ambienteJogo.imprimirLabirinto();

  // Sequência de ações que resolve o labirinto 6x6
  const acoesVitoriaCompleta = [
    'direita', 'baixo', 'direita', 'direita', 'cima', 'direita',
    'direita', 'baixo', 'baixo', 'baixo', 'esquerda', 'esquerda',
    'esquerda', 'baixo', 'baixo', 'direita', 'direita', 'direita'
  ];

  console.log(`Executando sequência de ${acoesVitoriaCompleta.length} ações para vencer...\n`);

  let recompensaFinal = 0;
  let terminouFinal = false;

  for (let i = 0; i < acoesVitoriaCompleta.length; i++) {
    const acao = acoesVitoriaCompleta[i];
    console.log(`Passo ${i + 1}: '${acao}'`);

    try {
      // Captura o estado da *última* ação
      const [novoEstado, recompensa, terminou] = ambienteJogo.executarAcao(acao);
      
      recompensaFinal = recompensa;
      terminouFinal = terminou;

      ambienteJogo.imprimirLabirinto();
      console.log(`   Posição: [${novoEstado}]`);
      console.log(`   Recompensa nesta ação: ${recompensa}`);

      if (terminou) {
        console.log('\n🎉🎉🎉 AGENTE CHEGOU AO OBJETIVO (5, 5)! 🎉🎉🎉');
        break;
      }
    } catch (error) {
      console.error(`Erro inesperado no teste final: ${error.message}`);
      break;
    }
  }

  // Mostrar a recompensa final
  console.log('\n--- Resultado do Teste de Vitória Completo ---');
  console.log(`O agente terminou? ${terminouFinal}`);
  console.log(`**Recompensa da Ação Final (Vitória): ${recompensaFinal}**`);

  if (!terminouFinal) {
    console.log(
      'ALERTA: O teste de vitória falhou. A sequência de ações ou a lógica do labirinto pode estar incorreta.'
    );
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ DEMONSTRAÇÃO CONCLUÍDA');
  console.log('='.repeat(50));
})();
