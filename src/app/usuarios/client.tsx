
"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, resetPassword as resetPasswordApi, getUserGroups, addUserToGroup, removeUserFromGroup } from "@/lib/api.client";
import { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GroupPermissions } from "@/components/group-permissions";

interface UsuariosPageClientProps {
  users: User[];
  userGroups: any[];
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}

export function UsuariosPageClient({
  users: initialUsers,
  userGroups: initialUserGroups,
  totalUsers: initialTotalUsers,
  activeUsers: initialActiveUsers,
  adminUsers: initialAdminUsers,
}: UsuariosPageClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [userGroups, setUserGroups] = useState(initialUserGroups);
  const [totalUsers, setTotalUsers] = useState(initialTotalUsers);
  const [activeUsers, setActiveUsers] = useState(initialActiveUsers);
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);
  const [buttonStatus, setButtonStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});

  const setStatus = (userId: string, status: 'idle' | 'loading' | 'success' | 'error') => {
    setButtonStatus(prev => ({ ...prev, [userId]: status }));
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setButtonStatus(prev => ({ ...prev, [userId]: 'idle' }));
      }, 2000);
    }
  };
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const fetchUsers = async () => {
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
  };

  const handleCreateUser = async () => {
    console.log('[user-creation] Starting user creation');
    console.log('[user-creation] User data:', newUser);
    
    // Validation
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      console.error('[user-creation] Validation failed - missing fields');
      setStatus('create', 'error');
      return;
    }

    setStatus('create', 'loading');
    
    // Optimistic update - create temporary user
    const tempUser: User = {
      id: `temp-${Date.now()}`,
      firstName: newUser.firstName,
      lastName: newUser.lastName || "",
      email: newUser.email,
      enabled: true,
      emailVerified: false,
      sendEmail: true,
      groups: [],
      createdTimestamp: Date.now(),
    };
    
    console.log('[user-creation] Adding optimistic user:', tempUser);
    setUsers(prev => [...prev, tempUser]);
    setTotalUsers(prev => prev + 1);
    setActiveUsers(prev => prev + 1);
    
    try {
      console.log('[user-creation] Calling API createUser');
      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName || "",
        email: newUser.email,
        password: newUser.password,
        enabled: true,
        emailVerified: false,
        sendEmail: true,
      };
      console.log('[user-creation] Sending user data:', userData);
      const createdUser = await createUser(userData as any);
      console.log('[user-creation] User created successfully:', createdUser);
      
      // Replace optimistic user with real user
      setUsers(prev => prev.map(u => u.id === tempUser.id ? createdUser : u));
      
      setNewUser({ firstName: "", lastName: "", email: "", password: "" });
      setIsCreateDialogOpen(false);
      setStatus('create', 'success');
    } catch (err: any) {
      console.error('[user-creation] Error creating user:', err);
      console.error('[user-creation] Error message:', err.message);
      
      // Rollback optimistic update
      setUsers(prev => prev.filter(u => u.id !== tempUser.id));
      setTotalUsers(prev => prev - 1);
      setActiveUsers(prev => prev - 1);
      
      setStatus('create', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('[user-delete] Starting delete for user:', userId);
    setStatus(userId, 'loading');
    
    // Optimistic update - remove user from list
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      console.error('[user-delete] User not found:', userId);
      setStatus(userId, 'error');
      return;
    }
    
    console.log('[user-delete] Removing user optimistically:', userToDelete);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setTotalUsers(prev => prev - 1);
    if (userToDelete.enabled) {
      setActiveUsers(prev => prev - 1);
    }
    
    try {
      console.log('[user-delete] Calling API deleteUser');
      await deleteUser(userId);
      console.log('[user-delete] User deleted successfully');
      setStatus(userId, 'success');
    } catch (err: any) {
      console.error('[user-delete] Error deleting user:', err);
      
      // Rollback optimistic update
      setUsers(prev => [...prev, userToDelete]);
      setTotalUsers(prev => prev + 1);
      if (userToDelete.enabled) {
        setActiveUsers(prev => prev + 1);
      }
      
      setStatus(userId, 'error');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    console.log('[user-toggle] Toggling status for user:', user.id, 'current:', user.enabled);
    setStatus(user.id!, 'loading');
    
    const newStatus = !user.enabled;
    
    // Optimistic update
    console.log('[user-toggle] Updating status optimistically to:', newStatus);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: newStatus } : u));
    if (newStatus) {
      setActiveUsers(prev => prev + 1);
    } else {
      setActiveUsers(prev => prev - 1);
    }
    
    try {
      console.log('[user-toggle] Calling API updateUser');
      await updateUser(user.id!, { ...user, enabled: newStatus });
      console.log('[user-toggle] Status updated successfully');
      setStatus(user.id!, 'success');
    } catch (err: any) {
      console.error('[user-toggle] Error toggling status:', err);
      
      // Rollback optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: user.enabled } : u));
      if (newStatus) {
        setActiveUsers(prev => prev - 1);
      } else {
        setActiveUsers(prev => prev + 1);
      }
      
      setStatus(user.id!, 'error');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    console.log('[user-update] Starting update for user:', selectedUser.id);
    console.log('[user-update] Updated data:', selectedUser);
    
    setStatus(selectedUser.id!, 'loading');
    
    // Store original user for rollback
    const originalUser = users.find(u => u.id === selectedUser.id);
    if (!originalUser) {
      console.error('[user-update] Original user not found:', selectedUser.id);
      setStatus(selectedUser.id!, 'error');
      return;
    }
    
    // Optimistic update
    console.log('[user-update] Updating user optimistically');
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
    
    try {
      console.log('[user-update] Calling API updateUser');
      const updatedUser = await updateUser(selectedUser.id!, selectedUser);
      console.log('[user-update] User updated successfully:', updatedUser);
      
      // Update with real data from server
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setStatus(selectedUser.id!, 'success');
    } catch (err: any) {
      console.error('[user-update] Error updating user:', err);
      
      // Rollback optimistic update
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? originalUser : u));
      
      setStatus(selectedUser.id!, 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setStatus(selectedUser.id!, 'loading');
    try {
      await resetPasswordApi(selectedUser.id!);
      setIsResetPasswordDialogOpen(false);
      setStatus(selectedUser.id!, 'success');
    } catch (err: any) {
      setStatus(selectedUser.id!, 'error');
    }
  };

  // Switch user to a single group (no accumulation)
  const handleGroupAssignment = async (user: User, groupId: string, _checked: boolean) => {
    console.log('[group-assignment] switch User:', user.id, 'to Group:', groupId);
    setStatus(user.id!, 'loading');

    const originalGroups = user.groups || [];
    const group = userGroups.find(g => g.id === groupId);
    if (!group) { setStatus(user.id!, 'error'); return }

    // Optimistic: set only the selected group
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, groups: [group] } : u));

    try {
      // Add selected first if not present (avoid transient loss of permission)
      if (!originalGroups.some(g => g.id === groupId)) await addUserToGroup(groupId, user.id!);
      // Remove all others afterwards
      for (const g of originalGroups) {
        if (g.id !== groupId) await removeUserFromGroup(g.id as string, user.id!);
      }
      setStatus(user.id!, 'success');
    } catch (err: any) {
      console.error('[group-assignment] Error switching group:', err);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, groups: originalGroups } : u));
      setStatus(user.id!, 'error');
    }
  };

const getButtonContent = (status: 'idle' | 'loading' | 'success' | 'error', defaultContent: React.ReactNode) => {
  switch (status) {
    case 'loading':
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return defaultContent;
  }
};

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Controle de Acesso</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Adicione um novo usuário ao sistema e defina suas permissões.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      placeholder="Digite o primeiro nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      placeholder="Digite o sobrenome"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="usuario@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha Temporária</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Digite uma senha temporária"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>{getButtonContent(buttonStatus['create'] || 'idle', 'Criar Usuário')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="permissoes">Grupos e Permissões</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminUsers}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>Gerencie usuários, permissões e status de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Grupos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={"/placeholder.svg"} />
                            <AvatarFallback>
                              {user.firstName && user.lastName
                                ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                                : user.firstName
                                ? user.firstName.substring(0, 2).toUpperCase()
                                : "NN"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName} {user.groups?.some(g => g.name === 'Administradores') && <Shield className="w-4 h-4 inline-block ml-1 text-red-500" />}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.groups?.map(group => (
                            <Badge key={group.id} variant="secondary">{group.name}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.enabled ? "default" : "secondary"}>
                          {user.enabled ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Users className="mr-2 h-4 w-4" />
                                Atribuir Grupo
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  {userGroups.map((group) => (
                                    <DropdownMenuCheckboxItem
                                      key={group.id}
                                      checked={user.groups?.some((g) => g.id === group.id)}
                                      onCheckedChange={(checked) => handleGroupAssignment(user, group.id, checked)}
                                    >
                                      {group.name}
                                    </DropdownMenuCheckboxItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsResetPasswordDialogOpen(true);
                              }}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Senha
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                              {getButtonContent(buttonStatus[user.id!] || 'idle', user.enabled ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              ))}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id!)}>
                              {getButtonContent(buttonStatus[user.id!] || 'idle', <><Trash2 className="mr-2 h-4 w-4" />Excluir</>)}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4">
          <GroupPermissions />
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoria</CardTitle>
              <CardDescription>Histórico de ações realizadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Login realizado", user: "João Silva", time: "15/01/2024 14:30", type: "success" },
                  { action: "Usuário criado", user: "Admin Sistema", time: "15/01/2024 10:15", type: "info" },
                  { action: "Senha alterada", user: "Maria Santos", time: "14/01/2024 16:45", type: "warning" },
                  {
                    action: "Tentativa de login falhada",
                    user: "pedro@crm.com",
                    time: "14/01/2024 09:20",
                    type: "error",
                  },
                ].map((log, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.type === "success"
                          ? "bg-green-500"
                          : log.type === "info"
                            ? "bg-blue-500"
                            : log.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-muted-foreground">por {log.user}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{log.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Reset Password */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset de Senha</DialogTitle>
            <DialogDescription>Enviar email de reset de senha para {selectedUser?.email}?</DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Um email será enviado com instruções para criar uma nova senha.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword}>{getButtonContent(buttonStatus[selectedUser!.id!] || 'idle', <><Mail className="mr-2 h-4 w-4" />Enviar Email</>)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit User */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize as informações do usuário.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName-edit">Nome</Label>
                  <Input
                    id="firstName-edit"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                    placeholder="Digite o primeiro nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName-edit">Sobrenome</Label>
                  <Input
                    id="lastName-edit"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                    placeholder="Digite o sobrenome"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-edit">Email</Label>
                <Input
                  id="email-edit"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>{getButtonContent(buttonStatus[selectedUser!.id!] || 'idle', 'Salvar Alterações')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
