# Permissões por Página

## Mapeamento de Roles e Permissões

### Páginas Públicas (sem autenticação)
- `/login` - Login
- `/forgot-password` - Esqueci senha
- `/reset-password` - Reset senha

### Páginas Protegidas e suas Permissões

| Página | Role Necessária | Descrição |
|--------|----------------|-----------|
| `/` (Dashboard) | `manageDashboard` | Dashboard principal |
| `/analytics` | `manageAnalytics` | Análise de dados |
| `/customers` | `manageCustomers` | Gestão de clientes |
| `/pipeline` | `managePipelines` | Gestão de pipelines |
| `/tarefas` | `manageTasks` | Gestão de tarefas |
| `/minhas-tarefas` | (autenticado) | Tarefas do usuário |
| `/aprovacoes` | `manageApprovals` | Aprovações |
| `/invoice` | `manageInvoices` | Gestão de notas fiscais |
| `/relatorios` | (autenticado) | Relatórios |
| `/vendedores` | `manageSellers` | Gestão de vendedores |
| `/lideres` | `manageTeams` | LeaderBoard |
| `/usuarios` | `manageUsers` | Gestão de usuários |
| `/grupos` | `manageTeams` | Gestão de grupos/times |
| `/cadastros` | `manageRegistrations` | Cadastros diversos |
| `/settings` | (autenticado) | Configurações |
| `/admin/role-config` | `admin` role | Config de roles (admin apenas) |

## Problema Identificado

O código está com:
1. **Loop infinito de logs** - Session-context está imprimindo logs constantemente
2. **WebSocket conectando múltiplas vezes** - Backend mostra 150+ conexões
3. **Redirecionamento não funcionando** - AuthGuard chamando router.replace() durante render
4. **Permissões incorretas** - manageUserGroups deveria ser manageTeams

## Soluções

### 1. Remover logs de debug da session-context
### 2. Corrigir WebSocket para conectar apenas uma vez
### 3. Usar useEffect corretamente no AuthGuard
### 4. Atualizar permissões: manageUserGroups → manageTeams
