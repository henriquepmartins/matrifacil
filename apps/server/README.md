# MatriFácil API Server

Servidor Express.js com arquitetura MVC para o MatriFácil.

## Estrutura do Projeto

```
apps/server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Configuração do Express
│   ├── config/
│   │   ├── database.ts             # Conexão com Supabase/PostgreSQL
│   │   └── env.ts                  # Validação de variáveis de ambiente
│   ├── routes/
│   │   ├── index.ts                # Agregador de rotas
│   │   ├── health.routes.ts        # Health check endpoints
│   │   └── auth.routes.ts          # Endpoints de autenticação
│   ├── controllers/
│   │   ├── health.controller.ts    # Controlador do health check
│   │   └── auth.controller.ts      # Controlador de autenticação
│   ├── services/
│   │   └── auth.service.ts         # Lógica de negócio de autenticação
│   ├── repositories/
│   │   └── user.repository.ts      # Acesso ao banco de dados
│   ├── middlewares/
│   │   ├── error.middleware.ts     # Tratamento de erros
│   │   ├── auth.middleware.ts      # Autenticação JWT
│   │   └── cors.middleware.ts      # Configuração CORS
│   └── types/
│       └── express.d.ts            # Type extensions do Express
├── .env                            # Variáveis de ambiente (não versionado)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cd apps/server
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Porta do servidor
PORT=8080

# URL de conexão com o banco de dados (copie do apps/web/.env)
DATABASE_URL=postgresql://user:password@host:5432/database

# Origem permitida para CORS (URL do frontend)
CORS_ORIGIN=http://localhost:3001

# Ambiente de execução
NODE_ENV=development

# Chave secreta para JWT (gere uma chave segura)
# Pode usar: openssl rand -base64 32
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
```

### 2. Gerar JWT Secret

Para gerar uma chave JWT segura:

```bash
openssl rand -base64 32
```

Cole o resultado no campo `JWT_SECRET` do arquivo `.env`.

### 3. Instalar Dependências

Na raiz do projeto (não em apps/server):

```bash
bun install
```

## Executar o Servidor

### Desenvolvimento

```bash
# Na raiz do projeto
bun run dev:server

# Ou diretamente no diretório do servidor
cd apps/server
bun run dev
```

O servidor iniciará na porta configurada (padrão: 8080).

### Produção

```bash
# Build
bun run build

# Start
bun run start
```

## Endpoints Disponíveis

### Health Check

#### `GET /health`

Verifica o status do servidor e da conexão com o banco de dados.

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "OK",
  "status": "healthy",
  "checks": {
    "database": "up",
    "server": "up"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "5ms"
}
```

**Resposta de Erro (503):**

```json
{
  "success": false,
  "message": "Service Unavailable",
  "status": "unhealthy",
  "checks": {
    "database": "down",
    "server": "up"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "100ms"
}
```

#### `GET /health/readiness`

Verifica se o servidor está pronto para receber requisições.

#### `GET /health/liveness`

Verifica se o servidor está vivo (sempre retorna 200).

### Autenticação

#### `POST /api/auth/signup`

Registra um novo usuário.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senhasegura123"
}
```

**Resposta de Sucesso (201):**

```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

#### `POST /api/auth/login`

Autentica um usuário.

**Body:**

```json
{
  "email": "joao@example.com",
  "password": "senhasegura123"
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

#### `POST /api/auth/logout`

Desautentica o usuário atual (requer autenticação).

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### `GET /api/auth/session`

Obtém a sessão atual.

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com",
      "emailVerified": false
    },
    "session": {
      "id": "...",
      "expiresAt": "2024-01-08T00:00:00.000Z"
    }
  }
}
```

#### `GET /api/auth/me`

Obtém informações do usuário autenticado (requer autenticação).

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com"
    }
  }
}
```

## Arquitetura

### MVC Pattern

O servidor segue o padrão MVC (Model-View-Controller):

- **Routes**: Define os endpoints e mapeia para os controllers
- **Controllers**: Recebe as requisições, valida dados e chama os services
- **Services**: Contém a lógica de negócio
- **Repositories**: Acesso direto ao banco de dados
- **Middlewares**: Processamento intermediário (auth, cors, errors)

### Fluxo de Requisição

```
Request → Middleware (CORS) → Routes → Middleware (Auth) →
Controller → Service → Repository → Database
→ Response
```

### Tratamento de Erros

Todos os erros são capturados pelo middleware de erro e retornam um formato consistente:

```json
{
  "success": false,
  "message": "Mensagem do erro"
}
```

## Testes

### Testar Health Check

```bash
curl http://localhost:8080/health
```

### Testar Registro

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "password": "senha12345678"
  }'
```

### Testar Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha12345678"
  }'
```

## Integração com Frontend

O frontend (apps/web) está configurado para usar este servidor através do cliente de API em `apps/web/src/lib/api-client.ts`.

O sistema também inclui:

- **Dexie.js**: Cache local no IndexedDB para modo offline
- **Sincronização automática**: Quando a conexão é restaurada
- **Hooks React**: `useAuth()` e `useOfflineSync()`

## Segurança

- **JWT**: Tokens com expiração de 7 dias
- **bcrypt**: Senhas hasheadas com salt rounds = 10
- **CORS**: Configurado para aceitar apenas o frontend
- **HTTP-only cookies**: Tokens também armazenados em cookies
- **Validação**: Zod para validação de dados de entrada

## Desenvolvimento

### Adicionar Novas Rotas

1. Criar o controller em `src/controllers/`
2. Criar o service em `src/services/` (se necessário)
3. Criar o repository em `src/repositories/` (se necessário)
4. Criar as rotas em `src/routes/`
5. Adicionar as rotas em `src/routes/index.ts`

### Adicionar Novos Middlewares

Criar o middleware em `src/middlewares/` e adicionar no `src/app.ts`.

## Troubleshooting

### Erro: DATABASE_URL is not defined

Certifique-se de que o arquivo `.env` existe e contém a variável `DATABASE_URL`.

### Erro: JWT_SECRET deve ter pelo menos 32 caracteres

Gere uma chave JWT segura usando `openssl rand -base64 32` e adicione no `.env`.

### Erro ao conectar ao banco de dados

Verifique se:

1. O PostgreSQL/Supabase está rodando
2. A URL de conexão está correta
3. As credenciais estão corretas
4. O firewall não está bloqueando a conexão
