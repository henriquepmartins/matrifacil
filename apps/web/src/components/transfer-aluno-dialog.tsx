"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient, transferirAluno } from "@/lib/api-client";

interface TransferAlunoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matriculaId: string;
  alunoNome: string;
  turmaOrigemId: string;
  turmaOrigemNome: string;
  etapaTurma: string;
  onSuccess?: () => void;
}

interface Turma {
  id: string;
  nome: string;
  etapa: string;
  turno: string;
  capacidade: number;
  vagasDisponiveis: number;
  ativa: boolean;
}

const getTurnoLabel = (turno: string) => {
  const labels: Record<string, string> = {
    manha: "Manhã",
    tarde: "Tarde",
    integral: "Integral",
  };
  return labels[turno] || turno;
};

export default function TransferAlunoDialog({
  isOpen,
  onClose,
  matriculaId,
  alunoNome,
  turmaOrigemId,
  turmaOrigemNome,
  etapaTurma,
  onSuccess,
}: TransferAlunoDialogProps) {
  const [turmaDestinoId, setTurmaDestinoId] = useState<string>("");

  // Buscar turmas disponíveis da mesma etapa com vagas
  const { data: turmasResponse, isLoading: loadingTurmas } = useQuery({
    queryKey: ["turmas-disponiveis", etapaTurma],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Turma[];
      }>(`/api/turmas?etapa=${etapaTurma}&ativa=true`);
      return response;
    },
    enabled: isOpen,
  });

  // Filtrar turmas disponíveis (mesma etapa, com vagas, excluindo a turma atual)
  const turmasDisponiveis =
    turmasResponse?.data?.filter(
      (turma) =>
        turma.id !== turmaOrigemId &&
        turma.etapa === etapaTurma &&
        turma.vagasDisponiveis > 0
    ) || [];

  const turmaDestino = turmasDisponiveis.find((t) => t.id === turmaDestinoId);

  // Mutation para transferir aluno
  const transferMutation = useMutation({
    mutationFn: () =>
      transferirAluno({
        matriculaId,
        turmaOrigemId,
        turmaDestinoId,
      }),
    onSuccess: (response) => {
      toast.success(response.message || "Aluno transferido com sucesso!");
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Erro ao transferir aluno. Tente novamente."
      );
    },
  });

  const handleTransfer = () => {
    if (!turmaDestinoId) {
      toast.error("Selecione uma turma de destino");
      return;
    }

    transferMutation.mutate();
  };

  const handleClose = () => {
    setTurmaDestinoId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transferir Aluno de Turma</DialogTitle>
          <DialogDescription>
            Selecione a turma de destino para transferir o aluno. Apenas turmas da
            mesma etapa com vagas disponíveis são exibidas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do Aluno */}
          <div className="space-y-2">
            <Label>Aluno</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{alunoNome}</span>
            </div>
          </div>

          {/* Turma Origem */}
          <div className="space-y-2">
            <Label>Turma Atual</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="font-medium">{turmaOrigemNome}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Selecionar Turma Destino */}
          <div className="space-y-2">
            <Label htmlFor="turma-destino">Turma de Destino</Label>
            {loadingTurmas ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Carregando turmas...
                </span>
              </div>
            ) : turmasDisponiveis.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Não há turmas disponíveis da mesma etapa com vagas para
                  transferência.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={turmaDestinoId} onValueChange={setTurmaDestinoId}>
                <SelectTrigger id="turma-destino">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmasDisponiveis.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {turma.nome} - {getTurnoLabel(turma.turno)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-green-100 text-green-800"
                        >
                          {turma.vagasDisponiveis}{" "}
                          {turma.vagasDisponiveis === 1 ? "vaga" : "vagas"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Informações da Turma Destino Selecionada */}
          {turmaDestino && (
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Turma Selecionada
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{turmaDestino.nome}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Turno:</span>
                  <p className="font-medium">
                    {getTurnoLabel(turmaDestino.turno)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacidade:</span>
                  <p className="font-medium">{turmaDestino.capacidade} alunos</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vagas disponíveis:</span>
                  <p className="font-medium text-green-600">
                    {turmaDestino.vagasDisponiveis}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Aviso */}
          {turmaDestinoId && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A transferência atualizará automaticamente os contadores de vagas
                de ambas as turmas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={transferMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              !turmaDestinoId ||
              transferMutation.isPending ||
              turmasDisponiveis.length === 0
            }
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferindo...
              </>
            ) : (
              "Confirmar Transferência"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

