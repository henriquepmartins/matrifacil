# Configuração do Ambiente (.env)

## ✅ CONFIGURAÇÃO COMPLETA!

Todas as tarefas foram concluídas com sucesso:

1. ✅ Schema do Better Auth criado com 4 tabelas (user, session, account, verification)
2. ✅ Migrações geradas pelo Drizzle Kit
3. ✅ Migrações aplicadas com sucesso no Supabase
4. ✅ Arquivo `.env` criado e configurado em `apps/web/.env`
5. ✅ Senha forte gerada para BETTER_AUTH_SECRET
6. ✅ Conexão com banco de dados testada e funcionando

## 📋 Tabelas Criadas no Supabase

- **user**: Armazena usuários do sistema
- **session**: Gerencia sessões de autenticação
- **account**: Armazena contas vinculadas (email/password, OAuth, etc)
- **verification**: Tokens de verificação de email

## 📁 Arquivo .env Configurado

O arquivo `apps/web/.env` já está criado e configurado com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vbwtuuagrbdgvwzyowbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection String (Conexão Direta - Porta 5432)
DATABASE_URL=postgresql://postgres:********@db.vbwtuuagrbdgvwzyowbw.supabase.co:5432/postgres

# Better Auth Configuration (Chave gerada automaticamente)
BETTER_AUTH_SECRET=6cSkTctyPZlBY/IqoLVF9hXIkGqqltJZtRMRyyzE8nQ=

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

⚠️ **Nota de Segurança**: As credenciais estão protegidas no arquivo `.env` que está no `.gitignore`.
Nunca compartilhe ou commit este arquivo!

## 📊 Verificar as Tabelas

Você pode verificar as tabelas criadas executando:

```bash
# Listar tabelas via MCP (Supabase)
# Ou acesse o Supabase Dashboard > Table Editor
```

## 🗄️ Estrutura do Schema

### Tabela: user

- `id` (text, PK)
- `name` (text)
- `email` (text, unique)
- `emailVerified` (boolean, default: false)
- `image` (text, nullable)
- `createdAt` (timestamp, default: now())
- `updatedAt` (timestamp, default: now())

### Tabela: session

- `id` (text, PK)
- `expiresAt` (timestamp)
- `token` (text, unique)
- `createdAt` (timestamp, default: now())
- `updatedAt` (timestamp, default: now())
- `ipAddress` (text, nullable)
- `userAgent` (text, nullable)
- `userId` (text, FK -> user.id, cascade on delete)

### Tabela: account

- `id` (text, PK)
- `accountId` (text)
- `providerId` (text)
- `userId` (text, FK -> user.id, cascade on delete)
- `accessToken` (text, nullable)
- `refreshToken` (text, nullable)
- `idToken` (text, nullable)
- `accessTokenExpiresAt` (timestamp, nullable)
- `refreshTokenExpiresAt` (timestamp, nullable)
- `scope` (text, nullable)
- `password` (text, nullable) - hash da senha para email/password auth
- `createdAt` (timestamp, default: now())
- `updatedAt` (timestamp, default: now())

### Tabela: verification

- `id` (text, PK)
- `identifier` (text)
- `value` (text)
- `expiresAt` (timestamp)
- `createdAt` (timestamp, default: now())
- `updatedAt` (timestamp, default: now())

## 🧪 Testar a Conexão

Antes de iniciar a aplicação, teste se a conexão está funcionando:

```bash
cd packages/db
bun run test-connection.ts
```

Se você ver "✅ Conexão bem-sucedida!", está tudo certo!

## 🚀 Pronto para Usar!

Após configurar o arquivo `.env` e testar a conexão, você pode:

1. Iniciar a aplicação: `bun dev`
2. O Better Auth estará configurado e pronto para uso
3. As rotas de autenticação estarão disponíveis em `/api/auth/*`
4. Formulários de login/registro disponíveis em:
   - `/login` - Página de login
   - Componentes prontos: `sign-in-form.tsx` e `sign-up-form.tsx`
