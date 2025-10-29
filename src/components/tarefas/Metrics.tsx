import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface MetricSet {
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  atrasadas: number;
  produtividade: number;
  tempoMedio: number;
}

interface MetricsProps {
  metricas: MetricSet & { previous?: Partial<MetricSet> };
}

function formatDeltaNumber(current: number, previous?: number) {
  if (previous === undefined) return "—";
  const diff = current - previous;
  if (diff === 0) return "0";
  return `${diff > 0 ? "+" : ""}${diff}`;
}

function formatDeltaPercent(current: number, previous?: number) {
  if (previous === undefined) return "—";
  const diff = current - previous;
  if (diff === 0) return "0%";
  return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
}

export function Metrics({ metricas }: MetricsProps) {
  const prev = metricas.previous;

  const deltaTotal = formatDeltaNumber(metricas.totalTarefas, prev?.totalTarefas);
  const deltaProd = formatDeltaPercent(metricas.produtividade, prev?.produtividade);
  const deltaConcluidas = formatDeltaNumber(metricas.concluidas, prev?.concluidas);
  const deltaAtrasadas = formatDeltaNumber(metricas.atrasadas, prev?.atrasadas);

  const deltaClass = (value: string) => {
    if (value === "—" || value === "0") return "text-muted-foreground";
    return value.startsWith("+") ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tarefas</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metricas.totalTarefas}</div>
          <p className="text-xs text-muted-foreground">
            <span className={deltaClass(deltaTotal)}>{deltaTotal}</span> esta semana
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Produtividade</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metricas.produtividade}%</div>
          <p className="text-xs text-muted-foreground">
            <span className={deltaClass(deltaProd)}>{deltaProd}</span> do mês passado
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metricas.concluidas}</div>
          <p className="text-xs text-muted-foreground">
            <span className={deltaClass(deltaConcluidas)}>{deltaConcluidas}</span> hoje
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metricas.atrasadas}</div>
          <p className="text-xs text-muted-foreground">
            <span className={deltaClass(deltaAtrasadas)}>{deltaAtrasadas}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
