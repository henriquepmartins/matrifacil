# matrifacil-

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Self, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Configure environment variables (see below).

3. Apply the schema to your database:

```bash
bun db:push
```

## Environment Variables Setup

### Quick Setup

Run the setup script:

```bash
./scripts/setup-env.sh
```

This will create `.env` files with auto-generated JWT secrets.

### Manual Setup

#### Backend (`apps/server/.env`)

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/matrifacil
JWT_SECRET=your_jwt_secret_min_32_chars
CORS_ORIGIN=http://localhost:3001
PORT=8080
NODE_ENV=development

# Optional - for cache and queues
REDIS_URL=redis://localhost:6379

# Optional - for document upload
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=documentos
```

See `apps/server/env.example` for all available options.

#### Frontend (`apps/web/.env.local`)

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional - for Supabase integration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

See `apps/web/env.example` for all available options.

**For detailed instructions, see [SYNC_CONFIGURATION.md](./SYNC_CONFIGURATION.md)**

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see your fullstack application.

## Project Structure

```
matrifacil-/
├── apps/
│   └── web/         # Fullstack application (Next.js)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
