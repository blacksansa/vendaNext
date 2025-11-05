# Sistema de Permissões - Venda+

## Resumo das Mudanças

### 1. Logs Infinitos Corrigidos
- **Problema**: Token refresh estava rodando a cada 1 minuto e logando excessivamente
- **Solução**: Alterado intervalo de verificação para 5 minutos e adicionados logs condicionais

### 2. Redirecionamento após Login
- **Problema**: Após login, não redirecionava automaticamente para `/`
- **Solução**: 
  - Adicionado `window.location.href = "/"` no login
  - Melhorado AuthGuard para usar `window.location.href` em vez de `router.replace`
  - Adicionado estado `isRedirecting` para evitar múltiplos redirecionamentos

### 3. Sistema de Permissões Centralizado
- **Arquivo**: `/src/config/permissions.ts`
- **Hook**: `/src/hooks/use-permissions.ts`
- **Mudança**: `manageUserGroups` → `manageTeams` (conforme solicitado)
- **Nova permissão**: `LeaderBoard` para página de líderes

## Mapeamento de Permissões por Página

### Dashboard e Analytics
- `/` → `manageDashboard`
- `/Dashboard` → `manageDashboard`
- `/analytics` → `manageAnalytics`

### Cadastros
- `/cadastros` → `manageRegistrations`
- `/customers` → `manageCustomers`
- `/suppliers` → `manageSuppliers`
- `/products` → `manageProducts`

### Vendas
- `/opportunities` → `manageOpportunities`
- `/orders` → `manageOrders`
- `/invoice` → `manageInvoices`
- `/receivables` → `manageReceivables`

### Pipeline
- `/pipeline` → `managePipelines`

### Tarefas
- `/tarefas` → `manageTasks`
- `/minhas-tarefas` → `manageTasks`

### Aprovações
- `/aprovacoes` → `manageApprovals`

### Usuários e Grupos
- `/usuarios` → `manageUsers`
- `/grupos` → `manageTeams` ✨ (alterado de manageUserGroups)

### Vendedores e Líderes
- `/vendedores` → `manageSellers`
- `/lideres` → `LeaderBoard` ✨ (nova permissão específica)

### Configurações
- `/settings` → Requer pelo menos UMA das seguintes:
  - `manageCustomerGroups`
  - `manageCustomerTags`
  - `manageProductGroups`
  - `manageProductTags`
  - `managePriceTags`
  - `managePaymentTypes`
  - `managePaymentConditions`
  - `manageReceivableTypes`
  - `manageReceivableHolders`
  - `manageReceivableStatus`
  - `manageAddressTypes`
  - `manageContactTypes`
  - `manageLossReasons`
  - `manageUnities`
  - `manageCampaigns`

## Configuração no Keycloak

### Roles que precisam ser criadas/atualizadas:

1. **manageTeams** (substituir manageUserGroups)
   - Descrição: Gerenciar grupos/times de usuários

2. **LeaderBoard** (nova)
   - Descrição: Acesso ao dashboard de líderes

### Passos no Keycloak:

1. Acesse seu Realm
2. Vá em **Clients** → Selecione seu cliente (vendaplus)
3. Vá em **Roles**
4. Crie/edite as roles:
   - Se existir `manageUserGroups`, pode renomear ou criar nova `manageTeams`
   - Crie nova role `LeaderBoard`
5. Atribua aos usuários/grupos apropriados

## Como usar as Permissões no Código

### Usando o Hook

```tsx
import { usePermissions } from '@/hooks/use-permissions'

function MeuComponente() {
  const { can, canAll, canAny, canAccessRoute } = usePermissions()
  
  // Verificar uma permissão
  if (can('manageUsers')) {
    // Mostrar botão de adicionar usuário
  }
  
  // Verificar múltiplas permissões (todas)
  if (canAll(['manageUsers', 'manageTeams'])) {
    // Mostrar funcionalidade avançada
  }
  
  // Verificar múltiplas permissões (pelo menos uma)
  if (canAny(['manageUsers', 'manageTeams'])) {
    // Mostrar menu de gerenciamento
  }
  
  // Verificar acesso a rota
  if (canAccessRoute('/usuarios')) {
    // Mostrar link para usuários
  }
}
```

### Verificação em Páginas

```tsx
import { useSession } from '@/contexts/session-context'
import { PERMISSIONS } from '@/config/permissions'

export default function MinhaPage() {
  const { session, status } = useSession()
  
  // Verificar permissão específica
  if (status === 'authenticated' && !session?.user?.roles?.includes(PERMISSIONS.USERS)) {
    return <AccessDenied />
  }
  
  // Resto do código...
}
```

## Sidebar e Rotas Públicas

### Rotas onde Sidebar NÃO aparece:
- `/login`
- `/forgot-password`
- `/reset-password`

### Comportamento do AuthGuard:
1. **Rotas Públicas** (`/login`, `/forgot-password`, `/reset-password`):
   - Se não autenticado: permite acesso
   - Se autenticado: redireciona para `/`

2. **Rotas Protegidas**:
   - Se não autenticado: redireciona para `/login`
   - Se autenticado sem permissão: redireciona para `/`
   - Se autenticado com permissão: permite acesso

## Problemas Corrigidos

### 1. WebSocket Infinito
- Antes: WebSocket reconectava constantemente
- Depois: Mantém conexão estável

### 2. Token Refresh Infinito
- Antes: Verificava a cada 1 minuto e logava sempre
- Depois: Verifica a cada 5 minutos e loga apenas quando necessário

### 3. React Warning (setState durante render)
- Antes: AuthGuard chamava `router.replace()` diretamente
- Depois: Usa `useEffect` com estado de controle para evitar loops

### 4. Permissões Inconsistentes
- Antes: Cada página verificava permissões de forma diferente
- Depois: Sistema centralizado e padronizado

## Próximos Passos

1. ✅ Atualizar roles no Keycloak
2. ✅ Testar redirecionamentos após login
3. ✅ Verificar se sidebar não aparece em páginas de login
4. ✅ Testar controle de acesso por permissões
5. ⏳ Documentar todas as permissões no Keycloak
