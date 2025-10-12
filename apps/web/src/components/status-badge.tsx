"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "pre" | "pendente_doc" | "completo" | "concluido";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  pre: {
    label: "Pré-Matrícula",
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  pendente_doc: {
    label: "Pendente Doc.",
    variant: "secondary" as const,
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  completo: {
    label: "Completo",
    variant: "secondary" as const,
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  concluido: {
    label: "Concluído",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
