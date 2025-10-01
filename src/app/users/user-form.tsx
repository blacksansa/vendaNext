'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UserFormProps {
  onSubmit: (values: { firstName: string; lastName: string; email: string; enabled: boolean }) => void;
  initialData?: { firstName: string; lastName: string; email: string; enabled: boolean };
}

export function UserForm({ onSubmit, initialData }: UserFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [enabled, setEnabled] = useState(initialData?.enabled || true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ firstName, lastName, email, enabled });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="enabled">Enabled</Label>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
