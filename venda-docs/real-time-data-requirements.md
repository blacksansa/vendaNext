# Real-time Data and API Function Requirements

This document outlines the necessary API functions to replace the mock data in the application and the requirement for real-time data updates.

## Real-time Data Requirement

All data presented in the application must be updated in **real-time**. This means that when a change occurs in the backend, the frontend should reflect this change immediately without the need for a page reload. This can be achieved through technologies like **WebSockets** or **Server-Sent Events (SSE)**. The backend should push updates to the frontend whenever data changes.

## API Functions

Here is a list of functions that need to be created to fetch data from a server and populate the pages.

### General API Functions

These are general functions that will be used across multiple pages to interact with your backend.

- **`fetchData(endpoint, options)`**: A generic function to handle API requests (GET, POST, PUT, DELETE) to your server. This would be used by most of the other functions.
- **`handleError(error)`**: A utility function to handle API errors gracefully.

### `analytics/page.tsx`

- **`getAnalyticsOverview(period)`**: Fetches the main analytics metrics like monthly revenue, customer status, sales funnel, and top performers.
- **`getRevenueTrend(period)`**: Fetches data for the revenue trend chart.
- **`getCustomerDistribution(period)`**: Fetches data for the customer distribution pie chart.
- **`getSalesFunnel(period)`**: Fetches data for the sales funnel.
- **`getTopPerformers(period)`**: Fetches the list of top-performing sellers.

### `customers/page.tsx`

- **`getCustomers(filters)`**: Fetches a paginated and filtered list of customers.
- **`createCustomer(customerData)`**: Creates a new customer.
- **`updateCustomer(customerId, customerData)`**: Updates an existing customer.
- **`deleteCustomer(customerId)`**: Deletes a customer.

### `grupos/page.tsx`

- **`getGroups()`**: Fetches all sales groups.
- **`createGroup(groupData)`**: Creates a new sales group.
- **`updateGroup(groupId, groupData)`**: Updates a sales group.
- **`deleteGroup(groupId)`**: Deletes a sales group.
- **`addMemberToGroup(groupId, userId)`**: Adds a seller to a group.
- **`removeMemberFromGroup(groupId, userId)`**: Removes a seller from a group.

### `lideres/page.tsx`

- **`getLeaderDashboard(leaderId, period)`**: Fetches all data for the leader's dashboard, including led groups, seller performance, temporal data, status distribution, recent activities, and next actions.

### `pipeline/page.tsx`

- **`getPipelineStages()`**: Fetches the stages of the sales pipeline.
- **`createPipelineStage(stageData)`**: Creates a new stage in the pipeline.
- **`getDeals(stageId)`**: Fetches all deals for a given stage.
- **`createDeal(dealData)`**: Creates a new deal.
- **`updateDeal(dealId, dealData)`**: Updates a deal.
- **`deleteDeal(dealId)`**: Deletes a deal.

### `relatorios/page.tsx`

- **`getAvailableReports()`**: Fetches the list of available reports.
- **`generateReport(reportId, period)`**: Generates and returns a specific report.
- **`getReportMetrics(period)`**: Fetches the general metrics for the reports page.

### `tarefas/page.tsx`

- **`getTasks(filters)`**: Fetches a list of tasks with filters for responsible person and priority.
- **`createTask(taskData)`**: Creates a new task.
- **`updateTask(taskId, taskData)`**: Updates a task.
- **`deleteTask(taskId)`**: Deletes a task.
- **`getTaskMetrics()`**: Fetches the metrics for the tasks page.
- **`getTaskResponsibles()`**: Fetches the list of people and groups responsible for tasks.

### `usuarios/page.tsx`

- **`getUsers()`**: Fetches all users.
- **`createUser(userData)`**: Creates a new user.
- **`updateUser(userId, userData)`**: Updates a user.
- **`deleteUser(userId)`**: Deletes a user.
- **`resetPassword(userId)`**: Sends a password reset link to the user.
- **`getAuditLogs()`**: Fetches the audit logs.

### `vendedores/page.tsx`

- **`getSellers()`**: Fetches all sellers.
- **`createSeller(sellerData)`**: Creates a new seller.
- **`updateSeller(sellerId, sellerData)`**: Updates a seller.
- **`deleteSeller(sellerId)`**: Deletes a seller.
- **`getSellerGroups()`**: Fetches all seller groups.
- **`createSellerGroup(groupData)`**: Creates a new seller group.
- **`getSellerPerformance(sellerId, period)`**: Fetches the performance data for a specific seller.
- **`getSellersRanking(period)`**: Fetches the ranking of sellers.
