import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const statusMap = {
  PENDING: {
    label: "Pendentes",
    icon: Clock,
    color: "text-orange-500",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    icon: AlertCircle,
    color: "text-blue-500",
  },
  DONE: {
    label: "Concluídas",
    icon: CheckCircle,
    color: "text-green-500",
  },
  CANCELED: {
    label: "Canceladas",
    icon: XCircle,
    color: "text-red-500",
  },
};

export type TaskStatus = keyof typeof statusMap;

export const statusList = Object.keys(statusMap) as TaskStatus[];
