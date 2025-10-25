# 🐳 Guia de Comandos Docker Compose

Este documento contém os comandos mais utilizados para gerenciar o ambiente de desenvolvimento com Docker.

---

## 🚀 Comandos Básicos

### Iniciar o ambiente de desenvolvimento

```bash
docker-compose up
```

### Iniciar em segundo plano (modo detached)

```bash
docker-compose up -d
```

### Parar os containers

```bash
docker-compose stop
```

### Parar e remover os containers

```bash
docker-compose down
```

### Parar, remover containers e volumes

```bash
docker-compose down -v
```

---

## 📊 Monitoramento

### Ver logs em tempo real

```bash
docker-compose logs -f
```

### Ver logs de um serviço específico

```bash
docker-compose logs -f app
```

### Listar containers ativos

```bash
docker-compose ps
```

---

## 🔧 Executando Comandos

### Executar comando dentro do container

```bash
docker-compose exec app <comando>
```

### Instalar nova dependência

```bash
docker-compose exec app npm install nome-do-pacote
```

### Instalar dependência de desenvolvimento

```bash
docker-compose exec app npm install --save-dev nome-do-pacote
```

### Executar scripts do package.json

```bash
docker-compose exec app npm run <nome-do-script>
```

### Abrir shell dentro do container

```bash
docker-compose exec app sh
```

---

## 🏗️ Rebuild e Manutenção

### Recriar containers (após mudanças no docker-compose.yml)

```bash
docker-compose up --build
```

### Forçar rebuild da imagem

```bash
docker-compose build --no-cache
```

### Limpar cache do Next.js dentro do container

```bash
docker-compose exec app rm -rf .next
```

---

## 🧹 Limpeza

### Remover containers, redes e volumes não utilizados

```bash
docker system prune -a
```

### Remover apenas volumes não utilizados

```bash
docker volume prune
```

---

## ⚠️ Solução de Problemas

### Container não inicia corretamente

```bash
# Parar tudo
docker-compose down

# Limpar cache
rm -rf .next

# Iniciar novamente
docker-compose up --build
```

### Problemas com dependências

```bash
# Remover node_modules e reinstalar
docker-compose exec app rm -rf node_modules
docker-compose exec app npm install
```

### Ver erros detalhados

```bash
docker-compose logs app
```

---

## 📝 Notas Importantes

* O volume `- /app/node_modules` protege as dependências instaladas no container.
* O modo `NODE_ENV=development` ativa recursos de desenvolvimento do Next.js.
* Mudanças no código são detectadas automaticamente (hot-reload).
* O cache do Webpack é armazenado em `.next/cache`.
