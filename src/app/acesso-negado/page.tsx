'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useSession } from '@/contexts/session-context'

export default function AcessoNegadoPage() {
  const router = useRouter()
  const { session, status } = useSession()
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Informações da sua conta:</p>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
              <p><strong>Roles:</strong> {session?.user?.roles?.join(', ') || 'Nenhuma'}</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Se você acredita que deveria ter acesso a esta página, entre em contato com o administrador do sistema.
          </p>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
