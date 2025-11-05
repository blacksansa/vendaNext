/**
 * Mapeamento de permissões do sistema
 * Cada rota tem uma ou mais permissões associadas
 */

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: 'manageDashboard',
  
  // Analytics
  ANALYTICS: 'manageAnalytics',
  
  // Cadastros
  REGISTRATIONS: 'manageRegistrations',
  CUSTOMERS: 'manageCustomers',
  SUPPLIERS: 'manageSuppliers',
  PRODUCTS: 'manageProducts',
  
  // Vendas
  OPPORTUNITIES: 'manageOpportunities',
  ORDERS: 'manageOrders',
  INVOICES: 'manageInvoices',
  RECEIVABLES: 'manageReceivables',
  
  // Pipeline
  PIPELINE: 'managePipelines',
  STAGES: 'manageStages',
  
  // Tarefas
  TASKS: 'manageTasks',
  
  // Aprovações
  APPROVALS: 'manageApprovals',
  
  // Usuários e Grupos
  USERS: 'manageUsers',
  TEAMS: 'manageTeams', // Grupos de usuários
  PERMISSIONS: 'manageTeams', // Mesma permissão para gerenciar permissões
  
  // Vendedores e Líderes
  SELLERS: 'manageSellers',
  LEADER_BOARD: 'LeaderBoard', // Permissão específica para líderes (Keycloak)
  
  // Configurações
  CUSTOMER_GROUPS: 'manageCustomerGroups',
  CUSTOMER_TAGS: 'manageCustomerTags',
  PRODUCT_GROUPS: 'manageProductGroups',
  PRODUCT_TAGS: 'manageProductTags',
  PRICE_TAGS: 'managePriceTags',
  PAYMENT_TYPES: 'managePaymentTypes',
  PAYMENT_CONDITIONS: 'managePaymentConditions',
  RECEIVABLE_TYPES: 'manageReceivableTypes',
  RECEIVABLE_HOLDERS: 'manageReceivableHolders',
  RECEIVABLE_STATUS: 'manageReceivableStatus',
  ADDRESS_TYPES: 'manageAddressTypes',
  CONTACT_TYPES: 'manageContactTypes',
  LOSS_REASONS: 'manageLossReasons',
  UNITIES: 'manageUnities',
  CAMPAIGNS: 'manageCampaigns',
  
  // IA
  AI_CUSTOMER_CENTRAL: 'manageAiCustomerCentral',
} as const

/**
 * Mapeamento de rotas para permissões
 */
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  '/': PERMISSIONS.DASHBOARD,
  '/Dashboard': PERMISSIONS.DASHBOARD,
  '/analytics': PERMISSIONS.ANALYTICS,
  
  // Cadastros
  '/cadastros': PERMISSIONS.REGISTRATIONS,
  '/customers': PERMISSIONS.CUSTOMERS,
  '/suppliers': PERMISSIONS.SUPPLIERS,
  '/products': PERMISSIONS.PRODUCTS,
  
  // Vendas
  '/opportunities': PERMISSIONS.OPPORTUNITIES,
  '/orders': PERMISSIONS.ORDERS,
  '/invoice': PERMISSIONS.INVOICES,
  '/receivables': PERMISSIONS.RECEIVABLES,
  
  // Pipeline
  '/pipeline': PERMISSIONS.PIPELINE,
  
  // Tarefas
  '/tarefas': PERMISSIONS.TASKS,
  '/minhas-tarefas': PERMISSIONS.TASKS,
  
  // Aprovações
  '/aprovacoes': PERMISSIONS.APPROVALS,
  
  // Usuários, Grupos e Permissões
  '/usuarios': PERMISSIONS.USERS,
  '/grupos': PERMISSIONS.TEAMS,
  '/permissoes': PERMISSIONS.PERMISSIONS,
  
  // Vendedores e Líderes
  '/vendedores': PERMISSIONS.SELLERS,
  '/lideres': PERMISSIONS.LEADER_BOARD, // Apenas usuários com role LeaderBoard no Keycloak
  
  // Configurações (requer múltiplas permissões)
  '/settings': [
    PERMISSIONS.CUSTOMER_GROUPS,
    PERMISSIONS.CUSTOMER_TAGS,
    PERMISSIONS.PRODUCT_GROUPS,
    PERMISSIONS.PRODUCT_TAGS,
    PERMISSIONS.PRICE_TAGS,
    PERMISSIONS.PAYMENT_TYPES,
    PERMISSIONS.PAYMENT_CONDITIONS,
    PERMISSIONS.RECEIVABLE_TYPES,
    PERMISSIONS.RECEIVABLE_HOLDERS,
    PERMISSIONS.RECEIVABLE_STATUS,
    PERMISSIONS.ADDRESS_TYPES,
    PERMISSIONS.CONTACT_TYPES,
    PERMISSIONS.LOSS_REASONS,
    PERMISSIONS.UNITIES,
    PERMISSIONS.CAMPAIGNS,
  ],
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
export function hasRoutePermission(pathname: string, userRoles: string[]): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[pathname]
  
  // Se a rota não está mapeada, permite acesso (rotas públicas)
  if (!requiredPermissions) {
    return true
  }
  
  // Se é uma string única
  if (typeof requiredPermissions === 'string') {
    return userRoles.includes(requiredPermissions)
  }
  
  // Se é um array, precisa ter pelo menos uma permissão
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some(permission => userRoles.includes(permission))
  }
  
  return false
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(permission: string, userRoles: string[]): boolean {
  return userRoles.includes(permission)
}

/**
 * Verifica se o usuário tem todas as permissões listadas
 */
export function hasAllPermissions(permissions: string[], userRoles: string[]): boolean {
  return permissions.every(permission => userRoles.includes(permission))
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões listadas
 */
export function hasAnyPermission(permissions: string[], userRoles: string[]): boolean {
  return permissions.some(permission => userRoles.includes(permission))
}
