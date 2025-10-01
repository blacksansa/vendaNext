'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StageFormProps {
  onSubmit: (values: { name: string; color: number }) => void;
  initialData?: { name: string; color: number };
}

export function StageForm({ onSubmit, initialData }: StageFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(initialData?.color || 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name, color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Stage Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={`#${color.toString(16).padStart(6, '0')}`}
          onChange={(e) => setColor(parseInt(e.target.value.substring(1), 16))}
          required
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
