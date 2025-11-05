
export const mockGroups = [
  {
    id: 'admin',
    name: 'Administradores',
    permissions: [
      'manageDashboard',
      'manageCustomers',
      'manageSellers',
      'manageTeams',
      'managePipelines',
      'manageAnalytics',
      'manageTasks',
      'manageOrders',
      'manageApprovals',
      'manageRegistrations',
      'manageReports',
      'manageUsers',
    ],
  },
  {
    id: 'manager',
    name: 'Gerentes',
    permissions: [
      'manageDashboard',
      'manageCustomers',
      'manageSellers',
      'manageTeams',
      'managePipelines',
      'manageAnalytics',
      'manageTasks',
    ],
  },
  {
    id: 'seller',
    name: 'Vendedores',
    permissions: ['manageCustomers', 'manageTasks'],
  },
];
