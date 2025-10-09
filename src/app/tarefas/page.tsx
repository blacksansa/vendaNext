'use client'

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTasks, createTask, updateTask } from "@/lib/api.client";
import { Task } from "@/lib/types";
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import TarefasLoading from "./loading";
import { KanbanColumn } from "@/components/tarefas/KanbanColumn";
import { Metrics } from "@/components/tarefas/Metrics";
import { Performance } from "@/components/tarefas/Performance";
import { Filters } from "@/components/tarefas/Filters";
import { Plus, CheckCircle, Clock, AlertCircle, MoreHorizontal, Calendar, Target, TrendingUp, Filter, Download } from "lucide-react";

export default function TarefasKanban() {
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({ pendentes: [], emAndamento: [], concluidas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        const tasksByStatus = (fetchedTasks || []).filter(Boolean).reduce((acc, task) => {
          const status = task.status || 'pendentes';
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status].push(task);
          return acc;
        }, {} as { [key: string]: Task[] });
        setTasks(tasksByStatus);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch tasks. Please check the console for more details.');
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumn = tasks[source.droppableId];
    const endColumn = tasks[destination.droppableId];

    const startTasks = Array.from(startColumn);
    const [removed] = startTasks.splice(source.index, 1);
    const endTasks = Array.from(endColumn);
    endTasks.splice(destination.index, 0, removed);

    const newTasksState = {
      ...tasks,
      [source.droppableId]: startTasks,
      [destination.droppableId]: endTasks,
    };

    setTasks(newTasksState);

    updateTask(parseInt(draggableId), { status: destination.droppableId }).catch(err => {
      // Revert the change if the API call fails
      setTasks(tasks);
    });
  };

  if (loading) {
    return <TarefasLoading />;
  }

  if (Object.values(tasks).every(column => column.length === 0) && !loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">Gerenciamento de Tarefas</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Nenhuma tarefa encontrada</h2>
              <p className="text-muted-foreground">Crie uma nova tarefa para começar.</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  const metricas = {
    totalTarefas: Object.values(tasks).flat().length,
    pendentes: tasks.pendentes?.length || 0,
    emAndamento: tasks.emAndamento?.length || 0,
    concluidas: tasks.concluidas?.length || 0,
    atrasadas: Object.values(tasks).flat().filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
    produtividade: 78.5, // Mocked
    tempoMedio: 3.2, // Mocked
  }

  const responsaveis = Object.values(tasks).flat().reduce((acc, task) => {
    const assignee = task.assignee?.firstName + ' ' + task.assignee?.lastName;
    if (assignee && !acc.find(r => r.nome === assignee)) {
      acc.push({ id: task.assignee!.id, nome: assignee, tipo: 'vendedor', tarefas: 0, concluidas: 0 });
    }
    const team = task.team?.name;
    if (team && !acc.find(r => r.nome === team)) {
      acc.push({ id: task.team!.id.toString(), nome: team, tipo: 'grupo', tarefas: 0, concluidas: 0 });
    }
    return acc;
  }, [] as { id: string; nome: string; tipo: string; tarefas: number; concluidas: number }[]).map(r => {
    const userTasks = Object.values(tasks).flat().filter(t => t.assignee?.id === r.id || t.team?.id.toString() === r.id);
    r.tarefas = userTasks.length;
    r.concluidas = userTasks.filter(t => t.status === 'concluidas').length;
    return r;
  });

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Gerenciamento de Tarefas</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Metrics metricas={metricas} />
        <Performance responsaveis={responsaveis} />
        <Filters 
          filtroResponsavel={filtroResponsavel} 
          setFiltroResponsavel={setFiltroResponsavel} 
          filtroPrioridade={filtroPrioridade} 
          setFiltroPrioridade={setFiltroPrioridade} 
          responsaveis={responsaveis} 
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(tasks).map(([status, tasks]) => (
              <KanbanColumn key={status} status={status} tasks={tasks} />
            ))}
          </div>
        </DragDropContext>
      </div>
    </SidebarInset>
  )
}