"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NAVIGATION_ITEMS } from '@/lib/permissions';
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Save } from 'lucide-react';
import { getUserGroups, updateUserGroup } from '@/lib/api.client';

const allPermissions = NAVIGATION_ITEMS.map(item => item.requiredRole).filter((value, index, self) => self.indexOf(value) === index);

export function GroupPermissions() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const fetchedGroups = await getUserGroups();
        setGroups(fetchedGroups);
        if (fetchedGroups.length > 0) {
          setSelectedGroup(fetchedGroups[0]);
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar grupos",
          description: "Não foi possível carregar a lista de grupos.",
          variant: "destructive",
        });
      }
    }

    fetchGroups();
  }, [toast]);

  const handlePermissionChange = (permission, checked) => {
    if (!selectedGroup) return;

    const updatedPermissions = checked
      ? [...selectedGroup.permissions, permission]
      : selectedGroup.permissions.filter(p => p !== permission);

    const updatedGroup = { ...selectedGroup, permissions: updatedPermissions };
    setSelectedGroup(updatedGroup);
  };

  const handleUpdateRoles = async () => {
    if (!selectedGroup) return;

    try {
      await updateUserGroup(selectedGroup.id, { roles: selectedGroup.permissions });
      toast({
        title: "Funções atualizadas!",
        description: `As permissões para o grupo ${selectedGroup.name} foram salvas.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar permissões",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  if (!selectedGroup) {
    return <div>Loading...</div>;
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
          <Select onValueChange={(groupId) => setSelectedGroup(groups.find(g => g.id === Number(groupId))!)} defaultValue={String(selectedGroup.id)}>
            <SelectTrigger className="w-full md:w-1/3 text-base py-6">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group.id} value={String(group.id)} className="text-base py-2">{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateRoles} className="py-6 px-6 text-base">
            <Save className="mr-2 h-5 w-5" />
            Salvar Permissões
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-background/50">
          <h3 className="text-lg font-semibold mb-4">Permissões para {selectedGroup.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPermissions.map(permission => (
              <div key={permission} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={permission}
                  checked={selectedGroup.permissions?.includes(permission)}
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