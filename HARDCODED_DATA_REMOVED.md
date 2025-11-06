# Remoção de Dados Hardcoded - Pipeline

## Mudanças Aplicadas

### 1. Pipeline Stages (Estágios do Pipeline)
**Antes:** Array hardcoded com 4 estágios fixos e valores estáticos
```typescript
const pipelineStages = [
  { id: 1, name: "Leads / Captura", deals: 15, value: 0 },
  { id: 2, name: "Nutrição / Pré-venda", deals: 10, value: 0 },
  // ...
]
```

**Depois:** Cálculo dinâmico baseado nas oportunidades reais
```typescript
function calculateStages(opportunities: any[]) {
  // Calcula deals e value dinamicamente para cada stage
  // Retorna apenas stages que têm oportunidades
}
```

### 2. Priority (Prioridade)
**Antes:** Todos os deals tinham prioridade hardcoded como "media"
```typescript
priority: "media"
```

**Depois:** Prioridade calculada dinamicamente baseada em valor e dias sem contato
```typescript
function calculatePriority(opp: any): string {
  const value = // calcula valor total
  const daysSinceContact = // calcula dias
  
  if (value > 100000 || daysSinceContact > 7) return "alta"
  if (value > 50000 || daysSinceContact > 3) return "media"
  return "baixa"
}
```

### 3. Next Action (Próxima Ação)
**Antes:** Todos os deals tinham "Enviar proposta" hardcoded
```typescript
nextAction: "Enviar proposta"
```

**Depois:** Ação sugerida baseada no estágio atual
```typescript
function getNextActionByStage(stageName?: string): string {
  return {
    "Leads / Captura": "Qualificar lead",
    "Nutrição / Pré-venda": "Continuar nutrição",
    "Oportunidade / Conversão": "Enviar proposta",
    "Cliente / Pós-venda": "Acompanhar satisfação",
  }[stageName] || "Definir próxima ação"
}
```

### 4. Interactions (Interações)
**Antes:** Array vazio hardcoded
```typescript
interactions: []
```

**Depois:** Busca de dados reais do backend
```typescript
interactions: opp.interactions || []
```

### 5. Probability (Probabilidade)
**Antes:** Apenas baseado no status
```typescript
probability: opp.status === "WON" ? 100 : opp.status === "LOST" ? 0 : 50
```

**Depois:** Usa campo probability do backend quando disponível
```typescript
probability: opp.status === "WON" ? 100 : opp.status === "LOST" ? 0 : (opp.probability || 50)
```

## Benefícios

1. **Dados Reais**: Todas as métricas refletem o estado real do pipeline
2. **Escalável**: Funciona com qualquer número de estágios
3. **Dinâmico**: Atualiza automaticamente quando oportunidades mudam
4. **Inteligente**: Prioridades calculadas automaticamente
5. **Manutenível**: Não precisa atualizar código para mudar valores

## Páginas Verificadas

- ✅ `/pipeline` - Dados dinâmicos implementados
- ✅ `/customers` - Já estava usando dados dinâmicos
- ✅ Leads, Oportunidades, Cliente/Pós-venda - Todos calculados dinamicamente do pipeline

