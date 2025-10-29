import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Filter } from "lucide-react";

interface FiltersProps {
  filtroResponsavel: string;
  setFiltroResponsavel: (value: string) => void;
  filtroPrioridade: string;
  setFiltroPrioridade: (value: string) => void;
  responsaveis: {
    id: string;
    nome: string;
  }[];
}

export function Filters({ filtroResponsavel, setFiltroResponsavel, filtroPrioridade, setFiltroPrioridade, responsaveis }: FiltersProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Responsáveis</SelectItem>
              <SelectItem value="grupos">Apenas Grupos</SelectItem>
              <SelectItem value="vendedores">Apenas Vendedores</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          {/* Export e Nova Tarefa removidos */}
        </div>
      </CardContent>
    </Card>
  );
}
