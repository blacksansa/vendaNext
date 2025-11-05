# Correção de Loops Infinitos e Logs Excessivos

## Problemas Corrigidos

### 1. Loop Infinito de Token Refresh
**Problema:** O token estava sendo renovado constantemente, causando:
- Logs repetitivos no console
- Múltiplas requisições ao Keycloak
- Performance degradada

**Solução:** 
- Desabilitado o auto-refresh preventivo do token
- O refresh agora só acontece quando o token realmente expira (via interceptor HTTP)
- Adicionada verificação de token expirado para forçar logout

```typescript
// session-context.tsx
// Auto-refresh DESABILITADO - o refresh será feito via interceptor HTTP
useEffect(() => {
  if (status !== 'authenticated' || !session) return

  const now = Date.now()
  const timeUntilExpiry = session.expiresAt - now
  
  // Se já expirou, força logout
  if (timeUntilExpiry <= 0) {
    console.log('🔴 Token expirado, fazendo logout')
    signOut()
  }
}, [status, session?.expiresAt, signOut])
```

### 2. Warning de setState Durante Render no AuthGuard
**Problema:** `Warning: Cannot update a component (Router) while rendering a different component (AuthGuard)`

**Solução:**
- Removido o estado `isRedirecting` desnecessário
- Simplificado os useEffect para fazer redirect apenas quando necessário
- Usado `router.replace()` ao invés de `router.push()`
- Adicionado redirect automático de rotas públicas quando já autenticado

```typescript
// auth-guard.tsx
useEffect(() => {
  if (!isPublicRoute && status === 'unauthenticated') {
    router.replace('/login')
  }
}, [status, isPublicRoute, router])

useEffect(() => {
  if (isPublicRoute && status === 'authenticated') {
    router.replace('/') // Redireciona para home se já logado
  }
}, [status, isPublicRoute, router])
```

### 3. Múltiplas Conexões WebSocket
**Problema:** WebSocket conectando e desconectando centenas de vezes, causando:
- Logs excessivos no backend
- Sobrecarga de conexões
- Performance degradada

**Solução:**
- Aumentado o delay de conexão de 100ms para 500ms
- Removido o fechamento do socket no cleanup do useEffect
- Adicionada limpeza do socket quando desautenticar
- Dependência do useEffect mudada para apenas `status` (não mais `session.accessToken`)
- Removidos logs excessivos de WebSocket

```typescript
// websocket-context.tsx
useEffect(() => {
  if (status !== 'authenticated' || !session?.accessToken) {
    // Limpar socket existente se desautenticou
    if (socket) {
      socket.close()
      setSocket(null)
      setIsConnected(false)
      isConnectingRef.current = false
    }
    return
  }

  // Evitar múltiplas conexões
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  if (isConnectingRef.current) {
    return
  }

  const timeoutId = setTimeout(() => {
    connectWebSocket()
  }, 500) // Aumentado para 500ms

  return () => {
    clearTimeout(timeoutId)
    // NÃO fecha o socket no cleanup
  }
}, [status]) // Apenas status
```

### 4. Logs Excessivos Removidos
- Removido log "🔄 Token expirando em breve" (causava spam)
- Removido log "[WebSocket] Conexão fechada"
- Removido log "[WebSocket] Evento recebido"
- Mantidos apenas logs críticos de erro

## Comportamento Esperado Agora

### Autenticação
1. **Login:**
   - Usuário faz login em `/login`
   - Token é salvo no localStorage
   - Redireciona para `/` (home)
   - WebSocket conecta UMA vez

2. **Token Refresh:**
   - Não há refresh automático preventivo
   - Refresh acontece apenas quando necessário (via interceptor HTTP)
   - Se token expirar completamente, faz logout

3. **Logout:**
   - Usuário clica em logout
   - Token é removido do localStorage
   - WebSocket desconecta
   - Redireciona para `/login`

### Navegação
1. **Usuário não autenticado:**
   - Tenta acessar rota protegida → Redireciona para `/login`
   - Acessa `/login` → Mostra página de login

2. **Usuário autenticado:**
   - Tenta acessar `/login` → Redireciona para `/` (home)
   - Acessa qualquer rota protegida → Mostra o conteúdo

### WebSocket
1. **Conexão:**
   - Conecta APENAS quando autenticado
   - UMA conexão por sessão
   - Não reconecta automaticamente em caso de erro (evita loop)

2. **Desconexão:**
   - Desconecta ao fazer logout
   - Desconecta quando token expira

## Próximos Passos Recomendados

1. **Monitorar logs:**
   - Verificar se não há mais loops
   - Verificar se WebSocket conecta apenas uma vez
   - Verificar se redirects funcionam corretamente

2. **Testar cenários:**
   - Login → deve redirecionar para `/`
   - Logout → deve redirecionar para `/login`
   - Token expirado → deve fazer logout automático
   - Tentar acessar `/login` quando logado → deve redirecionar para `/`

3. **Se necessário:**
   - Ajustar tempo de expiração do token no Keycloak
   - Implementar refresh token automático (se necessário no futuro)
   - Adicionar retry logic no WebSocket (com backoff exponencial)
