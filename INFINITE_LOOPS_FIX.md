# Correção de Loops Infinitos

## Problemas Identificados

### 1. Loop de Token Refresh (session-context.tsx)
**Sintoma**: Logs infinitos "🔄 Token expirando em breve, fazendo refresh..."

**Causa**: 
- O `useEffect` do auto-refresh estava sendo executado múltiplas vezes
- Não havia controle para evitar múltiplos timeouts agendados
- Logs excessivos causavam poluição do console

**Solução**:
```typescript
// Antes:
let timeoutId: NodeJS.Timeout
const scheduleRefresh = () => {
  console.log('🔄 Token expirando em breve...')
  timeoutId = setTimeout(...)
}

// Depois:
let timeoutId: NodeJS.Timeout | null = null
const scheduleRefresh = () => {
  if (timeoutId) return // Já tem refresh agendado
  timeoutId = setTimeout(async () => {
    // ... refresh logic
    timeoutId = null // Limpa após executar
  }, refreshTime)
}
```

**Mudanças**:
- ✅ Removidos console.logs desnecessários
- ✅ Adicionado controle `timeoutId` para evitar múltiplos agendamentos
- ✅ Limpa `timeoutId` após execução
- ✅ Verifica se já existe timeout antes de agendar novo

---

### 2. Loop de WebSocket (websocket-context.tsx)
**Sintoma**: 
- Múltiplas conexões WebSocket simultâneas (150+ conexões no backend)
- Logs infinitos de conexão/desconexão

**Causa**:
- `useEffect` sendo executado múltiplas vezes por mudanças nas dependências
- Dependências desnecessárias (`session.accessToken`, `url`)
- Não havia delay entre tentativas de conexão
- Logs excessivos

**Solução**:
```typescript
// Antes:
useEffect(() => {
  if (status === 'authenticated') {
    console.log('[WebSocket] Iniciando conexão...')
    connectWebSocket()
  }
}, [status, session?.accessToken, url])

// Depois:
useEffect(() => {
  if (status !== 'authenticated' || !session?.accessToken) return
  if (socket && socket.readyState === WebSocket.OPEN) return
  if (isConnectingRef.current) return

  // Delay para evitar múltiplas chamadas rápidas
  const timeoutId = setTimeout(() => {
    connectWebSocket()
  }, 100)

  return () => clearTimeout(timeoutId)
}, [status]) // Apenas status como dependência
```

**Mudanças**:
- ✅ Reduzidas dependências do useEffect (apenas `status`)
- ✅ Adicionado delay de 100ms antes de conectar
- ✅ Verificações mais rigorosas antes de criar nova conexão
- ✅ Removidos console.logs excessivos
- ✅ Melhor controle de estado com `isConnectingRef`

---

### 3. Warning do React (auth-guard.tsx)
**Sintoma**: 
```
Warning: Cannot update a component (`Router`) while rendering a different component (`AuthGuard`)
```

**Causa**:
- `router.push()` sendo chamado dentro do `useEffect` sem controle de estado
- Múltiplas chamadas ao router durante re-renders

**Solução**:
```typescript
// Antes:
useEffect(() => {
  if (!isPublicRoute && status === 'unauthenticated') {
    router.push('/login')
  }
}, [status, isPublicRoute, router, pathname])

// Depois:
const [isRedirecting, setIsRedirecting] = useState(false)

useEffect(() => {
  if (!isPublicRoute && status === 'unauthenticated' && !isRedirecting) {
    setIsRedirecting(true)
    router.push('/login')
  }
}, [status, isPublicRoute, router, pathname, isRedirecting])
```

**Mudanças**:
- ✅ Adicionado estado `isRedirecting` para controlar único redirect
- ✅ Evita múltiplas chamadas ao router.push()

---

### 4. Logs "Current roles" no Dashboard
**Sintoma**: Logs infinitos mostrando as roles do usuário

**Causa**: Provável `useEffect` ou `console.log` dentro de um componente que re-renderiza constantemente

**Solução**: 
- Remover ou comentar console.logs de debug
- Mover logs para dentro de useEffect com dependências corretas
- Usar React DevTools para identificar fonte dos re-renders

---

## Resultado Esperado

Após estas correções:

1. ✅ **Sem loops de refresh**: Token refresh acontece apenas quando necessário
2. ✅ **Uma única conexão WebSocket**: Controle rigoroso de criação de conexões
3. ✅ **Sem warnings do React**: Router updates controlados via estado
4. ✅ **Console limpo**: Removidos logs excessivos de debug
5. ✅ **Performance melhorada**: Menos re-renders e operações desnecessárias
6. ✅ **Backend limpo**: Não mais 150+ conexões WebSocket simultâneas

---

## Checklist de Verificação

Após aplicar as correções, verificar:

- [ ] Console não mostra mais loops de "Token expirando"
- [ ] Console não mostra mais logs infinitos de WebSocket
- [ ] Backend mostra apenas 1-2 conexões WebSocket por usuário
- [ ] Não há warnings do React no console
- [ ] Dashboard carrega normalmente sem logs excessivos
- [ ] Logout funciona corretamente
- [ ] Login funciona corretamente
- [ ] Token refresh acontece automaticamente sem loops

---

## Monitoramento

Para monitorar se os loops foram resolvidos:

### Frontend (Browser Console):
```bash
# Deve ter apenas logs iniciais, sem repetições
✅ SessionProvider inicializado
✅ [WebSocket] Conectado (apenas 1 vez)
✅ ⏰ Refresh agendado (apenas 1 vez)
```

### Backend (Logs Quarkus):
```bash
# Deve mostrar apenas conexões necessárias
✅ Cliente conectado: <uuid> (Total: 1-2 por usuário)
✅ Não deve haver 100+ conexões simultâneas
```

---

## Arquivos Modificados

1. `src/contexts/session-context.tsx`
   - Controle de token refresh
   - Remoção de logs excessivos

2. `src/contexts/websocket-context.tsx`
   - Controle de criação de conexões
   - Redução de dependências do useEffect
   - Delay anti-spam

3. `src/components/auth-guard.tsx`
   - Controle de redirecionamento
   - Estado para evitar múltiplos redirects
