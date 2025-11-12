# MatriFácil

Sistema de gestão de matrículas para creches comunitárias com suporte offline-first. Permite criar pré-matrículas mesmo sem conexão à internet, sincronizando automaticamente quando a conexão é restaurada.

## Objetivo

Digitalizar e simplificar o processo de matrícula em creches comunitárias, permitindo que funcionários registrem informações de alunos e responsáveis mesmo em locais com conexão instável. O sistema garante que nenhum dado seja perdido e sincroniza automaticamente quando possível.

## Arquitetura

### Offline-First

O sistema implementa uma arquitetura **offline-first** com três camadas principais:

1. **Cliente (Browser)**
   - Interface React/Next.js
   - IndexedDB (Dexie) para armazenamento local
   - Sincronização automática quando online

2. **Servidor (Backend)**
   - API REST em Express.js
   - Processamento assíncrono com BullMQ
   - Cache Redis para performance

3. **Banco de Dados**
   - PostgreSQL/Supabase (produção)
   - IndexedDB (cliente - cache local)

### Fluxo de Sincronização

```
[Cliente Offline] → IndexedDB (pending)
         ↓
[Cliente Online] → API /sync → BullMQ Queue
         ↓
[Worker] → PostgreSQL → Retorna IDs globais
         ↓
[Cliente] → Reconciliação → IndexedDB (synced)
```

## Tecnologias

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Dexie** - Wrapper IndexedDB
- **TanStack Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas

### Backend
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Drizzle ORM** - ORM type-safe
- **PostgreSQL** - Banco de dados relacional
- **BullMQ** - Sistema de filas
- **Redis** - Cache e filas
- **JWT** - Autenticação
- **Supabase** - Storage de documentos

### Infraestrutura
- **Turborepo** - Build system monorepo
- **Bun** - Runtime e package manager
- **Docker** (opcional) - Containerização

## Como Começar

### Pré-requisitos

- **Bun** >= 1.1.43
- **PostgreSQL** >= 14
- **Redis** (opcional, para cache e filas)

### Instalação

```bash
# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp apps/server/env.example apps/server/.env
cp apps/web/env.example apps/web/.env.local

# Aplicar schema no banco
bun db:push
```

### Variáveis de Ambiente

#### Backend (`apps/server/.env`)

```bash
# Obrigatório
DATABASE_URL=postgresql://user:password@localhost:5432/matrifacil
JWT_SECRET=your_jwt_secret_min_32_chars
CORS_ORIGIN=http://localhost:3001
PORT=8080

# Opcional
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=documentos
```

#### Frontend (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Executar

```bash
# Desenvolvimento (todos os apps)
bun dev

# Apenas frontend
bun dev:web

# Apenas backend
bun dev:server

# Build produção
bun build
```

Acesse:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/api/docs

## Scripts Disponíveis

```bash
bun dev              # Inicia todos os apps em desenvolvimento
bun build            # Build de produção
bun db:push          # Aplica schema no banco
bun db:studio        # Abre Drizzle Studio
bun db:generate      # Gera migrações
bun check-types      # Verifica tipos TypeScript
```

## Funcionalidades Principais

- ✅ **Pré-matrículas offline** - Criação sem internet
- ✅ **Sincronização automática** - Sincroniza quando online
- ✅ **Gestão de turmas** - Organização por etapa e turno
- ✅ **Documentos** - Upload e gestão de documentos
- ✅ **Relatórios** - Geração de relatórios em PDF/CSV
- ✅ **Autenticação** - Sistema de login com roles (ADMIN, COORDENACAO, RECEPCAO)
- ✅ **Cache inteligente** - Redis para performance

## Arquitetura de Sincronização

### Estados

- `pending` - Aguardando sincronização (IndexedDB local)
- `synced` - Sincronizado com servidor (tem ID global)
- `conflict` - Conflito detectado (requer resolução manual)

### Processamento

1. Cliente coleta dados pendentes do IndexedDB
2. Envia batch para `/api/sync`
3. Servidor processa em fila (BullMQ)
4. Resolve dependências (responsável → aluno → matrícula)
5. Retorna mappings (id_local → id_global)
6. Cliente reconcilia dados locais com IDs globais

## Documentação Adicional

- [Arquitetura Offline](./docs/architecture-offline.md) - Detalhes da sincronização
- [Estratégia JWT](./docs/jwt-migration-strategy.md) - Migração de autenticação

## Licença

Este projeto é privado e de uso interno.
