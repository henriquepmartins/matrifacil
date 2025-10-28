# Arquitetura de Pré-Matrículas Offline - MatriFácil

Este documento explica como funciona a arquitetura de pré-matrículas offline do MatriFácil, incluindo o uso do Redis para cache e filas de processamento.

## Visão Geral

O MatriFácil implementa uma arquitetura **offline-first** que permite criar pré-matrículas mesmo quando o usuário está sem conexão com a internet. Os dados são salvos localmente no navegador (IndexedDB) e sincronizados com o servidor quando a conexão é restaurada.

## Componentes Principais

### 1. Cliente (Browser)

#### 📝 Formulário de Pré-Matrícula

- Interface React onde o usuário preenche os dados
- Campos: aluno, responsável, etapa, dados pessoais

#### 💾 IndexedDB (Browser Storage)

Armazena dados localmente no navegador:

- `alunos` - Dados dos alunos
- `responsaveis` - Dados dos responsáveis
- `matriculas` - Dados das matrículas
- `documentos` - Documentos anexados
- `sync_status` - Status de sincronização

**Sync Status:**

- `"pending"` - Aguardando sincronização
- `"synced"` - Sincronizado com servidor

#### 🔄 Fila de Sincronização

- Coleta todas as operações pendentes
- Função `buildSyncBatch()` monta o lote
- Envia via HTTP POST quando o navegador está online

### 2. Servidor Backend

#### 🌐 API Endpoint `/api/sync`

- Recebe batch de sincronização via POST
- Middleware de autenticação JWT
- Cria batchId único (UUID)
- Adiciona job na fila Redis

**Formato do Batch:**

```json
{
  "batch": [
    {
      "entity": "responsavel|aluno|matricula",
      "operation": "create",
      "id_local": "uuid-temporario",
      "data": {
        /* dados */
      }
    }
  ],
  "device_id": "device-uuid",
  "last_sync": 1234567890,
  "app_version": "1.0.0"
}
```

#### 📋 BullMQ Queue

- Sistema de filas baseado em Redis
- Priorização automática de jobs
- Retry automático em caso de falhas
- Rate limiting: 10 lotes por minuto

#### 🔧 Workers (Processamento Paralelo)

- 3 workers processando em paralelo
- Cada worker processa um lote por vez
- Resolve dependências entre entidades
- Gera mappings de `id_local` → `id_global`

**Ordem de Processamento:**

1. `responsavel` - Primeiro (sem dependências)
2. `aluno` - Segundo (sem dependências)
3. `matricula` - Terceiro (depende de aluno e responsavel)
4. `documento` - Quarto (depende de matricula)
5. `pendencia` - Quinto (depende de matricula/documento)

#### 🗄️ PostgreSQL/Supabase

- Banco de dados principal
- Insere registros com UUID gerado pelo servidor
- Retorna `id_global` (UUID definitivo)
- Atualiza vagas disponíveis nas turmas

### 3. Redis Cache

#### 📋 BullMQ Queue Storage

- Armazena jobs pendentes
- Key: `"sync:queue:jobs"`
- Persistência garantida
- Evita perda de dados em caso de falha

#### 💾 Cache de Status de Sincronização

- Armazena resultado de sincronização
- Key: `"sync:{batchId}"`
- TTL: 3600s (1 hora)
- Evita reprocessamento
- Retorna mappings e conflicts

#### 👤 Session Cache

- Armazena dados de autenticação
- Key: `"session:{sessionId}"`
- TTL: 3600s (1 hora)
- Evita consulta ao banco de dados
- Melhora performance de autenticação

#### 📚 Cache de Turmas

- Lista de turmas disponíveis
- Key: `"turmas:active"`
- TTL: 300s (5 minutos)
- Atualizado periodicamente
- Usado para seleção de turmas

## Fluxo Completo

### 1️⃣ OFFLINE - Criação

```javascript
// Usuário preenche formulário
const preMatriculaData = {
  aluno: { nome, dataNascimento, etapa },
  responsavel: { nome, cpf, telefone, endereco },
};

// Salva localmente no IndexedDB
await db.matriculas.add({
  id: "local-uuid",
  sync_status: "pending", // ⚠️ Pendente!
  ...preMatriculaData,
});
```

### 2️⃣ ONLINE - Sincronização

```javascript
// Detecta quando navegador fica online
if (navigator.onLine) {
  // Coleta itens pendentes
  const batch = await buildSyncBatch(); // [{entity, id_local, data}]

  // Envia para servidor
  const response = await fetch("/api/sync", {
    method: "POST",
    body: JSON.stringify({ batch }),
  });

  // Recebe mappings
  const { mappings } = await response.json();
  // [{entity: "matricula", id_local: "uuid-temp", id_global: "uuid-def"}]
}
```

### 3️⃣ SERVIDOR - Processamento

```javascript
// Worker processa lote
const result = await processBatch(batch);

// Para cada item no lote:
// 1. Resolve dependências (id_local → id_global)
// 2. Insere no PostgreSQL
// 3. Retorna id_global gerado

return {
  mappings: [
    { entity: "responsavel", id_local: "A", id_global: "X" },
    { entity: "aluno", id_local: "B", id_global: "Y" },
    { entity: "matricula", id_local: "C", id_global: "Z" },
  ],
  conflicts: [],
};
```

### 4️⃣ CLIENTE - Reconciliação

```javascript
// Atualiza IndexedDB com IDs globais
await reconcileData(mappings);

// Substitui id_local por id_global
await db.matriculas.update("local-uuid", {
  id: "global-uuid", // ID do servidor
  idGlobal: "global-uuid",
  sync_status: "synced", // ✅ Sincronizado!
});
```

## Características Importantes

### ✅ Resilência

- Retry automático em caso de falhas
- Dados nunca são perdidos
- Queue persistente no Redis
- Transações atômicas no IndexedDB

### ✅ Performance

- Cache Redis reduz carga no banco
- Processamento paralelo (3 workers)
- TTL configurável por tipo de cache
- Batch processing reduz latência

### ✅ Escalabilidade

- Workers podem escalar horizontalmente
- Redis suporta alta concorrência
- Rate limiting protege servidor
- Priorização de jobs

### ✅ Integridade de Dados

- Transações atômicas
- Mapeamento preciso de IDs
- Tratamento de conflitos
- Audit trail completo

## Cache TTLs

| Cache       | TTL   | Motivo                                |
| ----------- | ----- | ------------------------------------- |
| Sync Status | 3600s | Resultado de sincronização temporário |
| Sessions    | 3600s | Balanço entre segurança e performance |
| Turmas      | 300s  | Dados frequentemente atualizados      |

## Configuração dos Workers

- **Concorrência**: 3 workers
- **Rate Limit**: 10 lotes por minuto
- **Retry**: Automático com backoff exponencial
- **Prioridade**: Lotes maiores têm prioridade menor

## ID Mapping

Sistema crítico para integridade dos dados:

```javascript
// CLIENTE - IDs temporários
{
  alunoId: "local-aluno-1",
  responsavelId: "local-resp-1",
  matriculaId: "local-mat-1"
}

// SERVIDOR - Resolve referências
{
  "local-resp-1" → "global-resp-abc-123",
  "local-aluno-1" → "global-aluno-xyz-456",
  "local-mat-1" → "global-mat-789-012"
}

// CLIENTE - Atualiza com IDs globais
{
  alunoId: "global-aluno-xyz-456",
  responsavelId: "global-resp-abc-123",
  matriculaId: "global-mat-789-012"
}
```

## Tratamento de Conflitos

```javascript
// Exemplo de conflito
{
  entity: "responsavel",
  id_local: "local-1",
  error: "CPF já cadastrado no sistema"
}

// Cliente recebe e trata
if (conflicts.length > 0) {
  await db.matriculas.update("local-mat", {
    sync_status: "error",
    error_message: conflicts[0].error
  });
}
```

## Exemplo de Batch Completo

```json
{
  "batch": [
    {
      "entity": "responsavel",
      "operation": "create",
      "id_local": "temp-resp-1",
      "data": {
        "nome": "Maria Silva",
        "cpf": "12345678901",
        "telefone": "11987654321"
      }
    },
    {
      "entity": "aluno",
      "operation": "create",
      "id_local": "temp-aluno-1",
      "data": {
        "nome": "João Silva",
        "dataNascimento": "2015-01-15",
        "etapa": "fundamental"
      }
    },
    {
      "entity": "matricula",
      "operation": "create",
      "id_local": "temp-mat-1",
      "data": {
        "alunoId": "temp-aluno-1",
        "responsavelId": "temp-resp-1",
        "status": "pre",
        "protocoloLocal": "LOCAL-1234567890"
      }
    }
  ]
}
```

## Diagrama Visual

Abra o arquivo `architecture-offline.excalidraw` no [Excalidraw](https://excalidraw.com) para ver a representação visual completa da arquitetura.

## Referências

- **Dexie.js**: Biblioteca IndexedDB
- **BullMQ**: Sistema de filas Redis
- **Drizzle ORM**: Query builder PostgreSQL
- **Express.js**: Framework HTTP servidor
