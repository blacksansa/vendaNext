import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { MoreHorizontal, Calendar, Clock } from "lucide-react";

interface KanbanCardProps {
  tarefa: Task;
}

export function KanbanCard({ tarefa }: KanbanCardProps) {
  return (
    <Card key={tarefa.id} className={`border-l-4 ${tarefa.priority === 'Alta' ? 'border-l-red-500' : tarefa.priority === 'Média' ? 'border-l-yellow-500' : 'border-l-green-500'} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{tarefa.title}</h4>
            <Badge
              variant={
                tarefa.priority === "Alta"
                  ? "destructive"
                  : tarefa.priority === "Média"
                    ? "secondary"
                    : "outline"
              }
              className="text-xs shrink-0"
            >
              {tarefa.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{tarefa.description}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {tarefa.assignee?.firstName?.charAt(0)}{tarefa.assignee?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{tarefa.assignee?.firstName} {tarefa.assignee?.lastName}</span>
            {tarefa.team && <Badge variant="outline" className="text-xs ml-auto">{tarefa.team.name}</Badge>}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {tarefa.dueDate ? new Date(tarefa.dueDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
