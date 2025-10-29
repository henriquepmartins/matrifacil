"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DataTable from "@/components/data-table";
import TransferAlunoDialog from "@/components/transfer-aluno-dialog";
import MatriculaActionsMenu from "@/components/matricula-actions-menu";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertCircle,
  UserCog,
  GraduationCap,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { getTurmaDetalhes, type TurmaDetalhes } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

const getEtapaLabel = (etapa: string) => {
  const labels: Record<string, string> = {
    bercario: "Berçário",
    maternal: "Maternal",
    pre_escola: "Pré-Escola",
    fundamental: "Fundamental",
  };
  return labels[etapa] || etapa;
};

const getTurnoLabel = (turno: string) => {
  const labels: Record<string, string> = {
    manha: "Manhã",
    tarde: "Tarde",
    integral: "Integral",
  };
  return labels[turno] || turno;
};

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
};

export default function TurmaDetalhesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const turmaId = params?.id;

  const [selectedAluno, setSelectedAluno] = useState<{
    matriculaId: string;
    alunoNome: string;
  } | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["turma-detalhes", turmaId],
    queryFn: async () => {
      if (!turmaId) throw new Error("ID da turma não fornecido");
      return getTurmaDetalhes(turmaId);
    },
    enabled: !!turmaId,
  });

  const detalhes = response?.data;

  const handleTransferClick = (matriculaId: string, alunoNome: string) => {
    setSelectedAluno({ matriculaId, alunoNome });
    setIsTransferDialogOpen(true);
  };

  const handleTransferSuccess = () => {
    setIsTransferDialogOpen(false);
    setSelectedAluno(null);
    queryClient.invalidateQueries({ queryKey: ["turma-detalhes", turmaId] });
    queryClient.invalidateQueries({ queryKey: ["turmas"] });
    toast.success("Aluno transferido com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando detalhes da turma...</p>
        </div>
      </div>
    );
  }

  if (error || !detalhes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Erro ao carregar turma</p>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Turma não encontrada"}
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/turmas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Turmas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { turma, alunos, estatisticas } = detalhes;

  // Definir colunas após ter os dados da turma
  const columns = [
    {
      key: "alunoNome" as const,
      label: "Nome do Aluno",
      sortable: true,
    },
    {
      key: "responsavelNome" as const,
      label: "Responsável",
      sortable: true,
    },
    {
      key: "responsavelTelefone" as const,
      label: "Telefone",
      render: (value: string) => value || "—",
    },
    {
      key: "necessidadesEspeciais" as const,
      label: "Necessidades Especiais",
      render: (value: boolean) =>
        value ? (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Sim
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "dataMatricula" as const,
      label: "Data Matrícula",
      render: (value: string | null) => formatDate(value),
      sortable: true,
    },
    {
      key: "matriculaId" as const,
      label: "Ações",
      render: (_: any, item: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTransferClick(item.matriculaId, item.alunoNome)}
          >
            <UserCog className="h-4 w-4 mr-1" />
            Transferir
          </Button>
          <MatriculaActionsMenu
            matricula={{
              id: item.matriculaId,
              protocolo: item.protocoloLocal,
              aluno: item.alunoNome,
              responsavel: item.responsavelNome,
              turma: turma.nome,
              status: item.statusMatricula as any,
              data: item.dataMatricula || "",
              alunoData: {
                id: item.alunoId,
                nome: item.alunoNome,
                dataNascimento: item.dataNascimento,
                etapa: item.etapa,
                necessidadesEspeciais: item.necessidadesEspeciais,
                observacoes: item.observacoesAluno,
              },
              responsavelData: {
                id: item.responsavelId,
                nome: item.responsavelNome,
                cpf: item.responsavelCpf,
                telefone: item.responsavelTelefone,
                endereco: item.responsavelEndereco || "",
                bairro: item.responsavelBairro || "",
                email: item.responsavelEmail || null,
                parentesco: item.responsavelParentesco || "",
                autorizadoRetirada: item.responsavelAutorizadoRetirada ?? true,
              },
              turmaData: {
                id: turma.id,
                nome: turma.nome,
                etapa: turma.etapa,
                turno: turma.turno,
              },
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/turmas">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{turma.nome}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={turma.ativa ? "default" : "secondary"}>
                  {turma.ativa ? "Ativa" : "Inativa"}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {getEtapaLabel(turma.etapa)} • {getTurnoLabel(turma.turno)} • Ano{" "}
                  {turma.anoLetivo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalAlunos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                de {estatisticas.capacidadeTotal} vagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.taxaOcupacao}%</div>
              <Progress value={estatisticas.taxaOcupacao} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vagas Disponíveis
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  estatisticas.vagasDisponiveis === 0
                    ? "text-red-600"
                    : estatisticas.vagasDisponiveis <= 3
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {estatisticas.vagasDisponiveis}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {estatisticas.vagasOcupadas} ocupadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Necessidades Especiais
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estatisticas.alunosComNecessidadesEspeciais}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {estatisticas.percentualNecessidadesEspeciais}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Alunos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alunos Matriculados ({alunos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alunos.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhum aluno matriculado</p>
                <p className="text-muted-foreground">
                  Esta turma ainda não possui alunos matriculados.
                </p>
              </div>
            ) : (
              <DataTable
                data={alunos}
                columns={columns}
                searchKey="alunoNome"
                searchPlaceholder="Buscar por nome do aluno..."
                pageSize={10}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Transferência */}
      {selectedAluno && (
        <TransferAlunoDialog
          isOpen={isTransferDialogOpen}
          onClose={() => {
            setIsTransferDialogOpen(false);
            setSelectedAluno(null);
          }}
          matriculaId={selectedAluno.matriculaId}
          alunoNome={selectedAluno.alunoNome}
          turmaOrigemId={turmaId!}
          turmaOrigemNome={turma.nome}
          etapaTurma={turma.etapa}
          onSuccess={handleTransferSuccess}
        />
      )}
    </>
  );
}

