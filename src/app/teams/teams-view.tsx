'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
  Download,
} from "lucide-react";
import { Team } from "@/lib/types";
import { useRouter } from "next/navigation";
import { createTeam, updateTeam, deleteTeam } from "@/lib/api.client";
import { useToast } from "@/hooks/use-toast";
import { TeamForm } from "./team-form";

// Helper functions
const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleDateString();
};

interface TeamsViewProps {
  initialTeams: Team[];
}

export function TeamsView({ initialTeams }: TeamsViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleCreate = async (data: Partial<Team>) => {
    try {
      const newTeam = await createTeam(data);
      setTeams([newTeam, ...teams]);
      toast({ title: "Success", description: "Team created successfully." });
      setIsAddDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(event.currentTarget);
    const updatedTeamData = Object.fromEntries(formData.entries()) as unknown as Partial<Team>;

    try {
      const updatedTeam = await updateTeam(selectedTeam.id, updatedTeamData);
      setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
      toast({ title: "Success", description: "Team updated successfully." });
      setIsEditDialogOpen(false);
      setSelectedTeam(null);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;

    try {
      await deleteTeam(selectedTeam.id);
      setTeams(teams.filter(t => t.id !== selectedTeam.id));
      toast({ title: "Success", description: "Team deleted successfully." });
      setIsDeleteDialogOpen(false);
      setSelectedTeam(null);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (team.active ? "active" : "inactive") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (active: boolean) => (active ? "default" : "secondary");

  return (
    <>
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Team Database</CardTitle>
              <CardDescription>Manage and track all your teams</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sellers</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <TableRow key={team.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(team.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{team.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {team.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{team.code || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(team.active)} className="text-xs">
                        {team.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{team.sellers?.length || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDate(team.updatedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedTeam(team); setIsEditDialogOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedTeam(team); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-muted-foreground">No teams found matching your criteria.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Team Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Create a new team.</DialogDescription>
          </DialogHeader>
          <TeamForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update the team's information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-edit" className="text-right">Name</Label>
                <Input id="name-edit" name="name" defaultValue={selectedTeam?.name} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code-edit" className="text-right">Code</Label>
                <Input id="code-edit" name="code" defaultValue={selectedTeam?.code} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active-edit" className="text-right">Status</Label>
                <Select name="active" defaultValue={selectedTeam?.active ? "true" : "false"}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the team: <span className="font-semibold">{selectedTeam?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
