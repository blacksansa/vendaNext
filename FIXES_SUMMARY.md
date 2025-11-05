# Correções Aplicadas

## 1. Loop Infinito de Refresh Token ✅
**Problema:** Token refresh estava sendo chamado continuamente, gerando logs intermináveis.

**Solução:**
- Removido `checkExpiration()` imediato no useEffect
- Adicionado flag `isRefreshing.current` para prevenir múltiplos refreshes simultâneos
- Intervalo de verificação mantido em 5 minutos

## 2. Permissões Incorretas ✅
**Problema:** Rotas `/usuarios`, `/grupos`, `/lideres` não estavam com permissões corretas.

**Correções:**
- `/usuarios` → `manageUsers`
- `/grupos` → `manageTeams` (alterado de `manageUserGroups`)
- `/permissoes` → `manageTeams` (mesma permissão de grupos)
- `/lideres` → `LeaderBoard` (permissão específica para líderes)
- `/vendedores` → `manageSellers`

## 3. Redirect Após Login ✅
**Problema:** Após login bem-sucedido, não redirecionava para `/`.

**Solução:**
- Login agora usa `window.location.href = "/"` para forçar reload completo
- Aguarda 100ms após salvar tokens no localStorage
- Dispara evento `storage` para sincronizar contextos

## 4. Logout com Múltiplos Cliques ✅
**Problema:** Primeiro clique não funcionava.

**Solução:**
- `signOut()` agora usa `window.location.href = '/login'` para garantir redirect
- Limpeza completa do localStorage antes do redirect
- Estado `unauthenticated` definido antes do redirect

## 5. Loop de Redirecionamento em Páginas sem Permissão ✅
**Problema:** Ao acessar rota sem permissão, ficava em loop de redirect.

**Solução:**
- Uso de `router.replace('/')` ao invés de `router.push('/')`
- Timeout reduzido de 100ms para 50ms
- Flag `hasCheckedPermission` resetada apenas quando muda de rota

## 6. Logs Excessivos Removidos ✅
- Removido log de "Token expirando em breve" em modo silencioso
- Mantidos apenas logs de erro
- Removido console.warn de permissão negada

## Permissões por Página

| Rota | Permissão Necessária |
|------|---------------------|
| `/` | `manageDashboard` |
| `/analytics` | `manageAnalytics` |
| `/usuarios` | `manageUsers` |
| `/grupos` | `manageTeams` |
| `/permissoes` | `manageTeams` |
| `/lideres` | `LeaderBoard` |
| `/vendedores` | `manageSellers` |
| `/customers` | `manageCustomers` |
| `/suppliers` | `manageSuppliers` |
| `/products` | `manageProducts` |
| `/opportunities` | `manageOpportunities` |
| `/orders` | `manageOrders` |
| `/invoice` | `manageInvoices` |
| `/receivables` | `manageReceivables` |
| `/pipeline` | `managePipelines` |
| `/tarefas` | `manageTasks` |
| `/aprovacoes` | `manageApprovals` |

## Configuração no Keycloak

Para que as permissões funcionem, você precisa:

1. **Client Roles** - Criar as roles no client `vendaplus`:
   - `manageUsers`
   - `manageTeams`
   - `LeaderBoard`
   - `manageSellers`
   - `manageDashboard`
   - etc.

2. **Atribuir Roles** - Atribuir as roles aos usuários ou grupos no Keycloak

3. **Token Claims** - Garantir que as roles aparecem no token JWT em:
   ```json
   {
     "resource_access": {
       "vendaplus": {
         "roles": ["manageUsers", "LeaderBoard", ...]
       }
     }
   }
   ```
