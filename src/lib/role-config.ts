export interface ComponentConfig {
  id: string
  name: string
  description: string
  requiredPermissions: {
    module: string
    action: string
  }[]
}

export const DASHBOARD_COMPONENTS: ComponentConfig[] = [
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

export const PAGE_COMPONENTS: Record<string, ComponentConfig[]> = {
  customers: [
    {
      id: "customer-list",
      name: "Lista de Clientes",
      description: "Tabela principal de clientes",
      requiredPermissions: [{ module: "customers", action: "view" }],
    },
    {
      id: "add-customer",
      name: "Adicionar Cliente",
      description: "Botão e formulário para adicionar cliente",
      requiredPermissions: [{ module: "customers", action: "create" }],
    },
    {
      id: "edit-customer",
      name: "Editar Cliente",
      description: "Funcionalidade de edição de clientes",
      requiredPermissions: [{ module: "customers", action: "edit" }],
    },
    {
      id: "delete-customer",
      name: "Excluir Cliente",
      description: "Funcionalidade de exclusão de clientes",
      requiredPermissions: [{ module: "customers", action: "delete" }],
    },
  ],
  grupos: [
    {
      id: "groups-overview",
      name: "Visão Geral dos Grupos",
      description: "Cards com métricas dos grupos",
      requiredPermissions: [{ module: "grupos", action: "view" }],
    },
    {
      id: "create-group",
      name: "Criar Grupo",
      description: "Funcionalidade para criar novos grupos",
      requiredPermissions: [{ module: "grupos", action: "create" }],
    },
    {
      id: "manage-group",
      name: "Gerenciar Grupo",
      description: "Editar e gerenciar membros do grupo",
      requiredPermissions: [{ module: "grupos", action: "edit" }],
    },
    {
      id: "group-analytics",
      name: "Análises do Grupo",
      description: "Métricas e relatórios por grupo",
      requiredPermissions: [{ module: "analytics", action: "view" }],
    },
  ],
}

// Função para verificar se um componente deve ser visível
export function isComponentVisible(userRole: string, componentId: string, page = "dashboard"): boolean {
  const components = page === "dashboard" ? DASHBOARD_COMPONENTS : PAGE_COMPONENTS[page] || []
  const component = components.find((c) => c.id === componentId)

  if (!component) return false

  // Importa as funções de permissão
  const { hasPermission } = require("./permissions")

  return component.requiredPermissions.every((perm) => hasPermission(userRole as any, perm.module, perm.action))
}

// Configuração de exemplo para diferentes ambientes
export const ENVIRONMENT_CONFIGS = {
  development: {
    showAllComponents: true,
    debugMode: true,
  },
  staging: {
    showAllComponents: false,
    debugMode: true,
  },
  production: {
    showAllComponents: false,
    debugMode: false,
  },
}
