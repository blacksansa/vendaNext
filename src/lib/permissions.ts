export const NAVIGATION_ITEMS = [
  { title: "Painel", url: "/", icon: "Home", requiredRole: "manageDashboard" },
  { title: "Painel Líderes", url: "/lideres", icon: "Crown", requiredRole: "manageTeams" },
  { title: "Grupos", url: "/grupos", icon: "Users", requiredRole: "manageUserGroups" },
  { title: "Funil de Vendas", url: "/pipeline", icon: "GitBranch", requiredRole: "managePipelines" },
  { title: "Análises", url: "/analytics", icon: "BarChart3", requiredRole: "manageAnalytics" },
  { title: "Tarefas", url: "/tarefas", icon: "Kanban", requiredRole: "manageTasks" },
  { title: "Minhas Tarefas", url: "/minhas-tarefas", icon: "ListTodo", requiredRole: "manageTasks" },
  { title: "Invoices", url: "/invoice", icon: "ShoppingCart", requiredRole: "manageOrders" },
  { title: "Aprovações", url: "/aprovacoes", icon: "CheckSquare", requiredRole: "manageApprovals" },
  { title: "Cadastros", url: "/cadastros", icon: "FolderOpen", requiredRole: "manageRegistrations" },
  { title: "Relatórios", url: "/relatorios", icon: "FileText", requiredRole: "manageReports" },
  { title: "Usuários", url: "/usuarios", icon: "Shield", requiredRole: "manageUsers" },
]

export function hasPermission(userRoles: string[] = [], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

export function getVisibleNavigation(userRoles: string[] = []) {
  return NAVIGATION_ITEMS.filter((item) => hasPermission(userRoles, item.requiredRole));
}

export function canAccessModule(userRoles: string[] = [], requiredRole: string): boolean {
  return hasPermission(userRoles, requiredRole);
}