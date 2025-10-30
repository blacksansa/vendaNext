"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DASHBOARD_COMPONENTS, ROLE_PERMISSIONS } from "@/lib/permissions"
import { RoleGuard } from "@/components/role-guard"

export default function RoleConfigPage() {
  const [selectedRole, setSelectedRole] = useState<string>("admin")

  return (
    <RoleGuard requiredRole="manageUsers">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configuração de Roles</h1>
          <p className="text-muted-foreground">Configure quais componentes cada role pode visualizar em produção</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="grupos">Grupos</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Componentes do Dashboard</CardTitle>
                <CardDescription>Configure quais componentes aparecem no dashboard principal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DASHBOARD_COMPONENTS.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{component.name}</h4>
                      <p className="text-sm text-muted-foreground">{component.description}</p>
                      <div className="flex gap-2">
                        {component.requiredPermissions.map((perm, idx) => (
                          <Badge key={idx} variant="secondary">
                            {perm.module}:{perm.action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Permissões</CardTitle>
                <CardDescription>Visualize todas as permissões por role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
                    <div key={role} className="space-y-2">
                      <h3 className="font-semibold capitalize">{role.replace("_", " ")}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {permissions.map((perm, idx) => (
                          <Badge key={idx} variant="outline">
                            {perm.module}: {perm.actions.join(", ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-4">
          <Button>Salvar Configurações</Button>
          <Button variant="outline">Exportar Config</Button>
          <Button variant="outline">Importar Config</Button>
        </div>
      </div>
    </RoleGuard>
  )
}
