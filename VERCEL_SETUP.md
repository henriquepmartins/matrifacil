# Configuração da Vercel para MatriFácil

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente na Vercel:

### Obrigatórias

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)

### Opcionais

- `PORT`: Porta do servidor (padrão: 8080)
- `CORS_ORIGIN`: URL do frontend (padrão: http://localhost:3001)
- `NODE_ENV`: Ambiente de execução (padrão: production)

## Como Configurar na Vercel

1. Acesse o painel da Vercel
2. Selecione seu projeto "matrifacil"
3. Vá para a aba "Settings" > "Environment Variables"
4. Adicione as variáveis necessárias:

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
CORS_ORIGIN=https://your-frontend-domain.com
PORT=8080
NODE_ENV=production
```

## Gerando JWT_SECRET

Para gerar uma chave JWT segura, use:

```bash
openssl rand -base64 32
```

## Configuração do Projeto

O projeto está configurado para usar:

- **Build Command**: `cd apps/server && bun run vercel-build`
- **Output Directory**: `apps/server/dist`
- **Install Command**: `bun install`

## Verificação

Após configurar as variáveis, o servidor deve estar disponível em:

- API: `https://matrifacil.vercel.app`
- Health Check: `https://matrifacil.vercel.app/health`
- Documentação: `https://matrifacil.vercel.app/docs`

## Troubleshooting

### Erro de DATABASE_URL

Se você receber um erro sobre DATABASE_URL não estar definida:

1. Verifique se a variável está configurada na Vercel
2. Certifique-se de que o valor está correto
3. Faça um novo deploy após adicionar a variável

### Erro de JWT_SECRET

Se você receber um erro sobre JWT_SECRET:

1. Gere uma nova chave usando `openssl rand -base64 32`
2. Adicione a chave nas variáveis de ambiente da Vercel
3. Faça um novo deploy
