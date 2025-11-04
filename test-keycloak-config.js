// Script de teste para verificar configuração do Keycloak
// Execute: node test-keycloak-config.js

console.log('🔍 Verificando configuração do Keycloak...\n')

// Simular variáveis de ambiente do .env.local
const env = {
  KEYCLOAK_ISSUER: 'https://token.venda.plus/realms/app',
  KEYCLOAK_ID: 'vendaplus',
  KEYCLOAK_SECRET: 'tKdKmGRJt9FJDsFXWRs3XLv7FwVYPnpt',
}

console.log('📋 Variáveis de Ambiente:')
console.log('KEYCLOAK_ISSUER:', env.KEYCLOAK_ISSUER)
console.log('KEYCLOAK_ID:', env.KEYCLOAK_ID)
console.log('KEYCLOAK_SECRET:', env.KEYCLOAK_SECRET ? '***' + env.KEYCLOAK_SECRET.slice(-4) : 'NÃO DEFINIDO')
console.log()

// Extrair configuração
const match = env.KEYCLOAK_ISSUER.match(/^(https?:\/\/[^\/]+)\/realms\/([^\/]+)/)

if (!match) {
  console.error('❌ ERRO: KEYCLOAK_ISSUER em formato inválido')
  console.error('   Esperado: https://domain/realms/realm-name')
  console.error('   Recebido:', env.KEYCLOAK_ISSUER)
  process.exit(1)
}

const config = {
  baseUrl: match[1],
  realm: match[2],
  clientId: env.KEYCLOAK_ID,
  clientSecret: env.KEYCLOAK_SECRET,
}

console.log('✅ Configuração Extraída:')
console.log('Base URL:', config.baseUrl)
console.log('Realm:', config.realm)
console.log('Client ID:', config.clientId)
console.log('Client Secret:', config.clientSecret ? '***' + config.clientSecret.slice(-4) : 'NÃO DEFINIDO')
console.log()

console.log('🔗 URLs do Keycloak:')
console.log('Token Endpoint:', `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/token`)
console.log('Logout Endpoint:', `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/logout`)
console.log()

console.log('✅ Configuração OK!')
console.log()
console.log('📝 Próximos passos:')
console.log('1. Acesse /login no navegador')
console.log('2. Digite credenciais do Keycloak')
console.log('3. Verifique console do navegador para logs')
