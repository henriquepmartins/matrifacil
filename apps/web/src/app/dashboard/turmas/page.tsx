"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/data-table";
import { Plus, Users, GraduationCap, Clock, CheckCircle, Eye, Sunrise, Sunset, Sun } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface Turma {
  id: string;
  nome: string;
  etapa: string;
  turno: string;
  capacidade: number;
  vagasDisponiveis: number;
  anoLetivo: string;
  ativa: boolean;
}

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

const getOcupacaoPercentual = (capacidade: number, vagasDisponiveis: number) => {
  if (capacidade === 0) return 0;
  const ocupados = capacidade - vagasDisponiveis;
  return (ocupados / capacidade) * 100;
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
    key: "capacidade" as const,
    label: "Ocupação",
    render: (_: number, item: Turma) => {
      const ocupados = item.capacidade - item.vagasDisponiveis;
      const percentual = getOcupacaoPercentual(item.capacidade, item.vagasDisponiveis);
      
      return (
        <div className="w-full min-w-[120px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">{ocupados}/{item.capacidade}</span>
            <span className="text-muted-foreground">{percentual.toFixed(0)}%</span>
          </div>
          <Progress value={percentual} className="h-2" />
        </div>
      );
    },
    sortable: true,
  },
  {
    key: "vagasDisponiveis" as const,
    label: "Vagas",
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <span
          className={`font-medium ${
            value === 0
              ? "text-red-600"
              : value <= 3
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {value}
        </span>
        {value === 0 && (
          <Badge variant="destructive" className="text-xs">
            Lotada
          </Badge>
        )}
        {value > 0 && value <= 3 && (
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
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
    key: "id" as const,
    label: "Ações",
    render: (id: string) => (
      <Button size="sm" variant="outline" asChild>
        <Link href={`/dashboard/turmas/${id}`}>
          <Eye className="h-4 w-4 mr-1" />
          Ver Detalhes
        </Link>
      </Button>
    ),
  },
];

export default function TurmasPage() {
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todos");
  const [filtroTurno, setFiltroTurno] = useState<string>("todos");

  const { data: response, isLoading } = useQuery({
    queryKey: ["turmas", filtroEtapa, filtroTurno],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtroEtapa !== "todos") params.append("etapa", filtroEtapa);
      if (filtroTurno !== "todos") params.append("turno", filtroTurno);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/api/turmas?${queryString}` : "/api/turmas";
      
      return apiClient.get<{ success: boolean; data: Turma[] }>(endpoint);
    },
  });

  const turmas = response?.data || [];

  // Calcular estatísticas por turno
  const estatisticasPorTurno = useMemo(() => {
    const stats = {
      manha: { total: 0, vagas: 0 },
      tarde: { total: 0, vagas: 0 },
      integral: { total: 0, vagas: 0 },
    };

    turmas.forEach((turma) => {
      const turno = turma.turno as keyof typeof stats;
      if (stats[turno]) {
        stats[turno].total++;
        stats[turno].vagas += turma.vagasDisponiveis;
      }
    });

    return stats;
  }, [turmas]);

  return (
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
            <Link href="/dashboard/pre-matriculas/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Link>
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Turmas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{turmas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {turmas.filter(t => t.ativa).length} ativas
              </p>
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
                {turmas.reduce((acc, turma) => acc + turma.vagasDisponiveis, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {turmas.reduce((acc, t) => acc + t.capacidade, 0)} vagas totais
              </p>
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
                {turmas.filter((turma) => turma.vagasDisponiveis === 0).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {turmas.filter(t => t.vagasDisponiveis > 0 && t.vagasDisponiveis <= 3).length} quase lotadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Por Turno
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Sunrise className="h-3 w-3 text-orange-500" />
                    <span>Manhã:</span>
                  </div>
                  <span className="font-medium">{estatisticasPorTurno.manha.total} ({estatisticasPorTurno.manha.vagas} vagas)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Sunset className="h-3 w-3 text-blue-500" />
                    <span>Tarde:</span>
                  </div>
                  <span className="font-medium">{estatisticasPorTurno.tarde.total} ({estatisticasPorTurno.tarde.vagas} vagas)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-yellow-500" />
                    <span>Integral:</span>
                  </div>
                  <span className="font-medium">{estatisticasPorTurno.integral.total} ({estatisticasPorTurno.integral.vagas} vagas)</span>
                </div>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando turmas...</p>
                </div>
              </div>
            ) : (
              <DataTable
                data={turmas}
                columns={columns}
                searchKey="nome"
                searchPlaceholder="Buscar por turma..."
                pageSize={10}
              />
            )}
          </CardContent>
        </Card>
      </div>
  );
}
