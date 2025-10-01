'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TeamFormProps {
  onSubmit: (values: { code: string; name: string; active: boolean }) => void;
  initialData?: { code: string; name: string; active: boolean };
}

export function TeamForm({ onSubmit, initialData }: TeamFormProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [active, setActive] = useState(initialData?.active || true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ code, name, active });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="active" checked={active} onCheckedChange={setActive} />
        <Label htmlFor="active">Active</Label>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
