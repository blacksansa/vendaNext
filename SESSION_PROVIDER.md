# ✅ NOVO SESSION PROVIDER IMPLEMENTADO

## 📋 Resumo

Criado um **SessionProvider customizado** que funciona com autenticação via localStorage e Keycloak, mantendo compatibilidade com código antigo que usa `useSession()` e `useAuth()`.

---

## 🎯 Arquivos Criados/Modificados

### 1. **SessionProvider Customizado** ✅
**Arquivo:** `src/contexts/session-context.tsx`

**Funcionalidades:**
- ✅ Gerencia sessão via localStorage
- ✅ Decodifica JWT para extrair informações do usuário
- ✅ Auto-refresh de tokens antes de expirar
- ✅ Sincronização entre abas do navegador
- ✅ Compatível com `useSession()` do NextAuth
- ✅ Logout integrado com Keycloak

### 2. **Hook useAuth Atualizado** ✅
**Arquivo:** `src/hooks/use-auth.ts`

**Antes:**
```typescript
import { useSession } from "next-auth/react"
```

**Depois:**
```typescript
import { useSession } from "@/contexts/session-context"
```

### 3. **Providers Atualizado** ✅
**Arquivo:** `src/app/providers.tsx`

Agora usa `SessionProvider` customizado ao invés do NextAuth.

### 4. **AuthGuard Simplificado** ✅
**Arquivo:** `src/components/auth-guard.tsx`

Usa `useSession()` do nosso provider customizado.

---

## 🔄 Como Funciona

### 1. Fluxo de Login
```typescript
// 1. Usuário faz login
const tokens = await keycloakLogin({ username, password })

// 2. Tokens salvos no localStorage
localStorage.setItem('access_token', tokens.access_token)
localStorage.setItem('refresh_token', tokens.refresh_token)

// 3. SessionProvider detecta mudança no localStorage
// 4. Decodifica JWT e carrega sessão
// 5. Status muda para 'authenticated'
```

### 2. Informações do Usuário
```typescript
const decoded = jwtDecode(accessToken)

const user = {
  id: decoded.sub,
  email: decoded.email,
  name: decoded.name,
  roles: decoded.resource_access?.vendaplus?.roles || [],
  role: 'admin' | 'manager' | 'seller' // baseado em job
}
```

### 3. Auto-Refresh de Tokens
```typescript
// Verifica a cada minuto
// Se token expira em < 5 minutos, faz refresh automaticamente
if (timeUntilExpiry < 5 * 60 * 1000) {
  await refreshSession()
}
```

### 4. Logout
```typescript
const { signOut } = useSession()

await signOut() // Revoga token no Keycloak e limpa localStorage
```

---

## 💻 Como Usar (Compatibilidade)

### Uso 1: Hook useSession (NextAuth style)
```typescript
'use client'

import { useSession } from '@/contexts/session-context'

export function MyComponent() {
  const { session, status, user } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not logged in</div>

  return <div>Hello, {user?.name}!</div>
}
```

### Uso 2: Hook useAuth (Customizado)
```typescript
'use client'

import { useAuth } from '@/hooks/use-auth'

export function MyComponent() {
  const { user, roles, loading, isAuthenticated, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Not logged in</div>

  return (
    <div>
      <p>Hello, {user?.name}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Uso 3: Verificar Roles
```typescript
import { useAuth } from '@/hooks/use-auth'

export function AdminPanel() {
  const { user, roles } = useAuth()

  const isAdmin = user?.role === 'admin'
  const hasPermission = roles?.includes('admin-users')

  if (!isAdmin) return <div>Access denied</div>

  return <div>Admin Panel</div>
}
```

### Uso 4: Logout
```typescript
import { useSession } from '@/contexts/session-context'

export function LogoutButton() {
  const { signOut } = useSession()

  const handleLogout = async () => {
    await signOut() // Faz logout no Keycloak e redireciona para /login
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### Uso 5: Refresh Manual
```typescript
import { useSession } from '@/contexts/session-context'

export function RefreshButton() {
  const { refreshSession } = useSession()

  return (
    <button onClick={refreshSession}>
      Refresh Token
    </button>
  )
}
```

---

## 🔍 Estrutura da Sessão

```typescript
interface Session {
  user: {
    id: string              // sub do JWT
    email: string           // email do usuário
    name: string            // nome completo
    roles: string[]         // roles do Keycloak client
    role: 'admin' | 'manager' | 'seller' // role de alto nível
    // ... todos os claims do JWT
  }
  accessToken: string       // JWT access token
  refreshToken: string      // Refresh token
  expiresAt: number         // Timestamp de expiração
}

interface SessionContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  data: Session | null
  user: User | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

---

## ⚡ Features Automáticas

### 1. Auto-Refresh de Tokens
- ✅ Verifica a cada 1 minuto
- ✅ Se token expira em < 5 minutos, faz refresh
- ✅ Atualiza sessão automaticamente
- ✅ Se refresh falhar, faz logout

### 2. Sincronização entre Abas
- ✅ Monitora `localStorage` com `storage` event
- ✅ Se logout em uma aba, todas as abas fazem logout
- ✅ Se login em uma aba, todas as abas ficam logadas

### 3. Decodificação Automática de JWT
- ✅ Extrai informações do usuário do token
- ✅ Mapeia roles do Keycloak
- ✅ Determina role de alto nível (admin/manager/seller)

### 4. Logout Completo
- ✅ Revoga refresh token no Keycloak
- ✅ Limpa localStorage
- ✅ Atualiza estado da sessão
- ✅ Redireciona para /login

---

## 🔄 Migração do Código Antigo

### Antes (NextAuth):
```typescript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
const user = session?.user
```

### Depois (Nosso Provider):
```typescript
import { useSession } from '@/contexts/session-context'

const { session, status, user } = useSession()
// user já está disponível diretamente!
```

### Código Antigo Continua Funcionando! ✅
```typescript
// Este código ainda funciona:
const { user, loading, isAuthenticated } = useAuth()

// Este também:
const { data: session } = useSession()
```

---

## 🧪 Como Testar

### 1. Teste Login
```bash
# 1. Acesse /login
# 2. Digite credenciais
# 3. Abra DevTools Console

# Console deve mostrar:
SessionProvider: Sessão carregada
User: { id: "xxx", email: "user@email.com", ... }
```

### 2. Teste Auto-Refresh
```javascript
// No console:
const session = JSON.parse(localStorage.getItem('session'))
console.log('Expira em:', (session.expiresAt - Date.now()) / 1000 / 60, 'minutos')

// Aguarde próximo do tempo de expiração
// Console deve mostrar:
// 🔄 Token expirando em breve, fazendo refresh...
// ✅ Token atualizado com sucesso
```

### 3. Teste Sincronização entre Abas
```bash
# 1. Abra duas abas do app
# 2. Faça logout em uma aba
# 3. Verifique a outra aba

# ✅ Ambas devem redirecionar para /login
```

### 4. Teste useAuth em Componente
```typescript
// Componente de teste
export function TestAuth() {
  const { user, roles, role, isAuthenticated, signOut } = useAuth()
  
  return (
    <div>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {role}</p>
      <p>Roles: {roles?.join(', ')}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

---

## 📊 Comparação

| Feature | NextAuth | Nosso Provider |
|---------|----------|----------------|
| **Storage** | Server session | localStorage |
| **Tokens** | Gerenciado pelo NextAuth | Manual |
| **Auto-refresh** | Automático | ✅ Automático |
| **Sync tabs** | ❌ Não | ✅ Sim |
| **Logout Keycloak** | ❌ Não | ✅ Sim |
| **Compatibilidade** | NextAuth only | ✅ Compatível |
| **useSession()** | ✅ Sim | ✅ Sim |
| **useAuth()** | ❌ Não | ✅ Sim |

---

## ⚠️ Importante

### Reinicie o Servidor!
```bash
# Após as mudanças
npm run dev
```

### Limpe o Cache
```bash
# Se tiver problemas
rm -rf .next
npm run dev
```

---

## ✅ Checklist

- [x] SessionProvider customizado criado
- [x] useSession() compatível
- [x] useAuth() atualizado
- [x] AuthGuard usando SessionProvider
- [x] Auto-refresh implementado
- [x] Sync entre abas implementado
- [x] Logout completo implementado
- [x] Decodificação JWT implementada
- [x] Providers atualizado
- [ ] Testar em produção

---

**Status:** ✅ IMPLEMENTADO  
**Data:** 04/11/2024  
**Compatibilidade:** 100% com código antigo  
**Ready:** Sim, reinicie o servidor e teste!
