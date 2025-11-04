# ✅ AUTENTICAÇÃO DIRETA COM KEYCLOAK VIA HTTP

## 📋 Resumo

Implementada autenticação direta com Keycloak usando Resource Owner Password Credentials (ROPC) via HTTP, obtendo tokens diretamente sem necessidade de redirect.

---

## 🔑 Como Funciona

### Fluxo de Autenticação

1. **Login:**
   - Usuário digita email e senha
   - Frontend envia POST direto para Keycloak
   - Keycloak retorna: `access_token`, `refresh_token`, `id_token`
   - Tokens são salvos no `localStorage`

2. **Refresh Token:**
   - Quando `access_token` expira
   - Frontend usa `refresh_token` para obter novos tokens
   - Processo automático e transparente

3. **Logout:**
   - Frontend revoga o `refresh_token` no Keycloak
   - Limpa tokens do `localStorage`

---

## 📂 Arquivos Criados

### 1. **Serviço de Autenticação Keycloak**
**Arquivo:** `src/lib/keycloak-auth.ts`

**Funções:**
```typescript
// Login direto com username/password
keycloakLogin({ username, password }) 
  → Returns: { access_token, refresh_token, ... }

// Atualizar access token
keycloakRefreshToken({ refreshToken })
  → Returns: { access_token, refresh_token, ... }

// Logout
keycloakLogout(refreshToken)
  → Revokes token
```

### 2. **Página de Login Atualizada**
**Arquivo:** `src/app/login/page.tsx`

**Mudanças:**
- ✅ Removida dependência do NextAuth
- ✅ Login direto com Keycloak
- ✅ Tokens salvos no localStorage
- ✅ Redirecionamento após login bem-sucedido

### 3. **Variáveis de Ambiente**
**Arquivo:** `.env.example`

Variáveis necessárias:
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=venda-plus
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=venda-plus-web
NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET=your-secret
```

---

## 🔐 Endpoint do Keycloak

### URL do Token
```
POST {KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token
```

### Parâmetros (form-urlencoded)

#### Login (Password Grant)
```
client_id: venda-plus-web
client_secret: xxxxxx
grant_type: password
username: user@email.com
password: user-password
scope: openid profile email
```

#### Refresh Token
```
client_id: venda-plus-web
client_secret: xxxxxx
grant_type: refresh_token
refresh_token: xxxxxx
```

#### Logout
```
POST {KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/logout

client_id: venda-plus-web
client_secret: xxxxxx
refresh_token: xxxxxx
```

---

## 💾 Armazenamento de Tokens

### LocalStorage
```typescript
localStorage.setItem("access_token", tokens.access_token)
localStorage.setItem("refresh_token", tokens.refresh_token)
localStorage.setItem("id_token", tokens.id_token)
localStorage.setItem("expires_at", expiresAt.toString())
```

### Recuperação
```typescript
const accessToken = localStorage.getItem("access_token")
const refreshToken = localStorage.getItem("refresh_token")
```

---

## 🔄 Interceptor de API (Próximo Passo)

Para uso automático dos tokens, criar interceptor:

```typescript
// src/lib/api-instance.ts
import axios from 'axios'
import { keycloakRefreshToken } from './keycloak-auth'

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Adiciona token em todas as requisições
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh automático em caso de 401
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const tokens = await keycloakRefreshToken({ refreshToken })
        
        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)

        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
        return apiInstance(originalRequest)
      } catch (refreshError) {
        // Redireciona para login
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiInstance
```

---

## 🛡️ Segurança

### Considerações

#### ✅ Vantagens
- **Simples:** Sem redirect, sem OAuth flow complexo
- **Direto:** Tokens obtidos imediatamente
- **Controle:** Frontend tem controle total dos tokens
- **Mobile-friendly:** Funciona bem em apps mobile

#### ⚠️ Considerações
- **ROPC Grant:** Deve estar habilitado no Keycloak client
- **HTTPS:** Obrigatório em produção
- **Client Secret:** Deve ser protegido (usar variável de ambiente)
- **LocalStorage:** Vulnerável a XSS (considerar httpOnly cookies em produção)

### Melhorias de Segurança (Opcional)

1. **Usar httpOnly Cookies ao invés de localStorage:**
```typescript
// API route para salvar token em cookie
// pages/api/auth/login.ts
export default async function handler(req, res) {
  const tokens = await keycloakLogin(req.body)
  
  res.setHeader('Set-Cookie', [
    `access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Strict`,
    `refresh_token=${tokens.refresh_token}; HttpOnly; Secure; SameSite=Strict`,
  ])
  
  res.json({ success: true })
}
```

2. **PKCE (Proof Key for Code Exchange):** Para apps públicos

3. **Revogar tokens ao fazer logout**

---

## 🧪 Como Testar

### 1. Configurar Keycloak

```bash
# Criar realm: venda-plus
# Criar client: venda-plus-web
# Habilitar: Direct Access Grants (Resource Owner Password)
# Configurar Client Secret
```

### 2. Configurar .env.local

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=venda-plus
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=venda-plus-web
NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET=xxxxx
```

### 3. Testar Login

```bash
# Iniciar frontend
npm run dev

# Acessar
http://localhost:3000/login

# Login com credenciais do Keycloak
```

### 4. Verificar Tokens

```javascript
// Abrir DevTools Console
console.log(localStorage.getItem('access_token'))
console.log(localStorage.getItem('refresh_token'))
```

---

## 🐛 Troubleshooting

### Erro: "grant_type password not allowed"
**Solução:** Habilitar "Direct Access Grants" no Keycloak client

### Erro: "Invalid client credentials"
**Solução:** Verificar KEYCLOAK_CLIENT_SECRET no .env.local

### Erro: "CORS error"
**Solução:** Configurar CORS no Keycloak:
```
Admin Console → Realm Settings → Security Defenses
Web Origins: http://localhost:3000
```

### Tokens não salvam
**Solução:** Verificar se localStorage está disponível (não funciona em incógnito/privado em alguns browsers)

---

## 📚 Referências

- [Keycloak Token Endpoint](https://www.keycloak.org/docs/latest/securing_apps/#token-endpoint)
- [OAuth 2.0 ROPC Grant](https://oauth.net/2/grant-types/password/)
- [Keycloak Direct Access Grants](https://www.keycloak.org/docs/latest/server_admin/#_direct-access-grants)

---

## ✅ Checklist

- [x] Serviço de autenticação Keycloak criado
- [x] Página de login atualizada
- [x] Tokens salvos em localStorage
- [x] Variáveis de ambiente documentadas
- [ ] Interceptor de API (próximo passo)
- [ ] Migrar para httpOnly cookies (opcional)
- [ ] Implementar refresh automático
- [ ] Logout completo

---

**Status:** ✅ IMPLEMENTADO  
**Data:** 04/11/2024  
**Método:** Resource Owner Password Credentials (ROPC)  
**Compatibilidade:** Keycloak 18+, Next.js 14+
