"use client"

import { useEntityChanges } from '@/hooks/use-entity-changes'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'

/**
 * Componente que monitora mudanças em tempo real e invalida cache do React Query
 * 
 * Use este componente em páginas que precisam de atualização em tempo real
 */
export function RealtimeSync() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isConnected } = useWebSocket()

  // Mostrar status de conexão
  useEffect(() => {
    if (isConnected) {
      console.log('[RealtimeSync] WebSocket conectado - sincronização em tempo real ativa')
    } else {
      console.log('[RealtimeSync] WebSocket desconectado - modo offline')
    }
  }, [isConnected])

  // Clientes
  useEntityChanges({
    entity: 'customer',
    onChanged: (event) => {
      console.log('[RealtimeSync] Cliente alterado:', event)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      
      if (event.operation === 'created') {
        toast.success('Novo cliente adicionado')
      }
    },
  })

  // Fornecedores
  useEntityChanges({
    entity: 'supplier',
    onChanged: (event) => {
      console.log('[RealtimeSync] Fornecedor alterado:', event)
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  // Produtos
  useEntityChanges({
    entity: 'product',
    onChanged: (event) => {
      console.log('[RealtimeSync] Produto alterado:', event)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  // Vendedores
  useEntityChanges({
    entity: 'seller',
    onChanged: (event) => {
      console.log('[RealtimeSync] Vendedor alterado:', event)
      queryClient.invalidateQueries({ queryKey: ['sellers'] })
    },
  })

  // Oportunidades
  useEntityChanges({
    entity: 'opportunity',
    onChanged: (event) => {
      console.log('[RealtimeSync] Oportunidade alterada:', event)
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })

  // Grupos de produtos
  useEntityChanges({
    entity: 'productGroup',
    onChanged: (event) => {
      console.log('[RealtimeSync] Grupo de produto alterado:', event)
      queryClient.invalidateQueries({ queryKey: ['productGroups'] })
    },
  })

  // Etiquetas de preço
  useEntityChanges({
    entity: 'priceTag',
    onChanged: (event) => {
      console.log('[RealtimeSync] Etiqueta de preço alterada:', event)
      queryClient.invalidateQueries({ queryKey: ['priceTags'] })
    },
  })

  return null // Componente invisível
}
