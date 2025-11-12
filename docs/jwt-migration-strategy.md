# Estratégia de Migração para JWT Moderno (Access + Refresh Tokens)

## 📊 Situação Atual

O sistema atual implementa:
- ✅ JWT já está sendo usado
- ❌ Token único com expiração longa (7 dias)
- ❌ Sessões armazenadas no banco de dados
- ❌ Sem separação entre access e refresh tokens
- ❌ Sem rotação de tokens
- ❌ Token armazenado em cookie httpOnly (seguro, mas não permite offline)

## 🎯 Arquitetura Proposta: Access Token + Refresh Token

### Princípios Fundamentais

1. **Access Token (Curta Duração)**
   - **Expiração**: 15-30 minutos
   - **Armazenamento**: Memória (React state) + IndexedDB (para offline)
   - **Uso**: Todas as requisições API
   - **Validação**: Apenas assinatura JWT (stateless)
   - **Não armazenado no banco**

2. **Refresh Token (Longa Duração)**
   - **Expiração**: 7-30 dias
   - **Armazenamento**: Cookie httpOnly (seguro) + Hash no banco
   - **Uso**: Apenas para obter novos access tokens
   - **Rotação**: Novo token a cada refresh (previne replay attacks)
   - **Revogável**: Pode ser invalidado no banco

3. **Segurança**
   - Refresh tokens hasheados antes de armazenar no banco
   - Rotação automática previne replay attacks
   - Access tokens não podem ser revogados (curta duração = janela de ataque limitada)
   - Refresh tokens podem ser revogados imediatamente

## 📐 Estrutura de Dados

### Schema do Banco (Migration Necessária)

```typescript
// packages/db/src/schema/auth.ts

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Refresh token (hashed para segurança)
  refreshTokenHash: text("refreshTokenHash").notNull().unique(),
  
  // Metadata da sessão
  expiresAt: timestamp("expiresAt").notNull(), // Expiração do refresh token
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  
  // Rotação de tokens (detecção de reuse)
  previousRefreshTokenHash: text("previousRefreshTokenHash"),
  rotatedAt: timestamp("rotatedAt"),
  revokedAt: timestamp("revokedAt"), // Para revogação manual
  
  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
```

## 🔄 Fluxo de Autenticação

### 1. Login (POST /api/auth/login)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-01T12:30:00Z"
  }
}
```

**Cookies:**
- `refreshToken`: `refresh_abc123...` (httpOnly, secure, sameSite: lax)

### 2. Refresh Token (POST /api/auth/refresh)

**Request:** Cookie com `refreshToken`

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-01T13:00:00Z"
  }
}
```

**Cookies:**
- Novo `refreshToken` (rotação automática)

### 3. Logout (POST /api/auth/logout)

**Request:** Cookie com `refreshToken` ou header `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

**Ações:**
- Revoga refresh token no banco
- Limpa cookies

## 🛠️ Plano de Implementação

### Fase 1: Backend - Serviço de Autenticação

#### 1.1 Atualizar Schema do Banco

**Arquivo:** `packages/db/src/schema/auth.ts`

```typescript
// Adicionar campos para refresh tokens
export const session = pgTable("session", {
  // ... campos existentes ...
  refreshTokenHash: text("refreshTokenHash").notNull().unique(),
  previousRefreshTokenHash: text("previousRefreshTokenHash"),
  rotatedAt: timestamp("rotatedAt"),
  revokedAt: timestamp("revokedAt"),
});
```

#### 1.2 Atualizar AuthService

**Arquivo:** `apps/server/src/services/auth.service.ts`

**Mudanças:**
- Separar geração de access e refresh tokens
- Hash de refresh tokens antes de armazenar
- Implementar rotação de refresh tokens
- Validar refresh tokens com hash

**Métodos novos:**
- `generateAccessToken(userId, sessionId)`: Access token (15-30 min)
- `generateRefreshToken()`: Refresh token (7-30 dias)
- `hashRefreshToken(token)`: Hash do refresh token
- `verifyRefreshToken(token, hash)`: Verificar refresh token
- `rotateRefreshToken(oldToken, sessionId)`: Rotacionar refresh token

#### 1.3 Criar Endpoint de Refresh

**Arquivo:** `apps/server/src/controllers/auth.controller.ts`

**Novo método:**
```typescript
async refreshToken(req: Request, res: Response, next: NextFunction) {
  // 1. Obter refresh token do cookie
  // 2. Validar refresh token
  // 3. Verificar se não foi revogado
  // 4. Gerar novo access token
  // 5. Rotacionar refresh token
  // 6. Retornar novos tokens
}
```

**Rota:** `POST /api/auth/refresh`

#### 1.4 Atualizar Middleware

**Arquivo:** `apps/server/src/middlewares/auth.middleware.ts`

**Mudanças:**
- Validar apenas access token (não precisa consultar banco)
- Se expirado, retornar 401 (frontend faz refresh)

### Fase 2: Frontend - Cliente de Autenticação

#### 2.1 Atualizar AuthContext

**Arquivo:** `apps/web/src/lib/contexts/auth-context.tsx`

**Mudanças:**
- Armazenar access token em memória (state)
- Salvar access token no IndexedDB para offline
- Implementar refresh automático quando access token expira
- Gerenciar ciclo de vida dos tokens

**Novos métodos:**
- `refreshAccessToken()`: Buscar novo access token usando refresh token
- `isAccessTokenExpired()`: Verificar se access token expirou
- `shouldRefreshToken()`: Decidir se deve fazer refresh

#### 2.2 Atualizar APIClient

**Arquivo:** `apps/web/src/lib/api-client.ts`

**Mudanças:**
- Interceptar respostas 401
- Tentar refresh token automaticamente
- Retry da requisição original com novo access token
- Evitar loops infinitos de refresh

**Fluxo:**
1. Requisição falha com 401
2. Verificar se é erro de autenticação
3. Tentar refresh token
4. Se sucesso, retry da requisição original
5. Se falha, redirecionar para login

#### 2.3 Atualizar IndexedDB Schema

**Arquivo:** `apps/web/src/lib/db/index.ts`

**Mudanças:**
- Remover armazenamento de refresh tokens (só no cookie)
- Armazenar apenas access token e dados do usuário
- Adicionar campo `accessTokenExpiresAt`

### Fase 3: Migração de Dados

#### 3.1 Criar Migration

**Arquivo:** `packages/db/src/migrations/XXXX_add_refresh_tokens.sql`

```sql
-- Adicionar colunas para refresh tokens
ALTER TABLE session 
  ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS previous_refresh_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS rotated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;

-- Migrar sessões existentes (opcional)
-- Ou forçar re-login de todos os usuários (recomendado)
```

#### 3.2 Estratégia de Migração

**Opção 1: Migração Gradual (Recomendado)**
- Manter compatibilidade com tokens antigos
- Novos logins usam access/refresh tokens
- Tokens antigos expiram naturalmente

**Opção 2: Migração Completa**
- Forçar re-login de todos os usuários
- Mais simples, mas interrompe sessões ativas

## 🔐 Configurações Recomendadas

### Variáveis de Ambiente

```env
# Access Token
JWT_ACCESS_TOKEN_EXPIRY=1800  # 30 minutos (em segundos)

# Refresh Token
JWT_REFRESH_TOKEN_EXPIRY=604800  # 7 dias (em segundos)

# Segurança
JWT_SECRET=your-secret-key  # Manter existente
REFRESH_TOKEN_ROTATION=true  # Habilitar rotação
```

### Constantes no Código

```typescript
// apps/server/src/services/auth.service.ts
const ACCESS_TOKEN_EXPIRY = 30 * 60; // 30 minutos
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 dias
const REFRESH_TOKEN_ROTATION = true;
```

## 📋 Checklist de Implementação

### Backend
- [ ] Criar migration para adicionar campos de refresh token
- [ ] Atualizar AuthService com geração de access/refresh tokens
- [ ] Implementar hash de refresh tokens
- [ ] Implementar rotação de refresh tokens
- [ ] Criar endpoint POST /api/auth/refresh
- [ ] Atualizar endpoint POST /api/auth/login
- [ ] Atualizar endpoint POST /api/auth/logout
- [ ] Atualizar middleware de autenticação
- [ ] Adicionar validação de refresh token reuse
- [ ] Implementar limpeza de refresh tokens expirados

### Frontend
- [ ] Atualizar AuthContext para gerenciar access tokens
- [ ] Implementar refresh automático no APIClient
- [ ] Atualizar IndexedDB schema
- [ ] Remover armazenamento de refresh tokens do IndexedDB
- [ ] Atualizar middleware do Next.js (se necessário)
- [ ] Testar fluxo completo de autenticação
- [ ] Testar refresh automático
- [ ] Testar logout e revogação

### Testes
- [ ] Testar login e recebimento de tokens
- [ ] Testar refresh token automático
- [ ] Testar refresh token rotation
- [ ] Testar revogação de refresh token
- [ ] Testar expiração de access token
- [ ] Testar expiração de refresh token
- [ ] Testar múltiplos dispositivos
- [ ] Testar offline/online

## 🚀 Benefícios da Migração

1. **Segurança Aprimorada**
   - Access tokens de curta duração limitam janela de ataque
   - Refresh tokens podem ser revogados imediatamente
   - Rotação previne replay attacks
   - Hash de refresh tokens protege contra vazamento do banco

2. **Performance**
   - Menos consultas ao banco (access token é stateless)
   - Refresh apenas quando necessário
   - Validação rápida de access tokens

3. **Escalabilidade**
   - Access tokens stateless (não precisam de banco)
   - Refresh tokens apenas no banco (menos carga)
   - Suporta múltiplos servidores sem compartilhar estado

4. **Offline Support**
   - Access token pode ser armazenado localmente
   - Refresh token no cookie para sincronização
   - Operações offline com access token válido

5. **Melhor UX**
   - Refresh automático transparente
   - Menos interrupções por expiração
   - Sessões mais longas sem comprometer segurança

## ⚠️ Considerações Importantes

1. **Compatibilidade com Offline**
   - Access token no IndexedDB permite operações offline
   - Refresh token sempre no cookie (mais seguro)
   - Sincronização quando voltar online

2. **Rate Limiting**
   - Limitar tentativas de refresh (ex: 5 por minuto)
   - Detectar e bloquear refresh tokens comprometidos
   - Alertar sobre atividade suspeita

3. **Multi-device**
   - Cada dispositivo tem seu próprio refresh token
   - Usuário pode ver e revogar tokens de dispositivos
   - Limitar número de dispositivos ativos (opcional)

4. **Backward Compatibility**
   - Manter suporte a tokens antigos durante migração
   - Período de transição para não quebrar sessões ativas

## 📚 Referências

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OAuth 2.0 Refresh Tokens](https://oauth.net/2/refresh-tokens/)
- [Token Rotation](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
