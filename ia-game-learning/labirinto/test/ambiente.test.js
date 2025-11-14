/**
 * @module 🧪 fase-2/labirinto/test/ambiente.test.js
 * @project 📘 AI Game Learning
 *
 * Testes unitários para a classe Labirinto do módulo ambiente.
 *
 * Este arquivo verifica se o ambiente do labirinto se comporta como esperado,
 * incluindo a inicialização, movimentação do agente, detecção de colisões,
 * cálculo de recompensas, reinício do ambiente e suporte a teclas WASD.
 */

const { Labirinto } = require('../ambiente.js');

// --- DADOS DE TESTE ---
// É uma boa prática definir os dados que serão usados em múltiplos testes
// como constantes no início do arquivo. Isso evita repetição de código.
const LABIRINTO_EXEMPLO = [
  [' ', '#', ' '],
  [' ', ' ', ' '],
  ['#', '#', ' ']
];
const PONTO_INICIAL_EXEMPLO = [0, 0];
const PONTO_FINAL_EXEMPLO = [2, 2];

/**
 * Verifica se o labirinto é inicializado com os valores corretos.
 * 
 * É como testar se a dungeon foi criada corretamente no Ragnarok,
 * com o jogador no lugar certo e a saída bem definida.
 */
describe('Labirinto - Inicialização', () => {
  test('deve inicializar com os valores corretos', () => {
    // Arrange: Prepara os dados para o teste (já definidos como constantes).
    // Act: Cria uma instância da classe.
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Assert: Verifica se os atributos foram definidos corretamente.
    expect(ambiente.posicaoAgente).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(ambiente.estadoInicial).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(ambiente.pontoFinal).toEqual(PONTO_FINAL_EXEMPLO);
  });

  test('deve lançar erro para matriz vazia', () => {
    // Arrange & Act & Assert: Verifica se o erro é lançado corretamente
    expect(() => {
      new Labirinto([], PONTO_INICIAL_EXEMPLO, PONTO_FINAL_EXEMPLO);
    }).toThrow('A matriz do labirinto não pode estar vazia.');
  });

  test('deve lançar erro para matriz malformada', () => {
    // Arrange & Act & Assert
    expect(() => {
      new Labirinto([[]], PONTO_INICIAL_EXEMPLO, PONTO_FINAL_EXEMPLO);
    }).toThrow('A matriz do labirinto está malformada.');
  });
});

/**
 * Verifica se o método reiniciar coloca o agente de volta no início.
 * 
 * É como testar o botão de "respawn" no Ragnarok.
 */
describe('Labirinto - Reinicialização', () => {
  test('deve colocar o agente de volta na posição inicial', () => {
    // Arrange: Cria um ambiente e move o agente para uma nova posição.
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );
    ambiente.executarAcao('baixo'); // Move o agente para [1, 0]

    // Act: Chama o método que queremos testar.
    const posicaoAposReinicio = ambiente.reiniciar();

    // Assert: Verifica se a posição do agente e o valor retornado estão corretos.
    expect(ambiente.posicaoAgente).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(posicaoAposReinicio).toEqual(PONTO_INICIAL_EXEMPLO);
  });
});

/**
 * Testa movimentos válidos usando nomes completos das direções.
 */
describe('Labirinto - Execução de Ações (Nomes Completos)', () => {
  test('deve executar ação "baixo" e atualizar estado', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('baixo');

    // Assert
    const posicaoEsperada = [1, 0];
    const recompensaEsperada = -0.1;
    expect(novoEstado).toEqual(posicaoEsperada);
    expect(ambiente.posicaoAgente).toEqual(posicaoEsperada);
    expect(recompensa).toBeCloseTo(recompensaEsperada);
    expect(terminou).toBe(false);
  });

  test('deve impedir movimento "direita" para parede', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act: Tenta mover para a direita, onde há uma parede ('#') em [0, 1].
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('direita');

    // Assert: A posição do agente não deve mudar.
    expect(novoEstado).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(ambiente.posicaoAgente).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(recompensa).toBeCloseTo(-0.1);
    expect(terminou).toBe(false);
  });

  test('deve impedir movimento "cima" para fora dos limites', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act: Tenta mover para cima, saindo dos limites
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('cima');

    // Assert: A posição do agente não deve mudar.
    expect(novoEstado).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(ambiente.posicaoAgente).toEqual(PONTO_INICIAL_EXEMPLO);
    expect(recompensa).toBeCloseTo(-0.1);
    expect(terminou).toBe(false);
  });
});

/**
 * Testa movimentos válidos usando teclas WASD (maiúsculas e minúsculas).
 */
describe('Labirinto - Execução de Ações (Teclas WASD)', () => {
  test('deve aceitar tecla "S" (maiúscula) para baixo', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('S');

    // Assert
    const posicaoEsperada = [1, 0];
    expect(novoEstado).toEqual(posicaoEsperada);
    expect(recompensa).toBeCloseTo(-0.1);
    expect(terminou).toBe(false);
  });

  test('deve aceitar tecla "s" (minúscula) para baixo', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('s');

    // Assert
    const posicaoEsperada = [1, 0];
    expect(novoEstado).toEqual(posicaoEsperada);
    expect(terminou).toBe(false);
  });

  test('deve aceitar tecla "W" para cima (bloqueado por limite)', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const [novoEstado] = ambiente.executarAcao('W');

    // Assert: Não deve mover
    expect(novoEstado).toEqual(PONTO_INICIAL_EXEMPLO);
  });

  test('deve aceitar tecla "D" para direita (bloqueado por parede)', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const [novoEstado] = ambiente.executarAcao('D');

    // Assert: Não deve mover
    expect(novoEstado).toEqual(PONTO_INICIAL_EXEMPLO);
  });

  test('deve aceitar tecla "A" para esquerda (bloqueado por limite)', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const [novoEstado] = ambiente.executarAcao('A');

    // Assert: Não deve mover
    expect(novoEstado).toEqual(PONTO_INICIAL_EXEMPLO);
  });
});

/**
 * Testa validação de ações inválidas.
 */
describe('Labirinto - Validação de Ações', () => {
  test('deve lançar erro para ação completamente inválida', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act & Assert
    expect(() => {
      ambiente.executarAcao('X');
    }).toThrow('Ação inválida: "X"');
  });

  test('deve lançar erro para string vazia', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act & Assert
    expect(() => {
      ambiente.executarAcao('');
    }).toThrow('Ação inválida');
  });
});

/**
 * Testa se o ambiente reconhece a chegada ao ponto final e dá a recompensa correta.
 */
describe('Labirinto - Chegada ao Ponto Final', () => {
  test('deve reconhecer chegada ao ponto final usando nome completo', () => {
    // Arrange: Colocamos o agente em uma posição adjacente à saída.
    const posicaoPreFinal = [1, 2];
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );
    ambiente.posicaoAgente = posicaoPreFinal;

    // Act: Executa o movimento que leva à saída.
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('baixo');

    // Assert
    const recompensaEsperada =  ambiente.calcularRecompensa();
    expect(novoEstado).toEqual(PONTO_FINAL_EXEMPLO);
    expect(recompensa).toBeCloseTo(recompensaEsperada);
    expect(terminou).toBe(true);
  });

  test('deve reconhecer chegada ao ponto final usando tecla WASD', () => {
    // Arrange
    const posicaoPreFinal = [1, 2];
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );
    ambiente.posicaoAgente = posicaoPreFinal;

    // Act: Usa tecla 'S' para mover para baixo
    const [novoEstado, recompensa, terminou] = ambiente.executarAcao('S');

    // Assert
    expect(novoEstado).toEqual(PONTO_FINAL_EXEMPLO);
    expect(recompensa).toBeCloseTo(ambiente.calcularRecompensa());
    expect(terminou).toBe(true);
  });
});

/**
 * Testa a representação em string do labirinto.
 */
describe('Labirinto - Representação Visual', () => {
  test('deve gerar string de visualização correta', () => {
    // Arrange
    const ambiente = new Labirinto(
      LABIRINTO_EXEMPLO,
      PONTO_INICIAL_EXEMPLO,
      PONTO_FINAL_EXEMPLO
    );

    // Act
    const representacao = ambiente.toString();

    // Assert: Verifica se contém os marcadores esperados
    expect(representacao).toContain('A'); // Agente
    expect(representacao).toContain('S'); // Saída
    expect(representacao).toContain('#'); // Parede
  });
});
