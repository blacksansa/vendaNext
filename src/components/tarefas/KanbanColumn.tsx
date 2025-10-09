import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanCard } from "./KanbanCard";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  return (
    <Droppable droppableId={status} key={status}>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status === 'pendentes' && <Clock className="h-5 w-5 text-orange-500" />}
                  {status === 'emAndamento' && <AlertCircle className="h-5 w-5 text-blue-500" />}
                  {status === 'concluidas' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  <CardTitle className="text-lg">{status.charAt(0).toUpperCase() + status.slice(1)}</CardTitle>
                </div>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((tarefa, index) => (
                <Draggable key={tarefa.id} draggableId={tarefa.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <KanbanCard tarefa={tarefa} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </CardContent>
          </Card>
        </div>
      )}
    </Droppable>
  );
}
