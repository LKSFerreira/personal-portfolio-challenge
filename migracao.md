<!-- migracao.md -->

# 🎯 PLANO DE AÇÃO: Migração Terminal HTML → Next.js Pages Router

## 📊 Contexto
- **Projeto:** Landing page com terminal interativo
- **Rota atual:** Arquivos estáticos em `public/terminal/` (HTML/CSS/JS vanilla)
- **Rota desejada:** `/terminal` usando Next.js Pages Router
- **Tecnologia:** JavaScript puro (sem TypeScript)
- **Prioridade máxima:** Manter visual/funcionalidade 100% intactos

## 🗂️ Estrutura Final Esperada

```
pages/
  └── terminal/
      └── index.js                    # Componente React da página /terminal
      └── terminal.module.css         # Estilos isolados (CSS Modules)

public/
  └── terminal/                       # ❌ SERÁ REMOVIDO ao final
      ├── index.html
      ├── script.js
      └── style.css
```

***

## 📋 FASES DE EXECUÇÃO

### **FASE 1: Análise e Preparação** 🔍
**Objetivo:** Entender o código existente antes de migrar

- [ ] **1.1** - Você compartilha os 3 arquivos atuais:
  - `public/terminal/index.html`
  - `public/terminal/script.js`
  - `public/terminal/style.css`

- [ ] **1.2** - Eu analiso:
  - Estrutura HTML completa
  - Lógica JavaScript (eventos, manipulação DOM)
  - Identifico onde está o textarea que vira input text
  - Estilos aplicados e dependências CSS

- [ ] **1.3** - Criar backup (recomendado):
  ```bash
  # Você executa (opcional mas recomendado)
  mkdir backup
  cp -r public/terminal backup/
  ```

***

### **FASE 2: Criação da Estrutura Next.js** 🏗️
**Objetivo:** Criar arquivos base no padrão Next.js

- [ ] **2.1** - Criar diretório:
  ```bash
  mkdir -p pages/terminal
  ```

- [ ] **2.2** - Eu forneço o código de `pages/terminal/index.js`:
  - Estrutura base do componente React
  - Imports necessários
  - Esqueleto funcional

- [ ] **2.3** - Eu forneço o código de `pages/terminal/terminal.module.css`:
  - Conversão direta dos estilos atuais
  - Ajustes para CSS Modules (se necessário)

***

### **FASE 3: Migração do HTML → JSX** 🔄
**Objetivo:** Converter estrutura HTML para React/JSX

- [ ] **3.1** - Converter tags HTML para JSX:
  - `class` → `className`
  - `for` → `htmlFor`
  - Fechar tags auto-fechantes (`<br>` → `<br />`)
  - Converter atributos inline para camelCase

- [ ] **3.2** - Identificar e trocar textarea por input:
  - Localizar o textarea no código
  - Substituir por `<input type="text" />`
  - Manter todos os atributos/classes

- [ ] **3.3** - Estruturar o JSX dentro do componente React

***

### **FASE 4: Migração do CSS** 🎨
**Objetivo:** Garantir que os estilos funcionem exatamente igual

- [ ] **4.1** - Copiar CSS para `terminal.module.css`

- [ ] **4.2** - Adaptar seletores para CSS Modules:
  - Classes normais viram `styles.nomeClasse`
  - Seletores globais (body, html) vão para `:global()`
  - Manter variáveis CSS (custom properties)

- [ ] **4.3** - Importar e aplicar no componente:
  ```javascript
  import styles from './terminal.module.css'
  <div className={styles.terminal}>...</div>
  ```

- [ ] **4.4** - Validação visual (comparar lado a lado)

***

### **FASE 5: Migração do JavaScript → React** ⚙️
**Objetivo:** Converter lógica vanilla JS para React hooks

- [ ] **5.1** - Identificar funcionalidades JavaScript:
  - Event listeners (clicks, keypresses, etc)
  - Manipulações de DOM
  - Estado da aplicação (variáveis)
  - Funções de lógica de negócio

- [ ] **5.2** - Converter para React patterns:
  - `addEventListener` → `onClick`, `onKeyPress`, etc
  - `document.querySelector` → `useRef`
  - Variáveis → `useState`
  - Inicializações → `useEffect`

- [ ] **5.3** - Manter funcionalidades idênticas:
  - Testar cada interação
  - Garantir comportamento igual ao original

***

### **FASE 6: Testes e Validação** ✅
**Objetivo:** Garantir que tudo funciona perfeitamente

- [ ] **6.1** - Testar rota no navegador:
  ```
  http://localhost:3000/terminal
  ```

- [ ] **6.2** - Checklist de funcionalidades:
  - [ ] Página carrega sem erros
  - [ ] Visual idêntico ao original
  - [ ] Todas as interações funcionam
  - [ ] Input text funciona (substituiu textarea)
  - [ ] Estilos aplicados corretamente
  - [ ] Responsividade mantida (se houver)

- [ ] **6.3** - Testar hot-reload:
  - Fazer pequena mudança no código
  - Verificar se atualiza automaticamente

- [ ] **6.4** - Validação cruzada:
  - Abrir original e novo lado a lado
  - Comparar visualmente pixel por pixel
  - Testar todas as funcionalidades em paralelo

***

### **FASE 7: Limpeza e Finalização** 🧹
**Objetivo:** Remover arquivos antigos e documentar

- [ ] **7.1** - Remover arquivos estáticos antigos:
  ```bash
  rm -rf public/terminal/
  ```

- [ ] **7.2** - Atualizar links (se houver):
  - Verificar se há referências a `/public/terminal/`
  - Atualizar para `/terminal`

- [ ] **7.3** - Commit das mudanças:
  ```bash
  git add .
  git commit -m "♻️ Migração terminal: HTML estático → Next.js Pages Router"
  ```

- [ ] **7.4** - Documentação (opcional):
  - Atualizar README.md se necessário
  - Adicionar comentários no código

***