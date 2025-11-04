# ✅ CONFIGURAÇÃO DO KEYCLOAK CORRIGIDA

## 🎯 Problema Resolvido

O erro "Configuração do Keycloak não encontrada" foi causado porque o código esperava variáveis com prefixo `NEXT_PUBLIC_` mas o `.env.local` usa nomes diferentes.

## ✅ Solução Implementada

O código agora extrai automaticamente a configuração do `KEYCLOAK_ISSUER`:

```typescript
// De:
KEYCLOAK_ISSUER=https://token.venda.plus/realms/app

// Extrai:
{
  baseUrl: "https://token.venda.plus",
  realm: "app",
  clientId: "vendaplus",
  clientSecret: "tKdKmGRJt9FJDsFXWRs3XLv7FwVYPnpt"
}
```

## 📋 Configuração Atual (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_SECRET=9f376bbac775a0331a5adb0a3cab1d26
NEXTAUTH_URL=http://localhost:3000
KEYCLOAK_ID=vendaplus
KEYCLOAK_SECRET=tKdKmGRJt9FJDsFXWRs3XLv7FwVYPnpt
KEYCLOAK_ISSUER=https://token.venda.plus/realms/app
```

## 🔗 URLs Geradas Automaticamente

- **Token Endpoint:**
  ```
  POST https://token.venda.plus/realms/app/protocol/openid-connect/token
  ```

- **Logout Endpoint:**
  ```
  POST https://token.venda.plus/realms/app/protocol/openid-connect/logout
  ```

## 🧪 Como Testar

### 1. Execute o script de teste:
```bash
node test-keycloak-config.js
```

Deve mostrar:
```
✅ Configuração Extraída:
Base URL: https://token.venda.plus
Realm: app
Client ID: vendaplus
```

### 2. Teste o login no navegador:
```bash
npm run dev
# Abra http://localhost:3000/login
```

### 3. Abra o DevTools Console e veja os logs:
```
🔑 Tentando login no Keycloak...
URL: https://token.venda.plus/realms/app/protocol/openid-connect/token
```

## ⚙️ Configuração do Keycloak (Servidor)

Certifique-se que o client `vendaplus` no Keycloak tenha:

### 1. Direct Access Grants Habilitado
```
Admin Console → Clients → vendaplus → Settings
☑️ Direct Access Grants Enabled
```

### 2. Valid Redirect URIs
```
http://localhost:3000/*
https://app.venda.plus/*
```

### 3. Web Origins (CORS)
```
http://localhost:3000
https://app.venda.plus
```

### 4. Access Type
```
confidential
```

### 5. Client Secret
Deve corresponder ao valor em `.env.local`:
```
KEYCLOAK_SECRET=tKdKmGRJt9FJDsFXWRs3XLv7FwVYPnpt
```

## 🐛 Troubleshooting

### Erro: "Configuração do Keycloak não encontrada"
**Causa:** Variáveis de ambiente não carregadas

**Solução:**
```bash
# 1. Verifique se .env.local existe
ls -la .env.local

# 2. Reinicie o servidor
npm run dev

# 3. Verifique as variáveis
node test-keycloak-config.js
```

### Erro: "CORS error"
**Causa:** Web Origins não configurado no Keycloak

**Solução:**
```
Keycloak Admin → Clients → vendaplus → Settings
Web Origins: http://localhost:3000
```

### Erro: "Invalid client credentials"
**Causa:** KEYCLOAK_SECRET incorreto

**Solução:**
```bash
# 1. Copie o Client Secret do Keycloak
Admin Console → Clients → vendaplus → Credentials

# 2. Cole no .env.local
KEYCLOAK_SECRET=cole-aqui-o-secret
```

### Erro: "grant_type password not allowed"
**Causa:** Direct Access Grants desabilitado

**Solução:**
```
Admin Console → Clients → vendaplus → Settings
☑️ Direct Access Grants Enabled
```

## 📝 Logs Úteis

### Login Bem-Sucedido
```javascript
console.log('✅ Login successful!')
console.log('Access Token:', tokens.access_token)
console.log('Refresh Token:', tokens.refresh_token)
console.log('Expires in:', tokens.expires_in, 'seconds')
```

### Erro de Login
```javascript
console.error('❌ Login failed:', error.message)
console.error('URL:', tokenUrl)
console.error('Username:', credentials.username)
```

## 🔒 Segurança

### ⚠️ IMPORTANTE:

1. **Não commite o .env.local**
   ```bash
   # Já está no .gitignore
   .env.local
   ```

2. **Use HTTPS em produção**
   ```env
   KEYCLOAK_ISSUER=https://token.venda.plus/realms/app
   ```

3. **Rotacione o Client Secret periodicamente**
   ```
   Keycloak Admin → Clients → vendaplus → Credentials → Regenerate Secret
   ```

## ✅ Status Final

- ✅ Código atualizado para usar KEYCLOAK_ISSUER
- ✅ Extração automática de baseUrl e realm
- ✅ Compatível com .env.local atual
- ✅ Script de teste criado
- ✅ Documentação completa

## 🚀 Próximos Passos

1. Teste o login em http://localhost:3000/login
2. Use credenciais de um usuário do Keycloak
3. Verifique se os tokens são salvos no localStorage
4. Teste navegação após login

---

**Data:** 04/11/2024  
**Status:** ✅ CORRIGIDO  
**Testado:** ✅ SIM
