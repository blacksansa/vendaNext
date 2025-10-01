export type UserRole = "admin" | "manager" | "team_leader" | "sales_rep" | "viewer"

export interface Permission {
  module: string
  actions: string[]
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { module: "dashboard", actions: ["view", "edit"] },
    { module: "customers", actions: ["view", "create", "edit", "delete"] },
    { module: "sellers", actions: ["view", "create", "edit", "delete"] },
    { module: "lideres", actions: ["view", "create", "edit", "delete"] },
    { module: "teams", actions: ["view", "create", "edit", "delete"] },
    { module: "pipeline", actions: ["view", "create", "edit", "delete"] },
    { module: "analytics", actions: ["view", "export"] },
    { module: "tarefas", actions: ["view", "create", "edit", "delete"] },
    { module: "relatorios", actions: ["view", "create", "export"] },
    { module: "users", actions: ["view", "create", "edit", "delete"] },
    { module: "settings", actions: ["view", "edit"] },
  ],
  manager: [
    { module: "dashboard", actions: ["view"] },
    { module: "customers", actions: ["view", "create", "edit"] },
    { module: "sellers", actions: ["view", "edit"] },
    { module: "lideres", actions: ["view"] },
    { module: "teams", actions: ["view", "edit"] },
    { module: "pipeline", actions: ["view", "create", "edit"] },
    { module: "analytics", actions: ["view"] },
    { module: "tarefas", actions: ["view", "create", "edit"] },
    { module: "relatorios", actions: ["view", "export"] },
    { module: "settings", actions: ["view"] },
  ],
  team_leader: [
    { module: "dashboard", actions: ["view"] },
    { module: "customers", actions: ["view", "create", "edit"] },
    { module: "sellers", actions: ["view"] },
    { module: "lideres", actions: ["view"] },
    { module: "teams", actions: ["view"] }, // Apenas seu próprio grupo
    { module: "pipeline", actions: ["view", "create", "edit"] },
    { module: "analytics", actions: ["view"] },
    { module: "tarefas", actions: ["view", "create", "edit"] },
    { module: "relatorios", actions: ["view"] },
  ],
  sales_rep: [
    { module: "dashboard", actions: ["view"] },
    { module: "customers", actions: ["view", "create", "edit"] },
    { module: "pipeline", actions: ["view", "create", "edit"] },
    { module: "tarefas", actions: ["view", "create", "edit"] },
  ],
  viewer: [
    { module: "dashboard", actions: ["view"] },
    { module: "customers", actions: ["view"] },
    { module: "analytics", actions: ["view"] },
    { module: "relatorios", actions: ["view"] },
  ],
}

export const NAVIGATION_ITEMS = [
  { title: "Dashboard", url: "/", icon: "Home", module: "dashboard" },
  { title: "Clientes", url: "/customers", icon: "Users", module: "customers" },
  { title: "Sellers", url: "/sellers", icon: "UserPlus", module: "sellers" },
  { title: "Dashboard Líderes", url: "/lideres", icon: "Crown", module: "lideres" },
  { title: "Teams", url: "/teams", icon: "Users", module: "teams" },,
  { title: "Pipeline", url: "/pipeline", icon: "GitBranch", module: "pipeline" },
  { title: "Análises", url: "/analytics", icon: "BarChart3", module: "analytics" },
  { title: "Tarefas", url: "/tarefas", icon: "Kanban", module: "tarefas" },
  { title: "Relatórios", url: "/relatorios", icon: "FileText", module: "relatorios" },
  { title: "Users", url: "/users", icon: "Shield", module: "users" },
]

export function hasPermission(userRole: UserRole, module: string, action: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  const modulePermission = rolePermissions.find((p) => p.module === module)
  return modulePermission?.actions.includes(action) || false
}

export function getVisibleNavigation(userRole: UserRole) {
  return NAVIGATION_ITEMS.filter((item) => hasPermission(userRole, item.module, "view"))
}

export function canAccessModule(userRole: UserRole, module: string): boolean {
  return hasPermission(userRole, module, "view")
}

export const DASHBOARD_COMPONENTS = [
  {
    id: "overview-cards",
    name: "Cards de Visão Geral",
    description: "Métricas principais do dashboard",
    requiredPermissions: [{ module: "dashboard", action: "view" }],
  },
  {
    id: "sales-chart",
    name: "Gráfico de Vendas",
    description: "Gráfico de vendas mensais",
    requiredPermissions: [{ module: "analytics", action: "view" }],
  },
  {
    id: "recent-customers",
    name: "Clientes Recentes",
    description: "Lista de clientes recentes",
    requiredPermissions: [{ module: "customers", action: "view" }],
  },
  {
    id: "team-performance",
    name: "Performance da Equipe",
    description: "Métricas de performance dos vendedores",
    requiredPermissions: [{ module: "vendedores", action: "view" }],
  },
  {
    id: "pipeline-overview",
    name: "Visão Geral do Pipeline",
    description: "Status atual do pipeline de vendas",
    requiredPermissions: [{ module: "pipeline", action: "view" }],
  },
  {
    id: "quick-actions",
    name: "Ações Rápidas",
    description: "Botões de ações rápidas personalizáveis",
    requiredPermissions: [{ module: "dashboard", action: "view" }],
  },
  {
    id: "admin-tools",
    name: "Ferramentas de Admin",
    description: "Ferramentas exclusivas para administradores",
    requiredPermissions: [{ module: "usuarios", action: "view" }],
  },
]
