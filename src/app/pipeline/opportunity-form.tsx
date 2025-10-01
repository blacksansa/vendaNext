'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomers } from '@/lib/api.client';
import { Customer } from '@/lib/types';

interface OpportunityFormProps {
  onSubmit: (values: { customerId: number; items: { productId: number; quantity: number; price: number }[] }) => void;
}

export function OpportunityForm({ onSubmit }: OpportunityFormProps) {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<{ productId: number; quantity: number; price: number }[]>([]);

  const handleSearchCustomers = async () => {
    const fetchedCustomers = await getCustomers(searchTerm);
    setCustomers(fetchedCustomers);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customerId) {
      onSubmit({ customerId, items });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="customer">Customer</Label>
        <div className="flex gap-2">
          <Input
            id="customer-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a customer..."
          />
          <Button type="button" onClick={handleSearchCustomers}>Search</Button>
        </div>
        <div className="space-y-2">
          {customers.map(customer => (
            <div key={customer.id} className={`p-2 rounded-lg cursor-pointer ${customerId === customer.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}` } onClick={() => setCustomerId(customer.id)}>
              {customer.name}
            </div>
          ))}
        </div>
      </div>
      {/* Add logic for adding items to the opportunity */}
      <Button type="submit" disabled={!customerId}>Save</Button>
    </form>
  );
}
