# Data Models for API Functions

This document outlines the data models for each function required to replace the mock data in the application.

## General Models

These are general models that can be used across multiple pages.

**User**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string | null",
  "role": "string", // e.g., 'admin', 'manager', 'vendedor', 'viewer'
  "status": "string", // e.g., 'active', 'inactive'
  "lastLogin": "string", // ISO 8601 date-time
  "permissions": "string[]"
}
```

**Group**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "leaderId": "string",
  "members": "User[]",
  "monthlyGoal": "number",
  "monthlySales": "number",
  "status": "string" // e.g., 'active', 'inactive'
}
```

## `analytics/page.tsx`

**AnalyticsOverview**
```json
{
  "monthlyRevenue": {
    "month": "string",
    "revenue": "number",
    "customers": "number"
  }[],
  "customerStatus": {
    "name": "string",
    "value": "number",
    "color": "string"
  }[],
  "salesFunnel": {
    "stage": "string",
    "count": "number",
    "conversion": "number"
  }[],
  "topPerformers": {
    "name": "string",
    "deals": "number",
    "revenue": "number",
    "growth": "number"
  }[]
}
```

## `customers/page.tsx`

**Customer**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "company": "string",
  "status": "string", // e.g., 'Active', 'Lead', 'Prospect'
  "value": "number",
  "lastContact": "string", // ISO 8601 date
  "avatar": "string"
}
```

## `grupos/page.tsx`

**Group** (See General Models)

**Seller** (Simplified for this context)
```json
{
  "name": "string",
  "sales": "number",
  "status": "string"
}
```

## `lideres/page.tsx`

**LeaderDashboard**
```json
{
  "ledGroups": {
    "id": "string",
    "name": "string",
    "sellers": "number",
    "sales": "number",
    "goal": "number",
    "growth": "number",
    "status": "string",
    "color": "string",
    "activeSellers": "number",
    "averageTicket": "number",
    "conversionRate": "number"
  }[],
  "sellerPerformance": {
    "name": "string",
    "sales": "number",
    "goal": "number",
    "performance": "number",
    "status": "string"
  }[],
  "temporalData": {
    "month": "string",
    "sales": "number",
    "goal": "number",
    "sellers": "number"
  }[],
  "statusDistribution": {
    "name": "string",
    "value": "number",
    "color": "string"
  }[],
  "recentActivities": {
    "id": "string",
    "type": "string",
    "seller": "string",
    "description": "string",
    "time": "string"
  }[],
  "nextActions": {
    "id": "string",
    "action": "string",
    "priority": "string",
    "deadline": "string"
  }[]
}
```

## `pipeline/page.tsx`

**PipelineStage**
```json
{
  "id": "string",
  "name": "string",
  "color": "string",
  "deals": "number",
  "value": "number"
}
```

**Deal**
```json
{
  "id": "string",
  "title": "string",
  "value": "number",
  "probability": "number",
  "stageId": "string",
  "client": "string",
  "company": "string",
  "email": "string",
  "phone": "string",
  "expectedCloseDate": "string", // ISO 8601 date
  "lastActivityDate": "string", // ISO 8601 date
  "notes": "string"
}
```

## `relatorios/page.tsx`

**AvailableReport**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "type": "string",
  "lastUpdate": "string", // ISO 8601 date-time
  "status": "string" // e.g., 'Available', 'Processing'
}
```

**ReportMetrics**
```json
{
  "sales": {
    "totalMonth": "number",
    "growth": "number",
    "goalMonth": "number",
    "averageTicket": "number"
  },
  "team": {
    "totalSellers": "number",
    "activeSellers": "number",
    "averagePerformance": "number",
    "bestSeller": "string"
  },
  "customers": {
    "totalCustomers": "number",
    "newCustomers": "number",
    "activeCustomers": "number",
    "retentionRate": "number"
  },
  "processes": {
    "leadsGenerated": "number",
    "conversionRate": "number",
    "averageClosingTime": "number", // in days
    "openOpportunities": "number"
  }
}
```

## `tarefas/page.tsx`

**Task**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "responsible": "string",
  "responsibleType": "string", // 'group' or 'seller'
  "priority": "string", // 'High', 'Medium', 'Low'
  "deadline": "string", // ISO 8601 date
  "createdAt": "string", // ISO 8601 date-time
  "estimatedTime": "string", // e.g., '4h'
  "tags": "string[]",
  "progress": "number | null", // for tasks in progress
  "completedAt": "string | null", // ISO 8601 date-time
  "timeSpent": "string | null" // e.g., '12h'
}
```

**TaskMetrics**
```json
{
  "totalTasks": "number",
  "pending": "number",
  "inProgress": "number",
  "completed": "number",
  "overdue": "number",
  "productivity": "number",
  "averageTime": "number" // in days
}
```

**TaskResponsible**
```json
{
  "id": "string",
  "name": "string",
  "type": "string", // 'group' or 'seller'
  "tasks": "number",
  "completed": "number"
}
```

## `usuarios/page.tsx`

**User** (See General Models)

**Role**
```json
{
  "value": "string",
  "label": "string",
  "color": "string"
}
```

**Permission**
```json
{
  "id": "string",
  "label": "string",
  "description": "string"
}
```

**AuditLog**
```json
{
  "action": "string",
  "user": "string",
  "time": "string", // ISO 8601 date-time
  "type": "string" // 'success', 'info', 'warning', 'error'
}
```

## `vendedores/page.tsx`

**Seller**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "position": "string",
  "region": "string",
  "status": "string", // 'active' or 'inactive'
  "sales": "number",
  "goal": "number",
  "hireDate": "string", // ISO 8601 date
  "previousMonthSales": "number",
  "activeCustomers": "number",
  "averageTicket": "number",
  "conversionRate": "number",
  "groupId": "string | null"
}
```

**SellerGroup**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "administratorId": "string",
  "sellerIds": "string[]",
  "groupGoal": "number",
  "color": "string"
}
```

**SellerPerformance**
```json
{
  "month": "string",
  "sales": "number",
  "goal": "number"
}
```

**SellerRanking**
```json
{
  "name": "string",
  "sales": "number"
}
```
