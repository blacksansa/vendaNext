'use client'

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTasks, createTask, updateTask, getUsers, getTeams, getCustomers } from "@/lib/api.client";
import { Task, User, Team, Customer } from "@/lib/types";
import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TarefasLoading from "./loading";
import { KanbanColumn } from "@/components/tarefas/KanbanColumn";
import { Metrics } from "@/components/tarefas/Metrics";
import { Performance } from "@/components/tarefas/Performance";
import { Filters } from "@/components/tarefas/Filters";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusList, TaskStatus } from "@/lib/status-map";

export default function TarefasKanban() {
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");
  const [tasks, setTasks] = useState<{ [key in TaskStatus]?: Task[] }>({});
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedUsers, fetchedTeams, fetchedCustomers] = await Promise.all([
        getTasks(),
        getUsers(),
        getTeams(),
        getCustomers()
      ]);

      const initialTasks = statusList.reduce((acc, status) => {
        acc[status] = [];
        return acc;
      }, {} as { [key in TaskStatus]: Task[] });

      const tasksByStatus = (fetchedTasks || []).filter(Boolean).reduce((acc, task) => {
        const status = task.status as TaskStatus || 'PENDING';
        if (acc[status]) {
          acc[status].push(task);
        }
        return acc;
      }, initialTasks);

      setTasks(tasksByStatus);
      setUsers(fetchedUsers || []);
      setTeams(fetchedTeams || []);
      setCustomers(fetchedCustomers || []);

    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch initial data. Please check the console for more details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const startColumnKey = source.droppableId as TaskStatus;
    const endColumnKey = destination.droppableId as TaskStatus;

    const startColumn = tasks[startColumnKey];
    const endColumn = tasks[endColumnKey];

    if (!startColumn || !endColumn) return;

    const startTasks = Array.from(startColumn);
    const [removed] = startTasks.splice(source.index, 1);
    const endTasks = Array.from(endColumn);
    endTasks.splice(destination.index, 0, removed);

    const newTasksState = {
      ...tasks,
      [startColumnKey]: startTasks,
      [endColumnKey]: endTasks
    };
    setTasks(newTasksState);

    updateTask(parseInt(draggableId), { status: endColumnKey }).catch(err => {
      // Revert on failure by refetching
      fetchInitialData();
      console.error("Failed to update task status", err);
    });
  };

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const newTask: Partial<Task> = {
      title: data.title as string,
      description: data.description as string,
      priority: data.priority as string,
      dueDate: data.dueDate as string,
      assigneeId: (data.assigneeId && !String(data.assigneeId).startsWith("__none")) ? String(data.assigneeId) : undefined,
      teamId: (data.teamId && !String(data.teamId).startsWith("__none")) ? Number(data.teamId) : undefined,
      customerId: (data.customerId && !String(data.customerId).startsWith("__none")) ? Number(data.customerId) : undefined,
      status: 'PENDING',
    };

    try {
      await createTask(newTask);
      setIsCreateDialogOpen(false);
      fetchInitialData(); // Refetch all data
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  if (loading) {
    return <TarefasLoading />;
  }

  const allTasks = Object.values(tasks).flat();
  const hasTasks = allTasks.length > 0;

  const totalTarefas = allTasks.length;
  const concluidas = tasks.DONE?.length || 0;
  const pendentes = tasks.PENDING?.length || 0;
  const emAndamento = tasks.IN_PROGRESS?.length || 0;
  const atrasadas = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;

  // Produtividade: % de tarefas concluídas sobre o total (1 casa decimal)
  const produtividade =
    totalTarefas === 0 ? 0 : Math.round((concluidas / totalTarefas) * 1000) / 10;

  // Tempo médio (placeholder — calcule conforme seu modelo de datas)
  const tempoMedio = allTasks.length === 0 ? 0 : 3.2;

  const metricas = {
    totalTarefas,
    pendentes,
    emAndamento,
    concluidas,
    atrasadas,
    produtividade,
    tempoMedio,
  };

  const responsaveis = allTasks.reduce((acc, task) => {
    if (task.assignee) {
        const assigneeName = `${task.assignee.firstName} ${task.assignee.lastName}`;
        if (!acc.find(r => r.nome === assigneeName)) {
            acc.push({ id: task.assignee.id!, nome: assigneeName, tipo: 'vendedor', tarefas: 0, concluidas: 0 });
        }
    }
    if (task.team) {
        if (!acc.find(r => r.nome === task.team!.name)) {
            acc.push({ id: task.team.id!.toString(), nome: task.team.name!, tipo: 'grupo', tarefas: 0, concluidas: 0 });
        }
    }
    return acc;
  }, [] as { id: string; nome: string; tipo: string; tarefas: number; concluidas: number }[]).map(r => {
    const userTasks = allTasks.filter(t => t.assignee?.id === r.id || t.team?.id.toString() === r.id);
    r.tarefas = userTasks.length;
    r.concluidas = userTasks.filter(t => t.status === 'DONE').length;
    return r;
  });

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-lg font-semibold">Gerenciamento de Tarefas</h1>
          </div>
          <Button onClick={() => { fetchInitialData(); setIsCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
          </Button>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {hasTasks ? (
          <>
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
                {(Object.keys(tasks) as TaskStatus[]).map((status) => (
                  <KanbanColumn key={status} status={status} tasks={tasks[status] || []} />
                ))}
              </div>
            </DragDropContext>
          </>
        ) : (
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
        )}
      </div>
      
      {/* Create Task Dialog (Now always rendered) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
            <DialogDescription>Preencha os detalhes da nova tarefa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" placeholder="Ex: Ligar para o cliente X" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" placeholder="Adicionar mais detalhes sobre a tarefa..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select name="priority">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="LOW">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assigneeId">Responsável</Label>
                <Select name="assigneeId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <SelectItem value="__none_user" disabled>Nenhum usuário encontrado</SelectItem>
                    ) : (
                      users.map(user => user.email ? (
                          <SelectItem key={user.id || user.email} value={user.email}>{user.firstName} {user.lastName}</SelectItem>
                        ) : null)
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamId">Time</Label>
                <Select name="teamId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.length === 0 ? (
                      <SelectItem value="__none_team" disabled>Nenhum time encontrado</SelectItem>
                    ) : (
                      teams.map(team => team.id ? (
                        <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>
                      ) : null)
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerId">Cliente</Label>
                <Select name="customerId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="__none_customer" disabled>Nenhum cliente encontrado</SelectItem>
                    ) : (
                      customers.map(c => c.id ? (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ) : null)
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Tarefa</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}