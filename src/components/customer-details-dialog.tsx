"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Customer } from "@/lib/types"
import { CustomerAddresses } from "./customer-addresses"
import { CustomerContacts } from "./customer-contacts"

interface CustomerDetailsDialogProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailsDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  if (!customer) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
          <DialogDescription>{customer.companyName}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="addresses">
          <TabsList>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>
          <TabsContent value="addresses">
            <CustomerAddresses customerId={customer.id} />
          </TabsContent>
          <TabsContent value="contacts">
            <CustomerContacts customerId={customer.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
