'use client'

import { useAuth } from '@/hooks/use-auth'
import { useSession } from '@/contexts/session-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Componente de exemplo que demonstra o uso do novo SessionProvider
 * Compatível com código antigo que usa useSession() e useAuth()
 */
export function SessionDemo() {
  // Opção 1: Usar useAuth (recomendado para código novo)
  const { user, roles, role, isAuthenticated, loading, signOut } = useAuth()
  
  // Opção 2: Usar useSession (compatível com NextAuth)
  const { session, status, refreshSession } = useSession()

  if (loading || status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!isAuthenticated || status === 'unauthenticated') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Não Autenticado</CardTitle>
          <CardDescription>Faça login para ver suas informações</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Sessão</CardTitle>
          <CardDescription>Dados do usuário logado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="font-mono text-sm">{user?.id}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{user?.name || 'Não informado'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Role Principal</p>
            <Badge variant={
              role === 'admin' ? 'default' : 
              role === 'manager' ? 'secondary' : 
              'outline'
            }>
              {role}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Roles do Keycloak</p>
            <div className="flex flex-wrap gap-2">
              {roles && roles.length > 0 ? (
                roles.map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma role atribuída</p>
              )}
            </div>
          </div>

          {session && (
            <div>
              <p className="text-sm text-muted-foreground">Token Expira Em</p>
              <p className="text-sm">
                {Math.round((session.expiresAt - Date.now()) / 1000 / 60)} minutos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={refreshSession} variant="outline" className="w-full">
            🔄 Atualizar Token Manualmente
          </Button>
          
          <Button onClick={signOut} variant="destructive" className="w-full">
            🚪 Fazer Logout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Completos do Usuário</CardTitle>
          <CardDescription>Todos os claims do JWT</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
