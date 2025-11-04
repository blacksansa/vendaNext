# 🔍 ANÁLISE DA IMPLEMENTAÇÃO ATUAL DE ROLES

## 📊 Estrutura Atual de Roles

### 🎭 Roles Definidas no Sistema

Baseado na análise do código, o sistema usa **2 tipos de roles**:

#### 1. **High-Level Roles** (Derivadas do grupo Keycloak `job`)
Armazenadas em: `user.role` (singular)

```typescript
// src/contexts/session-context.tsx (linhas 86-93)
// src/infra/config/Auth.ts (linhas 78-89)

const jobGroup = decoded.job?.[0]

if (jobGroup === 'Administradores') {
  role = 'admin'
} else if (jobGroup === 'Gerentes') {
  role = 'manager'
} else if (jobGroup === 'Lideres') {
  role = 'team_leader'
} else if (jobGroup === 'Vendedores') {
  role = 'seller'
} else {
  role = 'user' // Default
}
```

**Mapeamento:**
- `Administradores` → `admin`
- `Gerentes` → `manager`
- `Lideres` → `team_leader`
- `Vendedores` → `seller`
- Qualquer outro → `user` (default)

#### 2. **Client Roles** (Roles específicas do Keycloak client)
Armazenadas em: `user.roles` (plural - array)

```typescript
// Extrai de: decoded.resource_access?.[clientId]?.roles
const clientId = 'vendaplus' // ou process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
const clientRoles = decoded.resource_access?.[clientId]?.roles || []

// Exemplos de client roles:
// ['admin', 'view-users', 'manage-customers', 'view-reports']
```

---

## 🔍 Como o Sistema Verifica Roles Atualmente

### Método 1: Verificação Simples (usado em analytics e lideres)
```typescript
const { user, roles } = useAuth()
const isAdmin = roles?.includes("admin")
const isLeader = roles?.includes("leader") || roles?.includes("lider")
```

### Método 2: Verificação de High-Level Role
```typescript
const { user, role } = useAuth()
const isAdmin = role === 'admin'
const isManager = role === 'manager'
const isLeader = role === 'team_leader'
const isSeller = role === 'seller'
```

### Método 3: Verificação de Permissões (permissions.ts)
```typescript
// src/lib/permissions.ts
export function hasPermission(userRoles: string[] = [], requiredRole: string): boolean {
  return userRoles.includes(requiredRole)
}
```

---

## 🎯 Problema Atual

### ❌ Inconsistência na Verificação

**No código encontrado:**
```typescript
// analytics/page.tsx - verifica client roles
const isAdmin = roles?.includes("admin")  // roles = clientRoles array

// lideres/page.tsx - verifica client roles
const isAdmin = roles?.includes("admin")
const isLeader = roles?.includes("leader") || roles?.includes("lider")

// session-context.tsx - define high-level role
role = 'admin' // baseado no job group

// permissions.ts - verifica por string literal
hasPermission(userRoles, "manageCustomers")
```

**Problemas:**
1. `roles?.includes("admin")` verifica **client roles** (array)
2. `role === 'admin'` verifica **high-level role** (string)
3. Permissões usam strings literais como `"manageCustomers"` mas não há mapeamento claro

---

## 📋 Estrutura Real no Token JWT

```json
{
  "sub": "uuid-do-usuario",
  "email": "user@example.com",
  "name": "João Silva",
  "preferred_username": "joao.silva",
  "job": ["Administradores"],  // ← Grupo de trabalho
  "resource_access": {
    "vendaplus": {               // ← Client ID
      "roles": [                 // ← Client roles específicas
        "admin",
        "view-users",
        "manage-customers",
        "view-reports"
      ]
    }
  }
}
```

**Após processamento:**
```typescript
user = {
  id: "uuid-do-usuario",
  email: "user@example.com",
  name: "João Silva",
  role: "admin",                    // ← High-level (de job)
  roles: ["admin", "view-users", "manage-customers"], // ← Client roles
  job: ["Administradores"]          // ← Original
}
```

---

## 🎯 Roles Atualmente Usadas no Código

### Verificações Encontradas:

1. **`roles?.includes("admin")`**
   - Arquivos: analytics/page.tsx, lideres/page.tsx
   - Verifica: Se "admin" está nas client roles

2. **`roles?.includes("leader")` ou `roles?.includes("lider")`**
   - Arquivo: lideres/page.tsx
   - Verifica: Se "leader" ou "lider" está nas client roles

3. **`role === 'admin'`**
   - Potencial uso com high-level role
   - Baseado em job group

4. **Permissões na sidebar:**
   ```typescript
   requiredRole: "manageDashboard"
   requiredRole: "manageTeams"
   requiredRole: "manageUserGroups"
   // etc...
   ```

---

## 🔄 Recomendação de Padronização

### ✅ Opção 1: Usar High-Level Roles + Permissões

```typescript
// user.role para verificações gerais
const isAdmin = user.role === 'admin'
const isManager = user.role === 'manager'
const isLeader = user.role === 'team_leader'
const isSeller = user.role === 'seller'

// user.roles (client roles) para permissões específicas
const canManageUsers = user.roles?.includes('manage-users')
const canViewReports = user.roles?.includes('view-reports')
```

### ✅ Opção 2: Sistema de Permissões Completo

```typescript
// Mapear roles para permissões
const ROLE_PERMISSIONS = {
  admin: ['*'], // Todas
  manager: ['view-dashboard', 'manage-team', 'view-reports'],
  team_leader: ['view-dashboard', 'view-team', 'assign-tasks'],
  seller: ['view-dashboard', 'manage-own-customers']
}

function hasPermission(user, permission) {
  const rolePerms = ROLE_PERMISSIONS[user.role] || []
  return rolePerms.includes('*') || rolePerms.includes(permission)
}
```

---

## 📊 Grupos Keycloak Identificados

### Grupos de Job (High-Level)
1. **Administradores** → `admin`
2. **Gerentes** → `manager`
3. **Lideres** → `team_leader`
4. **Vendedores** → `seller`

### Client Roles (Granulares) - Inferidas
Baseado nas permissões definidas em `permissions.ts`:
- `manageDashboard`
- `manageTeams`
- `manageUserGroups`
- `managePipelines`
- `manageAnalytics`
- `manageTasks`
- `manageOrders`
- `manageApprovals`
- `manageRegistrations`
- `manageReports`
- `manageUsers`

---

## 🎯 Solução Proposta

### Sistema Híbrido:

1. **High-Level Roles** (`user.role`) - Para lógica de negócio
   - `admin`, `manager`, `team_leader`, `seller`, `user`
   
2. **Permissões Granulares** (`user.roles`) - Para controle de acesso
   - Client roles do Keycloak
   - Mapeadas para permissões específicas

3. **Router Guard** - Verifica permissões antes de renderizar
   - Baseado em permissões, não em roles
   - Permite combinação de permissões

### Exemplo:
```typescript
// Route config
{
  path: '/analytics',
  permissions: ['view-analytics', 'view-reports'],
  requireAll: false // OR logic (qualquer uma das permissões)
}

// Component guard
<ProtectedComponent permission="manage-users">
  <UserManagement />
</ProtectedComponent>

// Hook
const { hasPermission } = usePermissions()
if (hasPermission('delete-customer')) {
  // Mostrar botão deletar
}
```

---

## 📝 Próximos Passos

Baseado nesta análise, vou criar:

1. ✅ **Sistema de Permissões Unificado**
   - Mapeia high-level roles → permissões
   - Mapeia client roles → permissões
   - Combinação de ambas

2. ✅ **Router Guard**
   - Verifica permissões antes de renderizar rota
   - Redireciona para /forbidden ou /login

3. ✅ **Componentes de Proteção**
   - `<ProtectedRoute>`
   - `<ProtectedComponent>`
   - `usePermissions()` hook

4. ✅ **Atualizar Código Existente**
   - Padronizar verificações de role
   - Usar sistema unificado

---

**Posso prosseguir com a implementação?**
