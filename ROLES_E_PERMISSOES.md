# Sistema de Roles e Permissões

## Roles Disponíveis (Keycloak)

Cada role do Keycloak corresponde a uma permissão específica:

### Roles de Gestão
- `manageUsers` - Gerenciar usuários
- `manageUserGroups` - Gerenciar grupos de usuários
- `manageTeams` - Gerenciar equipes/líderes
- `manageSellers` - Gerenciar vendedores

### Roles de Visualização/Operação
- `manageDashboard` - Ver dashboard principal
- `manageCustomers` - Ver/editar clientes  
- `manageAnalytics` - Ver análises e relatórios
- `manageOrders` - Gerenciar pedidos
- `manageOpportunities` - Gerenciar oportunidades
- `manageTasks` - Gerenciar tarefas
- `manageProducts` - Gerenciar produtos
- `manageInvoices` - Gerenciar notas fiscais
- `manageReceivables` - Gerenciar recebíveis
- `manageApprovals` - Gerenciar aprovações

### Roles Administrativos
- `manageRegistrations` - Gerenciar cadastros gerais
- `manageSuppliers` - Gerenciar fornecedores
- `manageCampaigns` - Gerenciar campanhas
- `managePipelines` - Gerenciar pipelines

## Mapeamento Página -> Role Necessário

| Página | Path | Roles Necessários | Descrição |
|--------|------|-------------------|-----------|
| **Dashboard** | `/` | `manageDashboard` | Dashboard principal com métricas |
| **Usuários** | `/usuarios` | `manageUsers` | Gerenciar usuários do sistema |
| **Grupos** | `/grupos` | `manageUserGroups` | Gerenciar grupos de vendas |
| **Líderes** | `/lideres` | `manageTeams` | Ver equipes e líderes |
| **Vendedores** | `/vendedores` | `manageSellers` | Gerenciar vendedores |
| **Clientes** | `/customers` | `manageCustomers` | Ver/editar clientes |
| **Análises** | `/analytics` | `manageAnalytics` | Ver dashboards analíticos |
| **Tarefas** | `/tarefas` | `manageTasks` | Gerenciar tarefas |
| **Pedidos** | `/pipeline` | `manageOpportunities` | Pipeline de vendas |
| **Produtos** | `/cadastros` | `manageProducts` | Cadastro de produtos |
| **Notas Fiscais** | `/invoice` | `manageInvoices` | Gerenciar NF-e |
| **Recebíveis** | `/aprovacoes` | `manageReceivables` | Gerenciar recebíveis |
| **Cadastros** | `/cadastros` | `manageRegistrations` | Cadastros gerais |
| **Config Roles** | `/admin/role-config` | `manageUsers` | Configurar permissões |

## Como Funciona

### 1. Token JWT do Keycloak
O token JWT contém as roles no campo `realm_access.roles`:

```json
{
  "realm_access": {
    "roles": [
      "manageUsers",
      "manageDashboard",
      "manageCustomers"
    ]
  }
}
```

### 2. Verificação no Frontend
O `session-context.tsx` decodifica o token e extrai as roles:

```typescript
const decoded = jwtDecode<any>(accessToken)
const roles = decoded.realm_access?.roles || []
```

### 3. Proteção de Rotas
Cada página deve verificar se o usuário tem a role necessária:

```typescript
// Em cada page.tsx
const { session, status } = useSession()

if (status === 'authenticated' && !session?.roles?.includes('manageUsers')) {
  return <AccessDenied />
}
```

### 4. Componentes Condicionais
Use `RoleGuard` para mostrar/esconder partes da UI:

```typescript
<RoleGuard requiredRole="manageUsers">
  <Button>Criar Usuário</Button>
</RoleGuard>
```

## Problemas Identificados e Corrigidos

### 1. Loop Infinito de Token Refresh
**Problema**: Token sendo refreshado a cada 1 minuto  
**Solução**: Desabilitado auto-refresh, deixar axios interceptor cuidar

### 2. AuthGuard causando re-render
**Problema**: Warning "Cannot update a component while rendering..."  
**Solução**: Usar `useRef` para evitar múltiplos redirects

### 3. Páginas sem verificação de role
**Problema**: `/usuarios` e `/grupos` não verificam permissão  
**Solução**: Adicionar verificação de role em cada página

### 4. Redirect após login não funciona
**Problema**: AuthGuard não redireciona para `/` após login  
**Solução**: Verificar `status === 'authenticated'` e pathname

## Configuração no Keycloak

### 1. Criar Roles
No Keycloak, criar cada role listada acima em **Realm Roles**.

### 2. Criar Grupos
Criar grupos de usuários como:
- **Administradores** - todas as roles
- **Gerentes** - roles de gestão + operação
- **Vendedores** - apenas `manageDashboard`, `manageCustomers`, `manageTasks`
- **Analistas** - apenas `manageDashboard`, `manageAnalytics`

### 3. Atribuir Roles aos Grupos
Em cada grupo, aba **Role Mapping**, atribuir as roles apropriadas.

### 4. Adicionar Usuários aos Grupos
Cada usuário deve pertencer a pelo menos um grupo.

## Testando Permissões

1. Criar usuário de teste no Keycloak
2. Adicionar ao grupo desejado
3. Fazer login no sistema
4. Verificar que:
   - Páginas permitidas carregam normalmente
   - Páginas não permitidas mostram "Acesso Negado"
   - Componentes condicionais aparecem/desaparecem conforme role

## Debug

Para debug, adicione em qualquer página:

```typescript
console.log('Current roles:', session?.roles)
console.log('Required role:', 'manageUsers')
console.log('Has permission:', session?.roles?.includes('manageUsers'))
```
