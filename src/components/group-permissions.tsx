"use client"
import { Skeleton } from "@/components/ui/skeleton";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NAVIGATION_ITEMS } from '@/lib/permissions';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/session-context";
import { ShieldCheck, Save } from 'lucide-react';
import { getUserGroups, updateUserGroup } from '@/lib/api.client';

const allPermissions = NAVIGATION_ITEMS.map(item => item.requiredRole).filter((value, index, self) => self.indexOf(value) === index);

export function GroupPermissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshSession } = useSession();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      const cachedGroups = queryClient.getQueryData<any[]>(['userGroups']);
      if (cachedGroups) {
        setGroups(cachedGroups);
        if (cachedGroups.length > 0 && !selectedGroup) {
          setSelectedGroup(cachedGroups[0]);
        }
      }

      try {
        const fetchedGroups = await getUserGroups();
        setGroups(fetchedGroups);
        queryClient.setQueryData(['userGroups'], fetchedGroups);
        if (fetchedGroups.length > 0 && !selectedGroup) {
          setSelectedGroup(fetchedGroups[0]);
        }
      } catch (error) {
        toast.error("Não foi possível carregar a lista de grupos.");
      }
    }

    fetchGroups();
  }, [toast, queryClient, selectedGroup]);

  const handlePermissionChange = (permission: string, checked: string | boolean) => {
    if (!selectedGroup) return;

    const currentRoles: string[] = selectedGroup.roles || [];
    const isChecked = checked === true;
    const updatedRoles: string[] = isChecked
      ? Array.from(new Set([...currentRoles, permission]))
      : currentRoles.filter(p => p !== permission);

    const updatedGroup = { ...selectedGroup, roles: updatedRoles };
    setSelectedGroup(updatedGroup);
  };

  const handleUpdateRoles = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    try {
      // Atualiza o grupo no backend com as novas roles
      await updateUserGroup(selectedGroup.id, {
        name: selectedGroup.name,
        roles: selectedGroup.roles || []
      });
      
      await refreshSession(); // Force session update for current user
      queryClient.invalidateQueries({ queryKey: ['userGroups'] }); // Invalidate cache
      
      toast.success(`As permissões para o grupo ${selectedGroup.name} foram salvas.`);
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      toast.error("Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-border/40">
      <CardHeader className="bg-muted/50 border-b border-border/40">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Grupos e Permissões</CardTitle>
            <CardDescription>Selecione um grupo para atribuir permissões de acesso.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Select onValueChange={(groupId) => {
            console.log("Selected groupId:", groupId);
            const group = groups.find(g => g.id === groupId);
            if (group) {
              setSelectedGroup(group);
              console.log("Permissions for selected group:", group.roles);
            }
          }} defaultValue={String(selectedGroup.id)}>
            <SelectTrigger className="w-full md:w-1/3 text-base py-6">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group.id} value={String(group.id)} className="text-base py-2">{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateRoles} disabled={isSaving} className="py-6 px-6 text-base">
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Salvando..." : "Salvar Permissões"}
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-background/50">
          <h3 className="text-lg font-semibold mb-4">Permissões para {selectedGroup.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPermissions.map(permission => (
              <div key={permission} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={permission}
                  checked={selectedGroup.roles?.includes(permission)}
                  onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                  className="h-5 w-5"
                />
                <label htmlFor={permission} className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {NAVIGATION_ITEMS.find(item => item.requiredRole === permission)?.title || permission}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}