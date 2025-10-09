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
import { Seller } from "@/lib/types";
import { useRouter } from "next/navigation";
import { createSeller, updateSeller, deleteSeller } from "@/lib/api.client";
import { useToast } from "@/hooks/use-toast";
import { SellerForm } from "./seller-form";

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

interface SellersViewProps {
  initialSellers: Seller[];
}

export function SellersView({ initialSellers }: SellersViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>(initialSellers);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const handleCreate = async (data: Partial<Seller>) => {
    try {
      const newSeller = await createSeller(data);
      setSellers([newSeller, ...sellers]);
      toast({ title: "Success", description: "Seller created successfully." });
      setIsAddDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSeller) return;

    const formData = new FormData(event.currentTarget);
    const updatedSellerData = Object.fromEntries(formData.entries()) as unknown as Partial<Seller>;

    try {
      const updatedSeller = await updateSeller(selectedSeller.id, updatedSellerData);
      setSellers(sellers.map(s => s.id === updatedSeller.id ? updatedSeller : s));
      toast({ title: "Success", description: "Seller updated successfully." });
      setIsEditDialogOpen(false);
      setSelectedSeller(null);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async () => {
    if (!selectedSeller) return;

    try {
      await deleteSeller(selectedSeller.id);
      setSellers(sellers.filter(s => s.id !== selectedSeller.id));
      toast({ title: "Success", description: "Seller deleted successfully." });
      setIsDeleteDialogOpen(false);
      setSelectedSeller(null);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const filteredSellers = sellers.filter((seller) => {
    const name = seller.name;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Seller Database</CardTitle>
              <CardDescription>Manage and track all your sellers</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Seller
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.length > 0 ? (
                filteredSellers.map((seller) => (
                  <TableRow key={seller.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(seller.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{seller.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {seller.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{seller.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{seller.nickname}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{seller.user?.firstName} {seller.user?.lastName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{seller.teams?.map(t => t.name).join(', ') || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDate(seller.updatedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedSeller(seller); setIsEditDialogOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Seller
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedSeller(seller); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Seller
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-muted-foreground">No sellers found matching your criteria.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Seller Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Seller</DialogTitle>
            <DialogDescription>Create a new seller.</DialogDescription>
          </DialogHeader>
          <SellerForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* Edit Seller Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Seller</DialogTitle>
            <DialogDescription>Update the seller's information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-edit" className="text-right">Name</Label>
                <Input id="name-edit" name="name" defaultValue={selectedSeller?.name} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code-edit" className="text-right">Code</Label>
                <Input id="code-edit" name="code" defaultValue={selectedSeller?.code} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname-edit" className="text-right">Nickname</Label>
                <Input id="nickname-edit" name="nickname" defaultValue={selectedSeller?.nickname} className="col-span-3" />
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
              This action cannot be undone. This will permanently delete the seller: <span className="font-semibold">{selectedSeller?.name}</span>.
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
