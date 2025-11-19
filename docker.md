# 🐳 Docker Compose: Guia Rápido

Comandos essenciais para o fluxo de desenvolvimento no projeto.
**Serviço principal:** `app`

---

## ⚡ Fluxo Diário (Workflow)

**Subir o ambiente**
Roda tudo e trava o terminal (bom para ver logs iniciais).
```bash
docker compose up
````

*Use `docker compose up -d` para rodar em segundo plano (libera o terminal).*

**Parar e remover**
Para os containers e remove a rede criada (ideal para o fim do dia).

```bash
docker compose down
```

**Ver logs**

```bash
docker compose logs -f app
```

-----

## 🛠️ Executando Comandos (NPM / Shell)

*Regra de ouro: Use `exec app` para rodar comandos dentro do container.*

**Acessar o terminal do container (SSH)**

```bash
docker compose exec app sh
```

**Comandos NPM (Exemplos)**

```bash
# Rodar testes
docker compose exec app npm test

# Instalar dependências
docker compose exec app npm install dependencia
docker compose exec app npm install --save-dev jest

# Rodar scripts do package.json
docker compose exec app npm run test
```

-----

## 🔧 Manutenção e Problemas

**Recriar containers**
Use se alterou o `compose.yaml` (ex: mudou portas ou volumes).

```bash
docker compose up -d --build
```

**Limpeza pesada (Reset)**
Se algo travar, isso apaga a pasta `.next` e reconstrói o container.

```bash
docker compose down
rm -rf .next
docker compose up --build
```

**Limpar tudo (Danger Zone)**
Remove containers, redes e imagens não usadas para liberar espaço no disco.

```bash
docker system prune -a
```

-----

## 🚀 Dica de Produtividade: Aliases (Atalhos)

Cansado de digitar `docker compose exec app` toda hora? Crie um atalho.

### 1\. Alias Temporário

*Dura apenas enquanto este terminal estiver aberto.*

```bash
alias d="docker compose exec app"
```

**Como usar:** `d npm install zod`

### 2\. Alias Permanente (Recomendado)

*Fica salvo para sempre no seu VSCode/Bash.*

1.  Abra o arquivo de configuração do seu terminal:

    ```bash
    code ~/.bashrc
    ```

2.  Adicione esta linha no final do arquivo:

    ```bash
    alias d="docker compose exec app"
    alias dc="docker compose"
    ```

3.  Salve o arquivo e atualize o terminal:

    ```bash
    source ~/.bashrc
    ```

**Agora você pode fazer:**

  * `dc up` (para subir)
  * `d npm run dev` (para rodar comandos)
