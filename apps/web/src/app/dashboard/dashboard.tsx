"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/stats-card";
import DataTable from "@/components/data-table";
import StatusBadge from "@/components/status-badge";
import {
  GraduationCap,
  FileText,
  AlertCircle,
  Users,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

// Dados mock para demonstração
const mockStats = {
  totalMatriculas: 156,
  preMatriculas: 23,
  documentosPendentes: 8,
  vagasDisponiveis: 12,
};

type MatriculaRow = {
  id: string;
  protocolo: string;
  aluno: string;
  responsavel: string;
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  data: string;
};

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
    key: "status" as const,
    label: "Status",
    render: (value: string) => <StatusBadge status={value as any} />,
  },
  {
    key: "data" as const,
    label: "Data",
    sortable: true,
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockStats;
    },
  });

  const { data: matriculasRecentes, isLoading: matriculasLoading } = useQuery({
    queryKey: ["matriculas-recentes"],
    queryFn: async (): Promise<MatriculaRow[]> => {
      try {
        const result = await apiClient.get("/api/pre-matriculas?limit=5");
        const data = (result?.data || []) as Array<any>;
        // Mapear para o formato esperado pela tabela
        return data.map((item) => ({
          id: item.id,
          protocolo: item.protocoloLocal,
          aluno: item.aluno?.nome,
          responsavel: item.responsavel?.nome,
          status: item.status,
          data: new Date(item.createdAt).toISOString().slice(0, 10),
        }));
      } catch (error) {
        // Em caso de erro, retornar lista vazia para não quebrar o dashboard
        console.error("Erro ao buscar matrículas recentes:", error);
        return [];
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">
            {getGreeting()}, {user?.name}! Aqui está um resumo das suas
            atividades.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pre-matriculas">
            <Plus className="h-4 w-4 mr-2" />
            Nova Pré-Matrícula
          </Link>
        </Button>
      </div>

      {/* Cards de Estatísticas - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card principal - Total de Matrículas */}
        <div className="md:col-span-2 md:row-span-2">
          <StatsCard
            title="Total de Matrículas"
            value={stats?.totalMatriculas || 0}
            icon={GraduationCap}
            size="lg"
            trend={{
              value: 12,
              label: "vs mês anterior",
            }}
            className="h-full"
          />
        </div>

        {/* Card secundário - Pré-Matrículas */}
        <div className="md:col-span-1">
          <StatsCard
            title="Pré-Matrículas Pendentes"
            value={stats?.preMatriculas || 0}
            icon={FileText}
            size="md"
            trend={{
              value: -5,
              label: "vs semana anterior",
            }}
            className="h-full"
          />
        </div>

        {/* Card secundário - Documentos */}
        <div className="md:col-span-1">
          <StatsCard
            title="Documentos Pendentes"
            value={stats?.documentosPendentes || 0}
            icon={AlertCircle}
            size="md"
            className="h-full"
          />
        </div>

        {/* Card inferior - Vagas */}
        <div className="md:col-span-2">
          <StatsCard
            title="Vagas Disponíveis"
            value={stats?.vagasDisponiveis || 0}
            icon={Users}
            size="md"
            className="h-full"
          />
        </div>
      </div>

      {/* Matrículas Recentes */}
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Matrículas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            data={matriculasRecentes || []}
            columns={columns}
            searchKey="aluno"
            searchPlaceholder="Buscar por aluno..."
            pageSize={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
