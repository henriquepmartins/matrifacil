"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import PreMatriculaEditDialog from "@/components/pre-matricula-edit-dialog";
import { Plus, Eye, Edit, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { API_URL } from "@/lib/api-client";

interface PreMatricula {
  id: string;
  protocoloLocal: string;
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  dataMatricula: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  aluno: {
    id: string;
    nome: string;
    dataNascimento: string;
    etapa: string;
    necessidadesEspeciais: boolean;
    observacoes: string | null;
  };
  responsavel: {
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
  turma?: {
    id: string;
    nome: string;
    etapa: string;
    turno: string;
  } | null;
}

type PreMatriculaRow = PreMatricula & { alunoNome: string };

export default function PreMatriculasPage() {
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todos");
  const [editingPreMatricula, setEditingPreMatricula] =
    useState<PreMatricula | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: allPreMatriculas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pre-matriculas"],
    queryFn: async () => {
      console.log("🔍 Buscando pré-matrículas...");
      const response = await fetch(`${API_URL}/api/pre-matriculas`);
      console.log("📡 Response status:", response.status);
      if (!response.ok) {
        throw new Error("Erro ao buscar pré-matrículas");
      }
      const result = await response.json();
      console.log("📊 Resultado da API:", result);
      console.log("📋 Dados:", result.data);
      return result.data;
    },
  });

  const preMatriculas = allPreMatriculas?.filter((item: PreMatricula) => {
    const statusMatch =
      filtroStatus === "todos" || item.status === filtroStatus;
    const etapaMatch =
      filtroEtapa === "todos" || item.aluno.etapa === filtroEtapa;
    return statusMatch && etapaMatch;
  });

  const tableData: PreMatriculaRow[] = (preMatriculas || []).map(
    (item: PreMatricula) => ({
      ...item,
      alunoNome: item.aluno.nome,
    })
  );

  const deletePreMatriculaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/pre-matriculas/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao deletar pré-matrícula");
      }
    },
    onSuccess: () => {
      toast.success("Pré-matrícula deletada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["pre-matriculas"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (preMatricula: PreMatricula) => {
    setEditingPreMatricula(preMatricula);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta pré-matrícula?")) {
      deletePreMatriculaMutation.mutate(id);
    }
  };

  const columns = [
    {
      key: "alunoNome" as const,
      label: "Aluno",
      sortable: true,
    },
    {
      key: "protocoloLocal" as const,
      label: "Protocolo",
      sortable: true,
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: any, item: PreMatricula) => (
        <StatusBadge status={item.status as any} />
      ),
    },
    {
      key: "createdAt" as const,
      label: "Data",
      sortable: true,
      render: (value: any, item: PreMatricula) =>
        new Date(item.createdAt).toLocaleDateString("pt-BR"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pré-matrículas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matrículas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as matrículas, desde pré-matrículas até matrículas
            completas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/pre-matriculas/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pré-Matrícula
            </Link>
          </Button>
        </div>
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
                  <SelectItem value="completo">Matriculado</SelectItem>
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
            data={tableData}
            columns={columns as any}
            searchKey={"alunoNome" as any}
            searchPlaceholder="Buscar por aluno..."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <PreMatriculaEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        preMatricula={editingPreMatricula}
      />
    </div>
  );
}
