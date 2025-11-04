/**
 * Serviço de autenticação direto com Keycloak
 * Obtém tokens via Resource Owner Password Credentials Grant (ROPC)
 */

interface KeycloakTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: string
  id_token?: string
  session_state?: string
  scope: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Extrai a URL base e realm do KEYCLOAK_ISSUER
 * Exemplo: https://token.venda.plus/realms/app
 * Retorna: { baseUrl: 'https://token.venda.plus', realm: 'app' }
 */
function getKeycloakConfig() {
  const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || process.env.KEYCLOAK_ISSUER
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_ID
  const clientSecret = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || process.env.KEYCLOAK_SECRET

  if (!issuer || !clientId || !clientSecret) {
    throw new Error('Configuração do Keycloak não encontrada. Verifique KEYCLOAK_ISSUER, KEYCLOAK_ID e KEYCLOAK_SECRET')
  }

  // Extrai baseUrl e realm do issuer
  // Formato: https://token.venda.plus/realms/app
  const match = issuer.match(/^(https?:\/\/[^\/]+)\/realms\/([^\/]+)/)
  
  if (!match) {
    throw new Error('KEYCLOAK_ISSUER em formato inválido. Esperado: https://domain/realms/realm-name')
  }

  return {
    baseUrl: match[1],
    realm: match[2],
    clientId,
    clientSecret,
  }
}

/**
 * Faz login direto no Keycloak usando username e password
 */
export async function keycloakLogin(
  credentials: LoginCredentials
): Promise<KeycloakTokenResponse> {
  const config = getKeycloakConfig()
  const tokenUrl = `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/token`

  const formData = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'password',
    username: credentials.username,
    password: credentials.password,
    scope: 'openid profile email',
  })

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'invalid_grant',
        error_description: 'Credenciais inválidas',
      }))
      throw new Error(error.error_description || 'Erro ao fazer login')
    }

    const tokens: KeycloakTokenResponse = await response.json()
    return tokens
  } catch (error) {
    console.error('Erro no login do Keycloak:', error)
    throw error
  }
}

/**
 * Atualiza o access token usando o refresh token
 */
export async function keycloakRefreshToken(
  request: RefreshTokenRequest
): Promise<KeycloakTokenResponse> {
  const config = getKeycloakConfig()
  const tokenUrl = `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/token`

  const formData = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: request.refreshToken,
  })

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'invalid_grant',
        error_description: 'Refresh token inválido ou expirado',
      }))
      throw new Error(error.error_description || 'Erro ao atualizar token')
    }

    const tokens: KeycloakTokenResponse = await response.json()
    return tokens
  } catch (error) {
    console.error('Erro ao atualizar token:', error)
    throw error
  }
}

/**
 * Faz logout no Keycloak
 */
export async function keycloakLogout(refreshToken: string): Promise<void> {
  try {
    const config = getKeycloakConfig()
    const logoutUrl = `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/logout`

    const formData = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    })

    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      console.warn('Keycloak logout retornou erro, mas continuando com logout local')
    }

    console.log('[Logout] Logout no Keycloak concluído')
  } catch (error) {
    console.error('[Logout] Erro ao fazer logout no Keycloak:', error)
    // Não bloqueia o logout mesmo se falhar
  }
}
