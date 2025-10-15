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
import MatriculaActionsMenu from "@/components/matricula-actions-menu";
import { Plus, Eye, Edit, GraduationCap, FileText } from "lucide-react";
import Link from "next/link";

type MatriculaRow = {
  id: string;
  protocolo: string;
  aluno: string;
  responsavel: string;
  turma: string | null;
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  data: string;
  cuidadora?: boolean;
  actions?: any; // Para a coluna de ações
  // Dados completos da API
  alunoData?: {
    id: string;
    nome: string;
    dataNascimento: string;
    etapa: string;
    necessidadesEspeciais: boolean;
    observacoes: string | null;
  };
  responsavelData?: {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    bairro: string;
    email: string | null;
    parentesco: string;
    autorizadoRetirada: boolean;
  };
  turmaData?: {
    id: string;
    nome: string;
    etapa: string;
    turno: string;
  };
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
    key: "cuidadora" as const,
    label: "Cuidadora",
    render: (_: any, item: any) =>
      item.cuidadora ? (
        <span className="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
          Necessária
        </span>
      ) : (
        <span className="text-xs text-muted-foreground text-center flex justify-center">
          —
        </span>
      ),
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
    key: "actions" as const,
    label: "Ações",
    render: (_: any, item: any) => <MatriculaActionsMenu matricula={item} />,
  },
];

export default function MatriculasPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTurma, setFiltroTurma] = useState<string>("todos");

  const { data: matriculas, isLoading } = useQuery({
    queryKey: ["matriculas", filtroStatus, filtroTurma],
    queryFn: async (): Promise<MatriculaRow[]> => {
      const params = new URLSearchParams();
      if (filtroStatus !== "todos") params.set("status", filtroStatus);
      if (filtroTurma !== "todos") params.set("etapa", filtroTurma);
      const response = await fetch(
        `http://localhost:3000/api/matriculas?${params.toString()}`
      );
      if (!response.ok) return [];
      const result = await response.json();
      const data = (result?.data || []) as Array<any>;
      return data.map((item) => ({
        id: item.id,
        protocolo: item.protocoloLocal,
        aluno: item.aluno?.nome,
        responsavel: item.responsavel?.nome,
        turma: item.turma ? `${item.turma.nome} - ${item.turma.turno}` : null,
        status: item.status,
        data: new Date(item.createdAt).toISOString().slice(0, 10),
        cuidadora: Boolean(item.aluno?.necessidadesEspeciais),
        // Dados completos para o modal
        alunoData: item.aluno,
        responsavelData: item.responsavel,
        turmaData: item.turma,
      }));
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
