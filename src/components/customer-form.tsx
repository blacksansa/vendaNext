"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  onSubmit: (values: { code: string; name: string; companyName: string }) => void;
}

export function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ code, name, companyName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="companyName">Razão Social</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Salvar</Button>
    </form>
  );
}