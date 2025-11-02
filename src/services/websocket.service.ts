/**
 * WebSocket Service - Facilita o uso do WebSocket
 */

export type EntityType = 
  | 'customer'
  | 'supplier'
  | 'product'
  | 'seller'
  | 'unity'
  | 'productGroup'
  | 'priceTag'
  | 'opportunity'
  | 'pipeline'
  | 'team'
  | 'user'
  | 'invoice'

export type OperationType = 'created' | 'updated' | 'deleted'

export interface EntityChangeEvent {
  entity: string
  operation: OperationType
  id: number | string | null
  data?: any
}

/**
 * Gera o nome do evento WebSocket
 */
export function getEventName(entity: EntityType, operation: OperationType): string {
  return `${entity}:${operation}`
}

/**
 * Valida se é um evento de entidade válido
 */
export function isEntityEvent(eventName: string): boolean {
  return /^[a-z]+:(created|updated|deleted)$/.test(eventName)
}

/**
 * Extrai informações do nome do evento
 */
export function parseEventName(eventName: string): { entity: string; operation: OperationType } | null {
  const match = eventName.match(/^([a-z]+):(created|updated|deleted)$/)
  if (match) {
    return {
      entity: match[1],
      operation: match[2] as OperationType,
    }
  }
  return null
}
