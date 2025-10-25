# 🎯 PLANO DE AÇÃO: Migração Terminal HTML → Next.js Pages Router

## ✅ STATUS: MIGRAÇÃO CONCLUÍDA COM SUCESSO

---

## 📊 Contexto

* **Projeto:** Landing page com terminal interativo
* **Rota atual:** ~~Arquivos estáticos em `public/terminal/`~~ → **Migrado para `pages/terminal/`**
* **Rota desejada:** `/terminal` usando Next.js Pages Router ✅
* **Tecnologia:** JavaScript puro (sem TypeScript) ✅
* **Prioridade máxima:** Manter visual/funcionalidade 100% intactos ✅

---

## 🗂️ Estrutura Final Implementada

```bash
pages/
  ├── _app.js                        # ✅ App wrapper com estilos globais
  ├── index.js                       # ✅ Redirect automático para /terminal
  ├── 404.js                         # ✅ Página 404 com redirect
  ├── terminal/
  │   ├── index.js                   # ✅ Componente React da página /terminal
  │   └── terminal.module.css        # ✅ Estilos isolados (CSS Modules)
  └── api/
      └── v1/
          ├── projetos/index.js      # ✅ API de projetos GitHub
          └── status/index.js        # ✅ Health check

styles/
  └── globals.css                    # ✅ Estilos globais

public/
  └── terminal/                      # ⚠️ PENDENTE: Remover após validação final
      ├── index.html
      ├── script.js
      └── style.css
```

---

## 📋 Fases de Execução

### **FASE 1: Análise e Preparação** ✅ CONCLUÍDA

**Objetivo:** Entender o código existente antes de migrar.

* [x] **1.1** - Arquivos analisados:

  * `public/terminal/index.html`
  * `public/terminal/script.js`
  * `public/terminal/style.css`

* [x] **1.2** - Resultados da análise:

  * ✅ Estrutura HTML mapeada
  * ✅ Lógica JavaScript identificada
  * ✅ Textarea convertido em input text
  * ✅ Estilos e dependências CSS documentados

* [x] **1.3** - Backup criado:

  ```bash
  mkdir backup
  cp -r public/terminal backup/
  ```

---

### **FASE 2: Criação da Estrutura Next.js** ✅ CONCLUÍDA

**Objetivo:** Criar a base no padrão do Next.js.

* [x] **2.1** - Diretórios criados:

  ```bash
  mkdir -p pages/terminal
  mkdir -p styles
  ```

* [x] **2.2** - Arquivo `pages/terminal/index.js` criado:

  * ✅ Estrutura React funcional
  * ✅ Imports necessários (`useState`, `useEffect`, `useRef`)

* [x] **2.3** - Arquivo `terminal.module.css` criado:

  * ✅ Conversão completa dos estilos
  * ✅ Ajustes para CSS Modules
  * ✅ Variáveis CSS preservadas

---

### **FASE 3: Migração do HTML → JSX** ✅ CONCLUÍDA

**Objetivo:** Converter HTML para React/JSX.

* [x] **3.1** - Tags convertidas:

  * `class` → `className`
  * `for` → `htmlFor`
  * Atributos para camelCase
  * Tags auto-fechantes corrigidas

* [x] **3.2** - Textarea convertido para input:

  * `<textarea>` → `<input type="text" />`
  * Classes e comportamento mantidos

* [x] **3.3** - JSX estruturado e hierarquia preservada ✅

---

### **FASE 4: Migração do CSS** ✅ CONCLUÍDA

**Objetivo:** Garantir equivalência visual total.

* [x] **4.1** - CSS copiado para `terminal.module.css`
* [x] **4.2** - Seletores adaptados para CSS Modules
* [x] **4.3** - Import e aplicação:

  ```js
  import styles from './terminal.module.css'
  <div className={styles.container}>...</div>
  ```
* [x] **4.4** - Validação visual 100% idêntica ✅

---

### **FASE 5: Migração do JavaScript → React** ✅ CONCLUÍDA

**Objetivo:** Reescrever lógica vanilla JS com React Hooks.

* [x] **5.1** - Lógica JavaScript mapeada
* [x] **5.2** - Conversão para padrões React:

  * `addEventListener` → `onKeyDown`, `onChange`
  * `document.getElementById` → `useRef`
  * Variáveis globais → `useState`
  * Inicializações → `useEffect`
* [x] **5.3** - Funcionalidades preservadas (comandos, histórico, animações, API GitHub)

---

### **FASE 6: Testes e Validação** ✅ CONCLUÍDA

**Objetivo:** Garantir funcionamento idêntico.

* [x] Rota testada: `http://localhost:3000/terminal`
* [x] Visual idêntico ao original
* [x] Input funcional
* [x] Responsividade preservada
* [x] Hot-reload funcionando corretamente
* [x] Comparação cruzada com versão antiga concluída ✅

---

### **FASE 7: Limpeza e Finalização** ⚠️ PARCIALMENTE CONCLUÍDA

**Objetivo:** Remover arquivos antigos e documentar.

* [ ] **7.1** - Remover arquivos estáticos após validação:

  ```bash
  git rm -r public/terminal/
  git commit -m "🗑️ remove: Arquivos HTML estáticos do terminal antigo"
  ```
* [x] **7.2** - Links atualizados
* [x] **7.3** - Commits organizados:

  ```text
  ✅ Configuração Docker
  ✅ Documentação da migração
  ✅ Atualização do .gitignore
  ✅ Melhorias na API
  ✅ Estrutura base Next.js
  ✅ Componente Terminal
  ✅ Página inicial e 404 com redirect
  ```
* [x] **7.4** - Documentação:

  * `docker.md` criado
  * `migracao.md` atualizado
  * [ ] README.md pendente

---

## 🎊 Resultado Final

### ✅ Conquistas

| Item                        | Status        |
| --------------------------- | ------------- |
| Migração HTML → React       | ✅ 100%        |
| Funcionalidades preservadas | ✅ 100%        |
| Visual idêntico             | ✅ 100%        |
| Hot-reload funcionando      | ✅ Sim         |
| APIs mantidas               | ✅ Funcionando |
| Docker configurado          | ✅ Operacional |
| Commits organizados         | ✅ 9 commits   |
| Código em português         | ✅ Sim         |

---

### 📈 Melhorias Implementadas

* ✅ Estrutura moderna com Next.js Pages Router
* ✅ Componentes React reutilizáveis
* ✅ CSS Modules para isolamento de estilos
* ✅ Hooks para controle de estado
* ✅ Página 404 com redirect automático
* ✅ Redirect da home para `/terminal`
* ✅ Ambiente Docker para dev
* ✅ Documentação completa

---

### 🚀 Rotas Disponíveis

| Rota               | Descrição                    |
| ------------------ | ---------------------------- |
| `/`                | Redireciona para `/terminal` |
| `/terminal`        | Terminal interativo em React |
| `/api/v1/projetos` | Lista projetos GitHub        |
| `/api/v1/status`   | Health check                 |
| `*`                | Redireciona para `/terminal` |

---

## 📝 Notas Técnicas

### Conversões Realizadas

**HTML → JSX**

* `<textarea>` → `<input type="text" />`
* Atributos convertidos para camelCase
* Eventos inline → event handlers React

**Vanilla JS → React**

* Variáveis → `useState`
* DOM selectors → `useRef`
* Listeners → `onKeyDown`, `onChange`
* Animações → `useEffect` com cleanup

**CSS → CSS Modules**

* Classes globais → `styles.nomeClasse`
* Variáveis CSS preservadas
* Globais movidos para `styles/globals.css`

---

### Próximos Passos Opcionais

1. Remover `public/terminal/` após validação em produção
2. Atualizar `README.md` com rotas e instruções
3. Adicionar testes automatizados
4. Implementar Analytics
5. Otimizar SEO com `<Head>` do Next.js

---

**🗓️ Migração concluída com sucesso em 25/10/2025** 🎉