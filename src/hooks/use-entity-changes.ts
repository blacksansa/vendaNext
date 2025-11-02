"use client"

import { useEffect } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'

export type EntityOperation = 'created' | 'updated' | 'deleted'

export interface EntityChangeEvent {
  entity: string
  operation: EntityOperation
  id?: number | string
  data?: any
}

interface UseEntityChangesOptions {
  /**
   * Nome da entidade para escutar mudanças
   * Exemplo: 'customer', 'product', 'supplier'
   */
  entity: string
  
  /**
   * Callback quando houver mudança
   */
  onChanged: (event: EntityChangeEvent) => void
  
  /**
   * Operações para escutar (opcional)
   * Padrão: todas ['created', 'updated', 'deleted']
   */
  operations?: EntityOperation[]
  
  /**
   * Se deve estar ativo
   * Padrão: true
   */
  enabled?: boolean
}

/**
 * Hook para escutar mudanças em tempo real de uma entidade
 * 
 * @example
 * ```tsx
 * useEntityChanges({
 *   entity: 'customer',
 *   onChanged: (event) => {
 *     console.log('Cliente alterado:', event)
 *     refetchCustomers() // Atualiza lista
 *   }
 * })
 * ```
 */
export function useEntityChanges(options: UseEntityChangesOptions) {
  const { entity, onChanged, operations = ['created', 'updated', 'deleted'], enabled = true } = options
  const { on, off, isConnected } = useWebSocket()

  useEffect(() => {
    if (!enabled || !isConnected) return

    const handleChange = (data: any) => {
      // Determinar operação baseada no evento
      const operation = data.operation as EntityOperation
      
      if (operations.includes(operation)) {
        onChanged({
          entity,
          operation,
          id: data.id,
          data: data.payload,
        })
      }
    }

    // Eventos possíveis:
    // - entity:created
    // - entity:updated
    // - entity:deleted
    operations.forEach((op) => {
      const eventName = `${entity}:${op}`
      on(eventName, handleChange)
    })

    return () => {
      operations.forEach((op) => {
        const eventName = `${entity}:${op}`
        off(eventName, handleChange)
      })
    }
  }, [entity, operations, enabled, isConnected, on, off, onChanged])
}

/**
 * Hook para múltiplas entidades
 */
export function useMultipleEntityChanges(
  entities: string[],
  onChanged: (event: EntityChangeEvent) => void,
  enabled = true
) {
  entities.forEach((entity) => {
    useEntityChanges({ entity, onChanged, enabled })
  })
}
