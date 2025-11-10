import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { MoreHorizontal, Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface KanbanCardProps {
  tarefa: Task;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
}

export function KanbanCard({ tarefa, onEdit, onDelete }: KanbanCardProps) {
  // Map priority values from the Task type to labels and styles
  const priority = tarefa.priority;
  const priorityLabel =
    priority === "HIGH" ? "Alta" : priority === "MEDIUM" ? "Média" : "Baixa";
  const priorityBorderClass =
    priority === "HIGH"
      ? "border-l-red-500"
      : priority === "MEDIUM"
      ? "border-l-yellow-500"
      : "border-l-green-500";
  const badgeVariant =
    priority === "HIGH" ? "destructive" : priority === "MEDIUM" ? "secondary" : "outline";

  return (
    <Card key={tarefa.id} className={`border-l-4 ${priorityBorderClass} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{tarefa.title}</h4>
            <Badge
              variant={badgeVariant}
              className="text-xs shrink-0"
            >
              {priorityLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{tarefa.description}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {((tarefa as any).assignee?.firstName?.charAt(0) ?? "")}{((tarefa as any).assignee?.lastName?.charAt(0) ?? "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{((tarefa as any).assignee?.firstName) ?? ""} {((tarefa as any).assignee?.lastName) ?? ""}</span>
            {(tarefa as any).team && <Badge variant="outline" className="text-xs ml-auto">{(tarefa as any).team.name}</Badge>}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {tarefa.dueDate ? new Date(tarefa.dueDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full" aria-label="Ações da tarefa">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(tarefa)}>
                <Pencil className="h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(tarefa)}>
                <Trash2 className="h-4 w-4" /> Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
