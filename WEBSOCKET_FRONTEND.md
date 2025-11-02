# WebSocket - Implementação Frontend (Next.js)

## 📋 Visão Geral

Implementação de WebSocket nativo para sincronização em tempo real de dados no frontend Next.js com o backend Quarkus.

## 🚀 Componentes Implementados

### 1. `WebSocketContext` (`src/contexts/websocket-context.tsx`)

Contexto React que gerencia a conexão WebSocket.

**Características:**
- Reconexão automática com backoff exponencial
- Gerenciamento de eventos
- Estado de conexão
- Suporte a múltiplos listeners por evento

**Uso básico:**

```tsx
import { useWebSocket } from '@/contexts/websocket-context'

function MyComponent() {
  const { isConnected, on, off, send } = useWebSocket()

  useEffect(() => {
    const handleEvent = (data) => {
      console.log('Evento recebido:', data)
    }

    on('customer:created', handleEvent)

    return () => {
      off('customer:created', handleEvent)
    }
  }, [])

  return <div>Status: {isConnected ? 'Conectado' : 'Desconectado'}</div>
}
```

### 2. `useEntityChanges` Hook (`src/hooks/use-entity-changes.ts`)

Hook para escutar mudanças em entidades específicas.

**Uso:**

```tsx
import { useEntityChanges } from '@/hooks/use-entity-changes'
import { useQueryClient } from '@tanstack/react-query'

function CustomerList() {
  const queryClient = useQueryClient()

  // Escutar mudanças em clientes
  useEntityChanges({
    entity: 'customer',
    onChanged: (event) => {
      console.log('Cliente alterado:', event)
      
      // Atualizar cache do React Query
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      
      // Ou fazer ação específica
      if (event.operation === 'created') {
        toast({ title: 'Novo cliente adicionado!' })
      }
    },
    operations: ['created', 'updated', 'deleted'], // Opcional
    enabled: true, // Opcional
  })

  return <div>Lista de clientes...</div>
}
```

**Múltiplas entidades:**

```tsx
import { useMultipleEntityChanges } from '@/hooks/use-entity-changes'

function Dashboard() {
  useMultipleEntityChanges(
    ['customer', 'product', 'supplier'],
    (event) => {
      console.log(`${event.entity} foi ${event.operation}`)
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: [event.entity + 's'] })
    }
  )

  return <div>Dashboard...</div>
}
```

### 3. `RealtimeSync` Component (`src/components/realtime-sync.tsx`)

Componente global que automaticamente sincroniza todas as entidades.

**Já está integrado no `providers.tsx`** - não precisa fazer nada!

Este componente:
- Monitora mudanças em todas as entidades
- Invalida automaticamente o cache do React Query
- Mostra notificações toast para eventos importantes
- Funciona em toda a aplicação

### 4. `websocket.service.ts` (`src/services/websocket.service.ts`)

Utilitários e tipos para trabalhar com WebSocket.

```tsx
import { getEventName, parseEventName } from '@/services/websocket.service'

const eventName = getEventName('customer', 'created') // 'customer:created'
const parsed = parseEventName('customer:created') // { entity: 'customer', operation: 'created' }
```

## 📦 Estrutura de Eventos

O backend envia eventos no formato:

```
Mensagem 1: "customer:created"
Mensagem 2: {"entity":"customer","operation":"created","id":"123","data":{...}}
```

O frontend processa automaticamente e chama os callbacks registrados.

## 🔧 Configuração

### Variáveis de Ambiente

Crie/edite `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

O WebSocket irá automaticamente converter `http` para `ws` e adicionar `/ws` no path.

### Adicionar em Novas Páginas

A sincronização já está ativa globalmente via `RealtimeSync`, mas você pode adicionar lógica específica:

```tsx
"use client"

import { useEntityChanges } from '@/hooks/use-entity-changes'

export default function MyPage() {
  // Adicionar lógica específica para esta página
  useEntityChanges({
    entity: 'customer',
    onChanged: (event) => {
      // Lógica específica desta página
      if (event.operation === 'created') {
        // Fazer algo especial quando um cliente é criado
      }
    }
  })

  return <div>Minha página</div>
}
```

## 🎯 Entidades Suportadas

- `customer` - Clientes
- `supplier` - Fornecedores
- `product` - Produtos
- `seller` - Vendedores
- `unity` - Unidades
- `productGroup` - Grupos de Produtos
- `priceTag` - Etiquetas de Preço
- `opportunity` - Oportunidades
- `pipeline` - Pipelines
- `team` - Times
- `user` - Usuários
- `invoice` - Faturas

## 🐛 Debug

Para ver logs do WebSocket no console:

```tsx
import { useWebSocket } from '@/contexts/websocket-context'

function DebugComponent() {
  const { isConnected, socket } = useWebSocket()
  
  useEffect(() => {
    console.log('WebSocket status:', isConnected)
    console.log('WebSocket instance:', socket)
  }, [isConnected, socket])
  
  return null
}
```

## ✅ Checklist de Implementação

- [x] Contexto WebSocket com reconexão automática
- [x] Hook `useEntityChanges` para escutar mudanças
- [x] Hook `useMultipleEntityChanges` para múltiplas entidades
- [x] Componente `RealtimeSync` global
- [x] Integração com React Query
- [x] Integração com Toast notifications
- [x] Service com utilitários
- [x] Tipos TypeScript
- [x] Documentação

## 🔄 Como Funciona

1. **Conexão**: Ao carregar a aplicação, o `WebSocketProvider` conecta automaticamente
2. **Eventos**: Backend detecta mudanças e envia eventos via WebSocket
3. **Processamento**: Frontend recebe eventos e chama callbacks registrados
4. **Cache**: React Query invalida automaticamente as queries afetadas
5. **UI**: Componentes re-renderizam com dados atualizados
6. **Notificações**: Toast mostra eventos importantes para o usuário

## 📝 Exemplo Completo

```tsx
"use client"

import { useEntityChanges } from '@/hooks/use-entity-changes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { customerService } from '@/services/customer.service'
import { useToast } from '@/hooks/use-toast'

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Buscar clientes
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  })

  // Escutar mudanças em tempo real
  useEntityChanges({
    entity: 'customer',
    onChanged: (event) => {
      // Invalidar cache para buscar dados atualizados
      queryClient.invalidateQueries({ queryKey: ['customers'] })

      // Mostrar notificação
      const messages = {
        created: 'Novo cliente adicionado',
        updated: 'Cliente atualizado',
        deleted: 'Cliente removido',
      }

      toast({
        title: messages[event.operation],
        description: `Cliente ID: ${event.id}`,
      })
    },
  })

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Clientes ({customers?.length})</h1>
      {customers?.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}
```

## 🚨 Troubleshooting

### WebSocket não conecta

1. Verifique se o backend está rodando em `http://localhost:8080`
2. Verifique a variável `NEXT_PUBLIC_API_URL` no `.env.local`
3. Verifique o console do navegador para erros
4. Verifique se o CORS está configurado no backend

### Eventos não são recebidos

1. Verifique se o backend está enviando eventos (logs do backend)
2. Verifique se o `useEntityChanges` está registrado corretamente
3. Verifique se o componente não está sendo desmontado prematuramente
4. Use `console.log` no callback `onChanged` para debug

### Cache não atualiza

1. Verifique se está usando a mesma `queryKey` na query e no `invalidateQueries`
2. Verifique se o React Query está configurado corretamente
3. Tente usar `refetch` ao invés de `invalidateQueries` para debug
