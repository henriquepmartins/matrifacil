"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/data-table";
import StatusBadge from "@/components/status-badge";
import { Plus, Eye, Edit, GraduationCap, FileText } from "lucide-react";
import Link from "next/link";

// Dados mock para demonstração
const mockMatriculas = [
  {
    id: "1",
    protocolo: "MAT-2024-001",
    aluno: "João Silva Santos",
    responsavel: "Maria Silva",
    turma: "Maternal A - Manhã",
    status: "completo" as const,
    data: "2024-01-15",
  },
  {
    id: "2",
    protocolo: "MAT-2024-002",
    aluno: "Ana Costa Lima",
    responsavel: "Pedro Costa",
    turma: "Pré-Escola B - Tarde",
    status: "pendente_doc" as const,
    data: "2024-01-14",
  },
  {
    id: "3",
    protocolo: "MAT-2024-003",
    aluno: "Carlos Oliveira",
    responsavel: "Sandra Oliveira",
    turma: "Berçário C - Integral",
    status: "completo" as const,
    data: "2024-01-13",
  },
  {
    id: "4",
    protocolo: "MAT-2024-004",
    aluno: "Mariana Ferreira",
    responsavel: "Roberto Ferreira",
    turma: "Fundamental 1A - Manhã",
    status: "concluido" as const,
    data: "2024-01-12",
  },
  {
    id: "5",
    protocolo: "MAT-2024-005",
    aluno: "Lucas Rodrigues",
    responsavel: "Patricia Rodrigues",
    turma: "Maternal B - Tarde",
    status: "completo" as const,
    data: "2024-01-11",
  },
  {
    id: "6",
    protocolo: "MAT-2024-006",
    aluno: "Sofia Almeida",
    responsavel: "Carlos Almeida",
    turma: "Pré-Escola A - Manhã",
    status: "pendente_doc" as const,
    data: "2024-01-10",
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
    key: "turma" as const,
    label: "Turma",
    sortable: true,
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
        {item.status === "pendente_doc" && (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Docs
          </Button>
        )}
      </div>
    ),
  },
];

export default function MatriculasPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTurma, setFiltroTurma] = useState<string>("todos");

  const { data: matriculas, isLoading } = useQuery({
    queryKey: ["matriculas", filtroStatus, filtroTurma],
    queryFn: async () => {
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = [...mockMatriculas];

      if (filtroStatus !== "todos") {
        filtered = filtered.filter((item) => item.status === filtroStatus);
      }

      if (filtroTurma !== "todos") {
        filtered = filtered.filter((item) => item.turma.includes(filtroTurma));
      }

      return filtered;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matrículas</h1>
          <p className="text-muted-foreground">
            Gerencie as matrículas completas e acompanhe o status dos
            documentos.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/matriculas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Matrícula
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
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
                  <SelectItem value="completo">Completo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Turma</label>
              <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Berçário">Berçário</SelectItem>
                  <SelectItem value="Maternal">Maternal</SelectItem>
                  <SelectItem value="Pré-Escola">Pré-Escola</SelectItem>
                  <SelectItem value="Fundamental">Fundamental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Matrículas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={matriculas || []}
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
