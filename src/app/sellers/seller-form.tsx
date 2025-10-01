'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SellerFormProps {
  onSubmit: (values: { code: string; name: string; nickname: string }) => void;
  initialData?: { code: string; name: string; nickname: string };
}

export function SellerForm({ onSubmit, initialData }: SellerFormProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [nickname, setNickname] = useState(initialData?.nickname || "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ code, name, nickname });
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
      <div className="grid gap-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
