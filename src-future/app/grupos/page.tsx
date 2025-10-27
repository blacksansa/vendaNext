"use client"

import { useEffect, useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { fetchGrupos } from "@/services/grupos.service"
import { Grupo } from "@/models/grupo"

export default function GruposPage() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const data = await fetchGrupos()
        setGrupos(data)
      } catch (error) {
        console.error("Failed to fetch grupos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGrupos()
  }, [])

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>Fetching group data, please wait.</CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Grupos</h1>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4 pt-6">
        {grupos.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum Grupo Encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              Você ainda não possui grupos. Crie um novo grupo para começar.
            </CardContent>
          </Card>
        ) : (
          grupos.map((grupo) => (
            <Card key={grupo.id}>
              <CardHeader>
                <CardTitle>{grupo.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{grupo.descricao}</p>
                <Button onClick={() => console.log(`Edit ${grupo.nome}`)}>Editar</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </SidebarInset>
  )
}