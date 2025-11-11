/**
 * Módulo: 💎 mesclarModelos.js
 * Projeto: 📘 AI Game Learning
 *
 * Esta é uma ferramenta para criar um "Superagente" a partir de dois agentes
 * previamente treinados (X e O).
 * 
 * É como fazer uma "fusão" no Ragnarok: pega o conhecimento de dois personagens
 * experientes e cria um único personagem com o melhor conhecimento de ambos.
 * 
 * O processo funciona assim:
 * 1. Carrega as memórias (Q-Tables) dos dois agentes
 * 2. Mescla o conhecimento, mantendo sempre os melhores valores Q
 * 3. Salva o "Superagente" resultante
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtém o diretório atual (equivalente ao __dirname do CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carrega, mescla e salva as Tabelas Q de dois agentes.
 * 
 * É como combinar duas "Enciclopédias de Monstros" no Ragnarok: cada jogador
 * conhece monstros diferentes ou tem estratégias diferentes para os mesmos monstros.
 * O Superagente fica com o melhor conhecimento de ambos.
 * 
 * Estratégia de fusão:
 * - Situações que só um agente conhece: adiciona ao Superagente
 * - Situações conhecidas por ambos: mantém a melhor avaliação (maior valor Q)
 * - Ações novas em situações compartilhadas: adiciona ao repertório
 * 
 * @param {string} caminhoAgenteX - Caminho do arquivo JSON do Agente X
 * @param {string} caminhoAgenteO - Caminho do arquivo JSON do Agente O
 * @param {string} caminhoSaida - Caminho onde salvar o Superagente mesclado
 * @returns {void}
 */
function mesclarTabelasQ(caminhoAgenteX, caminhoAgenteO, caminhoSaida) {
  console.log("\n" + "=".repeat(50));
  console.log("💎 INICIANDO A FUSÃO DE CONHECIMENTO DOS AGENTES 💎");
  console.log("=".repeat(50));

  // --- 1. Carregar as Memórias (Tabelas Q) ---
  let tabelaQX, tabelaQO;

  try {
    const dadosX = fs.readFileSync(caminhoAgenteX, 'utf-8');
    const objetoX = JSON.parse(dadosX);
    
    // Verifica se os dados estão dentro de um "contêiner" (objeto)
    // Se for um objeto e tiver a chave 'q_table' ou 'tabelaQ', pegue-a. Senão, use os dados diretamente.
    tabelaQX = objetoX.q_table || objetoX.tabelaQ || objetoX;
    
    console.log(`✅ Memória do Agente X carregada: ${Object.keys(tabelaQX).length.toLocaleString()} estados conhecidos.`);

    const dadosO = fs.readFileSync(caminhoAgenteO, 'utf-8');
    const objetoO = JSON.parse(dadosO);
    
    // Faz a mesma verificação para o agente O
    tabelaQO = objetoO.q_table || objetoO.tabelaQ || objetoO;
    
    console.log(`✅ Memória do Agente O carregada: ${Object.keys(tabelaQO).length.toLocaleString()} estados conhecidos.`);

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`❌ ERRO: Arquivo de modelo não encontrado: ${error.path}`);
    } else {
      console.log(`❌ ERRO: O formato dos arquivos JSON é inesperado. Verifique como os dados foram salvos.`);
      console.log(`Detalhes: ${error.message}`);
    }
    return;
  }

  // --- 2. Iniciar a Fusão ---
  console.log("\nIniciando o processo de mesclagem...");
  
  // Cria uma cópia profunda da tabela Q de X como base
  const tabelaQMesclada = JSON.parse(JSON.stringify(tabelaQX));
  
  let conflitosResolvidos = 0;
  let estadosNovosAdicionados = 0;
  let acoesNovasAdicionadas = 0;

  // Percorre todos os estados conhecidos pelo Agente O
  for (const [estadoO, acoesO] of Object.entries(tabelaQO)) {
    if (!(estadoO in tabelaQMesclada)) {
      // Estado completamente novo: o Agente X não conhecia esta situação
      tabelaQMesclada[estadoO] = acoesO;
      estadosNovosAdicionados++;
    } else {
      // Estado já existe: verifica ação por ação
      for (const [acaoO, valorQO] of Object.entries(acoesO)) {
        if (!(acaoO in tabelaQMesclada[estadoO])) {
          // Ação nova neste estado: o Agente X nunca tentou esta jogada aqui
          tabelaQMesclada[estadoO][acaoO] = valorQO;
          acoesNovasAdicionadas++;
        } else {
          // Conflito: ambos conhecem esta ação neste estado
          const valorQExistente = tabelaQMesclada[estadoO][acaoO];
          if (valorQO > valorQExistente) {
            // O Agente O tem uma avaliação melhor: usa a dele
            tabelaQMesclada[estadoO][acaoO] = valorQO;
            conflitosResolvidos++;
          }
          // Se o valor de X for melhor ou igual, mantém o atual
        }
      }
    }
  }
  
  console.log("Fusão concluída!");

  // --- 3. Exibir Estatísticas da Fusão ---
  console.log("\n--- ESTATÍSTICAS DA FUSÃO ---");
  console.log(`Estados únicos no Agente X: ${Object.keys(tabelaQX).length.toLocaleString()}`);
  console.log(`Estados únicos no Agente O: ${Object.keys(tabelaQO).length.toLocaleString()}`);
  console.log("-".repeat(30));
  console.log(`Estados que só o Agente O conhecia: ${estadosNovosAdicionados.toLocaleString()}`);
  console.log(`Ações novas aprendidas em estados compartilhados: ${acoesNovasAdicionadas.toLocaleString()}`);
  console.log(`Conflitos de opinião resolvidos (mantendo a melhor nota): ${conflitosResolvidos.toLocaleString()}`);
  console.log("-".repeat(30));
  console.log(`Total de estados no Superagente final: ${Object.keys(tabelaQMesclada).length.toLocaleString()}`);

  // --- 4. Salvar o Novo Modelo ---
  const caminhoArquivoSaida = path.resolve(caminhoSaida);
  const diretorio = path.dirname(caminhoArquivoSaida);

  // Cria o diretório se não existir
  if (!fs.existsSync(diretorio)) {
    fs.mkdirSync(diretorio, { recursive: true });
  }

  fs.writeFileSync(
    caminhoArquivoSaida,
    JSON.stringify(tabelaQMesclada, null, 2)
  );

  console.log(`\n💾 Superagente salvo com sucesso em: ${caminhoArquivoSaida}`);
  console.log("=".repeat(50) + "\n");
}

// --- Bloco de Execução Principal ---
// Este bloco permite que o arquivo seja executado como um script.
if (import.meta.url === `file://${process.argv[1]}`) {
  const pastaModelos = path.resolve(__dirname, 'modelos_treinados');
  const dimensao = 3;
  
  const caminhoX = path.join(pastaModelos, `agente_x_final_${dimensao}x${dimensao}.json`);
  const caminhoO = path.join(pastaModelos, `agente_o_final_${dimensao}x${dimensao}.json`);
  const caminhoFinal = path.join(pastaModelos, `superagente_final_${dimensao}x${dimensao}.json`);
  
  mesclarTabelasQ(caminhoX, caminhoO, caminhoFinal);
}

// Exporta a função para uso em outros módulos
export { mesclarTabelasQ };
