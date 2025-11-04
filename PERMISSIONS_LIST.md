# 🔐 LISTA DE PERMISSÕES DO SISTEMA

## 📋 Estrutura de Permissões

Baseado na análise das rotas e funcionalidades, aqui está a lista completa de permissões que vamos implementar:

---

## 🎯 Permissões por Módulo

### 1. **Dashboard** (`manageDashboard`)
**Rotas:** `/`

**Ações:**
- `dashboard.view` - Ver dashboard principal
- `dashboard.view_metrics` - Ver métricas gerais
- `dashboard.view_charts` - Ver gráficos
- `dashboard.export` - Exportar dados do dashboard

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, view_metrics, view_charts
- **Leader:** view, view_metrics (apenas do seu time)
- **Seller:** view (apenas suas métricas)

---

### 2. **Clientes** (`manageCustomers`)
**Rotas:** `/customers`

**Ações:**
- `customers.view` - Ver lista de clientes
- `customers.view_details` - Ver detalhes de um cliente
- `customers.create` - Criar novo cliente
- `customers.edit` - Editar cliente
- `customers.delete` - Excluir cliente
- `customers.export` - Exportar clientes
- `customers.import` - Importar clientes

**Níveis:**
- **Admin:** Todas as ações em todos os clientes
- **Manager:** Todas as ações em clientes do seu departamento
- **Leader:** view, view_details, create, edit (apenas clientes do time)
- **Seller:** view, view_details, create (apenas clientes próprios)

---

### 3. **Oportunidades** (`manageOpportunities`)
**Rotas:** `/pipeline`, `/invoice`

**Ações:**
- `opportunities.view` - Ver oportunidades
- `opportunities.view_details` - Ver detalhes
- `opportunities.create` - Criar oportunidade
- `opportunities.edit` - Editar oportunidade
- `opportunities.delete` - Excluir oportunidade
- `opportunities.change_status` - Mudar status (WON/LOST)
- `opportunities.assign` - Atribuir para outro vendedor
- `opportunities.view_revenue` - Ver valores financeiros

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** Todas as ações do departamento
- **Leader:** view, create, edit (apenas do time)
- **Seller:** view, create, edit (apenas próprias)

---

### 4. **Funil de Vendas** (`managePipelines`)
**Rotas:** `/pipeline`

**Ações:**
- `pipelines.view` - Ver funil de vendas
- `pipelines.move_stage` - Mover entre estágios
- `pipelines.view_all` - Ver todas as oportunidades do funil
- `pipelines.edit_stages` - Editar configuração de estágios

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, view_all, move_stage (departamento)
- **Leader:** view, move_stage (time)
- **Seller:** view, move_stage (próprias)

---

### 5. **Grupos/Times** (`manageTeams` / `manageUserGroups`)
**Rotas:** `/grupos`, `/lideres`

**Ações:**
- `teams.view` - Ver grupos/times
- `teams.view_details` - Ver detalhes do grupo
- `teams.create` - Criar grupo
- `teams.edit` - Editar grupo
- `teams.delete` - Excluir grupo
- `teams.add_member` - Adicionar membro
- `teams.remove_member` - Remover membro
- `teams.view_metrics` - Ver métricas do time

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, view_details, view_metrics (todos os times)
- **Leader:** view, view_details, view_metrics (apenas seu time)
- **Seller:** view (apenas seu time)

---

### 6. **Análises** (`manageAnalytics`)
**Rotas:** `/analytics`

**Ações:**
- `analytics.view` - Ver análises
- `analytics.view_reports` - Ver relatórios
- `analytics.export` - Exportar relatórios
- `analytics.view_all_teams` - Ver análises de todos os times
- `analytics.view_financial` - Ver dados financeiros

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, view_reports, export, view_all_teams
- **Leader:** view, view_reports (apenas time)
- **Seller:** view (apenas próprias métricas)

---

### 7. **Tarefas** (`manageTasks`)
**Rotas:** `/tarefas`, `/minhas-tarefas`

**Ações:**
- `tasks.view` - Ver tarefas
- `tasks.view_all` - Ver todas as tarefas
- `tasks.create` - Criar tarefa
- `tasks.edit` - Editar tarefa
- `tasks.delete` - Excluir tarefa
- `tasks.assign` - Atribuir tarefa
- `tasks.change_status` - Mudar status da tarefa

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view_all, create, edit, assign (departamento)
- **Leader:** view_all, create, assign (time)
- **Seller:** view, create (próprias), change_status

---

### 8. **Aprovações** (`manageApprovals`)
**Rotas:** `/aprovacoes`

**Ações:**
- `approvals.view` - Ver aprovações pendentes
- `approvals.approve` - Aprovar
- `approvals.reject` - Rejeitar
- `approvals.view_history` - Ver histórico
- `approvals.create` - Criar solicitação

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, approve, reject, view_history
- **Leader:** view, approve, reject (apenas time)
- **Seller:** view, create (apenas próprias)

---

### 9. **Cadastros** (`manageRegistrations`)
**Rotas:** `/cadastros`

**Ações:**
- `registrations.view` - Ver cadastros
- `registrations.create` - Criar cadastro
- `registrations.edit` - Editar cadastro
- `registrations.delete` - Excluir cadastro
- `registrations.view_products` - Ver produtos
- `registrations.manage_products` - Gerenciar produtos

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, create, edit, delete
- **Leader:** view, create
- **Seller:** view

---

### 10. **Relatórios** (`manageReports`)
**Rotas:** `/relatorios`

**Ações:**
- `reports.view` - Ver relatórios
- `reports.create` - Criar relatório
- `reports.export` - Exportar relatório
- `reports.schedule` - Agendar relatório
- `reports.view_all` - Ver relatórios de todos

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, create, export, view_all
- **Leader:** view, export (apenas time)
- **Seller:** view (apenas próprios)

---

### 11. **Usuários** (`manageUsers`)
**Rotas:** `/usuarios`, `/vendedores`

**Ações:**
- `users.view` - Ver usuários
- `users.create` - Criar usuário
- `users.edit` - Editar usuário
- `users.delete` - Excluir usuário
- `users.change_role` - Mudar role
- `users.reset_password` - Resetar senha
- `users.view_activity` - Ver atividade do usuário

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, view_activity (departamento)
- **Leader:** view (apenas time)
- **Seller:** Sem acesso

---

### 12. **Configurações** (`manageSettings`)
**Rotas:** `/settings`, `/admin`

**Ações:**
- `settings.view` - Ver configurações
- `settings.edit` - Editar configurações
- `settings.manage_integrations` - Gerenciar integrações
- `settings.manage_stages` - Gerenciar estágios do funil
- `settings.manage_roles` - Gerenciar roles e permissões

**Níveis:**
- **Admin:** Todas as ações
- **Manager:** view, edit (configurações limitadas)
- **Leader:** view (apenas visualização)
- **Seller:** Sem acesso

---

## 📊 Matriz de Permissões por Role

| Módulo | Admin | Manager | Leader | Seller |
|--------|-------|---------|--------|--------|
| Dashboard | ✅ Tudo | ✅ Ver/Métricas | ✅ Time | ✅ Próprio |
| Clientes | ✅ CRUD | ✅ CRUD Dept | ✅ CRU Time | ✅ CR Próprio |
| Oportunidades | ✅ CRUD | ✅ CRUD Dept | ✅ CRU Time | ✅ CR Próprio |
| Funil | ✅ CRUD | ✅ CRU Dept | ✅ RU Time | ✅ RU Próprio |
| Grupos | ✅ CRUD | ✅ R Todos | ✅ R Time | ✅ R Time |
| Análises | ✅ Tudo | ✅ Todos | ✅ Time | ✅ Próprio |
| Tarefas | ✅ CRUD | ✅ CRUD Dept | ✅ CRU Time | ✅ RU Próprio |
| Aprovações | ✅ CRUD | ✅ Aprovar | ✅ Aprovar Time | ✅ R/Criar |
| Cadastros | ✅ CRUD | ✅ CRUD | ✅ CR | ✅ R |
| Relatórios | ✅ CRUD | ✅ CRU Todos | ✅ RU Time | ✅ R Próprio |
| Usuários | ✅ CRUD | ✅ R Dept | ✅ R Time | ❌ |
| Configurações | ✅ CRUD | ✅ R/U Limitado | ✅ R | ❌ |

**Legenda:**
- ✅ = Tem acesso
- ❌ = Sem acesso
- C = Create (Criar)
- R = Read (Ler)
- U = Update (Atualizar)
- D = Delete (Excluir)

---

## 🎭 Roles Principais

### 1. **Admin** (Administrador)
- Acesso completo a tudo
- Gerencia usuários e permissões
- Configurações do sistema
- Vê todos os dados

### 2. **Manager** (Gerente)
- Gerencia departamento completo
- Aprova ações importantes
- Vê dados do departamento
- Relatórios avançados

### 3. **Leader** (Líder de Time)
- Gerencia seu time específico
- Vê dados do time
- Atribui tarefas
- Aprova ações do time

### 4. **Seller** (Vendedor)
- Gerencia clientes próprios
- Cria oportunidades
- Vê próprias métricas
- Cria tarefas

### 5. **Viewer** (Visualizador)
- Apenas leitura
- Relatórios básicos
- Sem edição

---

## 🔄 Permissões Especiais

### **Super Admin**
- Todas as permissões + acesso a logs
- Gerenciamento de backups
- Acesso ao banco de dados
- Auditoria completa

### **Support**
- Visualização de dados
- Reset de senhas
- Suporte a usuários
- Sem edição de dados críticos

---

## 📝 Formato das Permissões

```typescript
interface Permission {
  module: string      // Ex: "customers", "opportunities"
  action: string      // Ex: "view", "create", "edit", "delete"
  scope?: string      // Ex: "own", "team", "department", "all"
  conditions?: {      // Condições adicionais
    field: string
    operator: string
    value: any
  }[]
}
```

### Exemplos:
```typescript
// Vendedor pode ver apenas próprios clientes
{
  module: "customers",
  action: "view",
  scope: "own"
}

// Líder pode editar clientes do time
{
  module: "customers",
  action: "edit",
  scope: "team"
}

// Admin pode deletar qualquer cliente
{
  module: "customers",
  action: "delete",
  scope: "all"
}
```

---

## 🚀 Próximos Passos

Agora vou criar:
1. ✅ Sistema de permissões completo (`permissions.ts`)
2. ✅ Router Guard baseado em permissões
3. ✅ HOC para proteger componentes
4. ✅ Hook `usePermissions()` para verificar acesso
5. ✅ Middleware para rotas protegidas

Posso prosseguir com a implementação?
