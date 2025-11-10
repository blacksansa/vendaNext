import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanCard } from "./KanbanCard";
import { statusMap, TaskStatus } from "@/lib/status-map";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask?: (t: Task) => void;
  onDeleteTask?: (t: Task) => void;
}

export function KanbanColumn({ status, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const statusInfo = statusMap[status];
  const Icon = statusInfo?.icon;

  return (
    <Droppable droppableId={status} key={status}>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className={`h-5 w-5 ${statusInfo.color}`} />}
                  <CardTitle className="text-lg">{statusInfo?.label || status}</CardTitle>
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
                      <KanbanCard tarefa={tarefa} onEdit={onEditTask} onDelete={onDeleteTask} />
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
