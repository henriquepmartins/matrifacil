"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/data-table";
import StatusBadge from "@/components/status-badge";
import { Plus, Eye, Edit, FileText } from "lucide-react";
import Link from "next/link";

// Dados mock para demonstração
const mockPreMatriculas = [
  {
    id: "1",
    protocolo: "PRE-2024-001",
    aluno: "João Silva Santos",
    responsavel: "Maria Silva",
    telefone: "(11) 99999-9999",
    etapa: "maternal",
    status: "pre" as const,
    data: "2024-01-15",
  },
  {
    id: "2",
    protocolo: "PRE-2024-002",
    aluno: "Ana Costa Lima",
    responsavel: "Pedro Costa",
    telefone: "(11) 88888-8888",
    etapa: "pre_escola",
    status: "pre" as const,
    data: "2024-01-14",
  },
  {
    id: "3",
    protocolo: "PRE-2024-003",
    aluno: "Carlos Oliveira",
    responsavel: "Sandra Oliveira",
    telefone: "(11) 77777-7777",
    etapa: "bercario",
    status: "pre" as const,
    data: "2024-01-13",
  },
  {
    id: "4",
    protocolo: "PRE-2024-004",
    aluno: "Mariana Ferreira",
    responsavel: "Roberto Ferreira",
    telefone: "(11) 66666-6666",
    etapa: "fundamental",
    status: "pre" as const,
    data: "2024-01-12",
  },
  {
    id: "5",
    protocolo: "PRE-2024-005",
    aluno: "Lucas Rodrigues",
    responsavel: "Patricia Rodrigues",
    telefone: "(11) 55555-5555",
    etapa: "maternal",
    status: "pre" as const,
    data: "2024-01-11",
  },
];

const columns = [
  {
    key: "protocolo" as const,
    label: "Protocolo",
    sortable: true,
  },
  {
    key: "aluno" as const,
    label: "Aluno",
    sortable: true,
  },
  {
    key: "responsavel" as const,
    label: "Responsável",
    sortable: true,
  },
  {
    key: "telefone" as const,
    label: "Telefone",
  },
  {
    key: "etapa" as const,
    label: "Etapa",
    render: (value: string) => (
      <span className="capitalize">{value.replace("_", " ")}</span>
    ),
  },
  {
    key: "status" as const,
    label: "Status",
    render: (value: string) => <StatusBadge status={value as any} />,
  },
  {
    key: "data" as const,
    label: "Data",
    sortable: true,
  },
  {
    key: "acoes" as const,
    label: "Ações",
    render: (value: any, item: any) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </div>
    ),
  },
];

export default function PreMatriculasPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todos");

  const { data: preMatriculas, isLoading } = useQuery({
    queryKey: ["pre-matriculas", filtroStatus, filtroEtapa],
    queryFn: async () => {
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = [...mockPreMatriculas];

      if (filtroStatus !== "todos") {
        filtered = filtered.filter((item) => item.status === filtroStatus);
      }

      if (filtroEtapa !== "todos") {
        filtered = filtered.filter((item) => item.etapa === filtroEtapa);
      }

      return filtered;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pré-Matrículas</h1>
          <p className="text-muted-foreground">
            Gerencie as pré-matrículas e converta-as em matrículas completas.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pre-matriculas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Pré-Matrícula
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pre">Pré-Matrícula</SelectItem>
                  <SelectItem value="pendente_doc">
                    Pendente Documentos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Etapa</label>
              <Select value={filtroEtapa} onValueChange={setFiltroEtapa}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="bercario">Berçário</SelectItem>
                  <SelectItem value="maternal">Maternal</SelectItem>
                  <SelectItem value="pre_escola">Pré-Escola</SelectItem>
                  <SelectItem value="fundamental">Fundamental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pré-Matrículas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={preMatriculas || []}
            columns={columns}
            searchKey="aluno"
            searchPlaceholder="Buscar por aluno..."
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
