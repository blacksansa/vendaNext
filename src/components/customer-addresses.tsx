"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CustomerAddress } from "@/lib/types"
import { getCustomerAddresses, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress } from "@/lib/api.client"
import { useToast } from "@/hooks/use-toast"

interface CustomerAddressesProps {
  customerId: number
}

export function CustomerAddresses({ customerId }: CustomerAddressesProps) {
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null)

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getCustomerAddresses(customerId)
        setAddresses(data)
      } catch (error: any) {
        toast.error("Error", { description: error.message })
      }
    }
    fetchAddresses()
  }, [customerId, toast])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newAddressData = Object.fromEntries(formData.entries()) as unknown as Partial<CustomerAddress>

    try {
      const newAddress = await createCustomerAddress(customerId, newAddressData)
      setAddresses([...addresses, newAddress])
      toast.success("Success", { description: "Address created successfully." })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAddress) return

    const formData = new FormData(event.currentTarget)
    const updatedAddressData = Object.fromEntries(formData.entries()) as unknown as Partial<CustomerAddress>

    try {
      const updatedAddress = await updateCustomerAddress(selectedAddress.id, updatedAddressData)
      setAddresses(addresses.map(a => a.id === updatedAddress.id ? updatedAddress : a))
      toast.success("Success", { description: "Address updated successfully." })
      setIsEditDialogOpen(false)
      setSelectedAddress(null)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  const handleDelete = async () => {
    if (!selectedAddress) return

    try {
      await deleteCustomerAddress(selectedAddress.id)
      setAddresses(addresses.filter(a => a.id !== selectedAddress.id))
      toast.success("Success", { description: "Address deleted successfully." })
      setIsDeleteDialogOpen(false)
      setSelectedAddress(null)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Address</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Street</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Zip</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addresses.map(address => (
            <TableRow key={address.id}>
              <TableCell>{address.street}</TableCell>
              <TableCell>{address.city}</TableCell>
              <TableCell>{address.state}</TableCell>
              <TableCell>{address.zip}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedAddress(address); setIsEditDialogOpen(true); }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setSelectedAddress(address); setIsDeleteDialogOpen(true); }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Address Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="street-add" className="text-right">Street</Label>
                <Input id="street-add" name="street" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number-add" className="text-right">Number</Label>
                <Input id="number-add" name="number" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="complement-add" className="text-right">Complement</Label>
                <Input id="complement-add" name="complement" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="district-add" className="text-right">District</Label>
                <Input id="district-add" name="district" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city-add" className="text-right">City</Label>
                <Input id="city-add" name="city" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state-add" className="text-right">State</Label>
                <Input id="state-add" name="state" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zip-add" className="text-right">Zip</Label>
                <Input id="zip-add" name="zip" required className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Address</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="street-edit" className="text-right">Street</Label>
                <Input id="street-edit" name="street" defaultValue={selectedAddress?.street} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number-edit" className="text-right">Number</Label>
                <Input id="number-edit" name="number" defaultValue={selectedAddress?.number} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="complement-edit" className="text-right">Complement</Label>
                <Input id="complement-edit" name="complement" defaultValue={selectedAddress?.complement} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="district-edit" className="text-right">District</Label>
                <Input id="district-edit" name="district" defaultValue={selectedAddress?.district} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city-edit" className="text-right">City</Label>
                <Input id="city-edit" name="city" defaultValue={selectedAddress?.city} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state-edit" className="text-right">State</Label>
                <Input id="state-edit" name="state" defaultValue={selectedAddress?.state} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zip-edit" className="text-right">Zip</Label>
                <Input id="zip-edit" name="zip" defaultValue={selectedAddress?.zip} required className="col-span-3" />
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
              This action cannot be undone. This will permanently delete the address.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
