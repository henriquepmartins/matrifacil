# Guia de Teste: Fluxo de Matrícula Offline Corrigido

## Objetivo

Verificar que pré-matrículas criadas offline mantêm o status "pre" após sincronização e só mudam para "completo" com conversão manual.

## Alterações Realizadas

### 1. Cliente (Web)

**Arquivo:** `apps/web/src/lib/sync/reconciliation.ts`

- Removido `status: "completo"` em 3 locais durante reconciliação (linhas 107-111, 119-123, 127-131)
- O status agora é preservado como veio do servidor

### 2. Servidor (Backend)

**Arquivo:** `apps/server/src/repositories/sync.repository.ts`

- Corrigido bug onde campo `status` era removido da desestruturação mas depois usado (linha 326 e 823)
- Status agora é preservado: `status: item.data.status || restOfData.status || "pre"`
- Alteração feita em 2 locais: criação inicial (linha 342) e reprocessamento (linha 839)

## Cenários de Teste

### Teste 1: Criar Pré-Matrícula Offline

1. **Desconectar a internet** (desabilitar Wi-Fi/Ethernet)
2. Acessar o dashboard e ir para "Nova Pré-Matrícula"
3. Preencher os dados do aluno e responsável
4. Salvar a pré-matrícula
5. **Verificar:**
   - ✅ Pré-matrícula aparece na lista com status "Pré-Matrícula"
   - ✅ Protocolo gerado localmente (formato: etapa - ano - número)

### Teste 2: Sincronizar Pré-Matrícula Offline

1. Com pré-matrícula criada no Teste 1
2. **Reconectar a internet**
3. Aguardar sincronização automática (ou forçar manualmente se disponível)
4. **Verificar:**
   - ✅ Pré-matrícula sincronizada com sucesso (ícone de sincronização)
   - ✅ Status permanece "Pré-Matrícula" (não muda para "Completo")
   - ✅ Dados visíveis tanto offline quanto online

### Teste 3: Conversão Manual para Matrícula Completa

1. Com pré-matrícula sincronizada do Teste 2
2. Acessar a pré-matrícula
3. Clicar em "Converter para Matrícula" ou similar
4. Selecionar turma (se aplicável)
5. Confirmar conversão
6. **Verificar:**
   - ✅ Status agora é "Completo" ou "Pendente Doc"
   - ✅ Turma associada (se selecionada)
   - ✅ Data de matrícula preenchida

### Teste 4: Comparação com Fluxo Online

1. **Com internet conectada**
2. Criar uma nova pré-matrícula
3. **Verificar:**
   - ✅ Status inicial é "Pré-Matrícula"
   - ✅ Não muda automaticamente para "Completo"
   - ✅ Comportamento idêntico ao fluxo offline

### Teste 5: Múltiplas Pré-Matrículas Offline

1. Desconectar internet
2. Criar 3 pré-matrículas diferentes
3. Reconectar internet
4. Aguardar sincronização
5. **Verificar:**
   - ✅ Todas as 3 pré-matrículas sincronizadas
   - ✅ Todas mantêm status "Pré-Matrícula"
   - ✅ Nenhuma conversão automática

## Verificações Técnicas

### No Servidor (PostgreSQL/Supabase)

```sql
-- Verificar status das matrículas sincronizadas
SELECT id, protocolo_local, status, created_at, updated_at
FROM matricula
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Deve mostrar status = 'pre' para pré-matrículas sincronizadas
```

### No Cliente (Console do Navegador)

```javascript
// Verificar IndexedDB
const db = await window.db;
const matriculas = await db.matriculas.toArray();
console.table(
  matriculas.map((m) => ({
    id: m.id,
    status: m.status,
    sync_status: m.sync_status,
    idGlobal: m.idGlobal,
  }))
);

// Todas devem ter sync_status = 'synced' após sincronização
// Status deve permanecer 'pre' até conversão manual
```

### Logs para Acompanhar

**Durante sincronização, procurar por:**

```
✅ Matrícula {id_local} → {id_global} atualizada com dados completos
✅ Reconciliado matricula {id_local} → {id_global}
```

**NÃO deve aparecer:**

```
❌ Status alterado automaticamente para 'completo'
```

## Resultado Esperado

### Antes das Correções ❌

- Pré-matrícula offline → Sincronizada → Status mudava para "Completo" automaticamente

### Após as Correções ✅

- Pré-matrícula offline → Sincronizada → Status permanece "Pré-Matrícula"
- Conversão para "Completo" APENAS através de ação manual
- Comportamento consistente entre fluxo online e offline

## Troubleshooting

### Problema: Status ainda muda automaticamente

**Possíveis causas:**

1. Cache do navegador não atualizado → Limpar cache e recarregar
2. Servidor não reiniciado → Reiniciar servidor backend
3. Código antigo em produção → Verificar deploy

### Problema: Sincronização não acontece

**Verificar:**

1. Conexão com internet
2. Token de autenticação válido
3. Logs do navegador (F12 → Console)
4. Logs do servidor

### Problema: Erro ao converter manualmente

**Verificar:**

1. Turma selecionada existe
2. Turma tem vagas disponíveis
3. Logs para mais detalhes

## Checklist Final

Antes de considerar o teste completo, confirmar:

- [ ] Pré-matrícula criada offline mantém status "pre" após sincronização
- [ ] Conversão manual funciona corretamente
- [ ] Fluxo online e offline se comportam da mesma forma
- [ ] Dados persistem corretamente no servidor
- [ ] Não há erros no console do navegador
- [ ] Não há erros nos logs do servidor
