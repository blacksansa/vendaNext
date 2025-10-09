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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerContact, ContactType } from "@/lib/types"
import { getCustomerContacts, createCustomerContact, updateCustomerContact, deleteCustomerContact, getContactTypes } from "@/lib/api.client"
import { useToast } from "@/hooks/use-toast"

interface CustomerContactsProps {
  customerId: number
}

export function CustomerContacts({ customerId }: CustomerContactsProps) {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<CustomerContact[]>([])
  const [contactTypes, setContactTypes] = useState<ContactType[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<CustomerContact | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getCustomerContacts(customerId)
        setContacts(data)
      } catch (error: any) {
        toast.error("Error", { description: error.message })
      }
    }
    fetchContacts()
  }, [customerId, toast])

  useEffect(() => {
    const fetchContactTypes = async () => {
      try {
        const data = await getContactTypes()
        setContactTypes(data)
      } catch (error: any) {
        toast.error("Error", { description: error.message })
      }
    }
    fetchContactTypes()
  }, [toast])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newContactData = Object.fromEntries(formData.entries()) as unknown as Partial<CustomerContact>

    try {
      const newContact = await createCustomerContact(customerId, newContactData)
      setContacts([...contacts, newContact])
      toast.success("Success", { description: "Contact created successfully." })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedContact) return

    const formData = new FormData(event.currentTarget)
    const updatedContactData = Object.fromEntries(formData.entries()) as unknown as Partial<CustomerContact>

    try {
      const updatedContact = await updateCustomerContact(selectedContact.id, updatedContactData)
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c))
      toast.success("Success", { description: "Contact updated successfully." })
      setIsEditDialogOpen(false)
      setSelectedContact(null)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  const handleDelete = async () => {
    if (!selectedContact) return

    try {
      await deleteCustomerContact(selectedContact.id)
      setContacts(contacts.filter(c => c.id !== selectedContact.id))
      toast.success("Success", { description: "Contact deleted successfully." })
      setIsDeleteDialogOpen(false)
      setSelectedContact(null)
    } catch (error: any) {
      toast.error("Error", { description: error.message })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Contact</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map(contact => (
            <TableRow key={contact.id}>
              <TableCell>{contact.contactType.name}</TableCell>
              <TableCell>{contact.contact}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedContact(contact); setIsEditDialogOpen(true); }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setSelectedContact(contact); setIsDeleteDialogOpen(true); }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactType-add" className="text-right">Type</Label>
                <Select name="contactType">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact-add" className="text-right">Contact</Label>
                <Input id="contact-add" name="contact" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observation-add" className="text-right">Observation</Label>
                <Input id="observation-add" name="observation" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactType-edit" className="text-right">Type</Label>
                <Select name="contactType" defaultValue={selectedContact?.contactType.id.toString()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact-edit" className="text-right">Contact</Label>
                <Input id="contact-edit" name="contact" defaultValue={selectedContact?.contact} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observation-edit" className="text-right">Observation</Label>
                <Input id="observation-edit" name="observation" defaultValue={selectedContact?.observation} className="col-span-3" />
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
              This action cannot be undone. This will permanently delete the contact.
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
