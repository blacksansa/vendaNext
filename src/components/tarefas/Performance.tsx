import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PerformanceProps {
  responsaveis: {
    id: string;
    nome: string;
    tipo: string;
    tarefas: number;
    concluidas: number;
  }[];
}

export function Performance({ responsaveis }: PerformanceProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Performance por Responsável</CardTitle>
        <CardDescription>Acompanhamento de produtividade individual e por equipe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responsaveis.map((responsavel) => (
            <Card key={responsavel.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {responsavel.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{responsavel.nome}</p>
                      <Badge variant="outline" className="text-xs">
                        {responsavel.tipo === "grupo" ? "Equipe" : "Vendedor"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tarefas:</span>
                    <span className="font-medium">{responsavel.tarefas}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concluídas:</span>
                    <span className="font-medium">{responsavel.concluidas}</span>
                  </div>
                  <Progress value={(responsavel.concluidas / responsavel.tarefas) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {Math.round((responsavel.concluidas / responsavel.tarefas) * 100)}% de conclusão
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
