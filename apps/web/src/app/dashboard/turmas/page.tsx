"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/data-table";
import ProtectedRoute from "@/components/protected-route";
import { Plus, Users, GraduationCap, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

// Dados mock para demonstração
const mockTurmas = [
  {
    id: "1",
    nome: "Berçário A",
    etapa: "bercario",
    turno: "integral",
    capacidade: 15,
    vagasDisponiveis: 3,
    anoLetivo: "2024",
    ativa: true,
    alunos: 12,
  },
  {
    id: "2",
    nome: "Maternal A",
    etapa: "maternal",
    turno: "manha",
    capacidade: 20,
    vagasDisponiveis: 5,
    anoLetivo: "2024",
    ativa: true,
    alunos: 15,
  },
  {
    id: "3",
    nome: "Maternal B",
    etapa: "maternal",
    turno: "tarde",
    capacidade: 20,
    vagasDisponiveis: 0,
    anoLetivo: "2024",
    ativa: true,
    alunos: 20,
  },
  {
    id: "4",
    nome: "Pré-Escola A",
    etapa: "pre_escola",
    turno: "manha",
    capacidade: 25,
    vagasDisponiveis: 8,
    anoLetivo: "2024",
    ativa: true,
    alunos: 17,
  },
  {
    id: "5",
    nome: "Pré-Escola B",
    etapa: "pre_escola",
    turno: "tarde",
    capacidade: 25,
    vagasDisponiveis: 2,
    anoLetivo: "2024",
    ativa: true,
    alunos: 23,
  },
  {
    id: "6",
    nome: "Fundamental 1A",
    etapa: "fundamental",
    turno: "manha",
    capacidade: 30,
    vagasDisponiveis: 12,
    anoLetivo: "2024",
    ativa: true,
    alunos: 18,
  },
];

const getEtapaLabel = (etapa: string) => {
  const labels = {
    bercario: "Berçário",
    maternal: "Maternal",
    pre_escola: "Pré-Escola",
    fundamental: "Fundamental",
  };
  return labels[etapa as keyof typeof labels] || etapa;
};

const getTurnoLabel = (turno: string) => {
  const labels = {
    manha: "Manhã",
    tarde: "Tarde",
    integral: "Integral",
  };
  return labels[turno as keyof typeof labels] || turno;
};

const columns = [
  {
    key: "nome" as const,
    label: "Nome da Turma",
    sortable: true,
  },
  {
    key: "etapa" as const,
    label: "Etapa",
    render: (value: string) => getEtapaLabel(value),
    sortable: true,
  },
  {
    key: "turno" as const,
    label: "Turno",
    render: (value: string) => getTurnoLabel(value),
    sortable: true,
  },
  {
    key: "alunos" as const,
    label: "Alunos",
    sortable: true,
  },
  {
    key: "capacidade" as const,
    label: "Capacidade",
    sortable: true,
  },
  {
    key: "vagasDisponiveis" as const,
    label: "Vagas",
    render: (value: number, item: any) => (
      <div className="flex items-center gap-2">
        <span
          className={
            value === 0
              ? "text-red-600 font-medium"
              : "text-green-600 font-medium"
          }
        >
          {value}
        </span>
        {value === 0 && (
          <Badge variant="destructive" className="text-xs">
            Lotada
          </Badge>
        )}
        {value > 0 && value <= 3 && (
          <Badge variant="secondary" className="text-xs">
            Quase lotada
          </Badge>
        )}
      </div>
    ),
    sortable: true,
  },
  {
    key: "ativa" as const,
    label: "Status",
    render: (value: boolean) => (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Ativa" : "Inativa"}
      </Badge>
    ),
  },
  {
    key: "acoes" as const,
    label: "Ações",
    render: (value: any, item: any) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" />
          Alunos
        </Button>
        <Button variant="outline" size="sm">
          <GraduationCap className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </div>
    ),
  },
];

export default function TurmasPage() {
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todos");
  const [filtroTurno, setFiltroTurno] = useState<string>("todos");

  const { data: turmas, isLoading } = useQuery({
    queryKey: ["turmas", filtroEtapa, filtroTurno],
    queryFn: async () => {
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filtered = [...mockTurmas];

      if (filtroEtapa !== "todos") {
        filtered = filtered.filter((item) => item.etapa === filtroEtapa);
      }

      if (filtroTurno !== "todos") {
        filtered = filtered.filter((item) => item.turno === filtroTurno);
      }

      return filtered;
    },
  });

  return (
    <ProtectedRoute permission="canAccessTurmas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
            <p className="text-muted-foreground">
              Gerencie as turmas e acompanhe a disponibilidade de vagas.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/turmas/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Link>
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Turmas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{turmas?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vagas Disponíveis
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {turmas?.reduce(
                  (acc, turma) => acc + turma.vagasDisponiveis,
                  0
                ) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Turmas Lotadas
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {turmas?.filter((turma) => turma.vagasDisponiveis === 0)
                  .length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
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
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Turno</label>
                <Select value={filtroTurno} onValueChange={setFiltroTurno}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Turmas</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={turmas || []}
              columns={columns}
              searchKey="nome"
              searchPlaceholder="Buscar por turma..."
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
