"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface MatriculaData {
  id: string;
  protocolo: string;
  aluno: string;
  responsavel: string;
  turma: string | null;
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  data: string;
  cuidadora?: boolean;
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
}

interface MatriculaActionsMenuProps {
  matricula: MatriculaData;
}

export default function MatriculaActionsMenu({
  matricula,
}: MatriculaActionsMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Estados para edição
  const [editData, setEditData] = useState({
    alunoNome: matricula.alunoData?.nome || matricula.aluno,
    alunoDataNascimento: matricula.alunoData?.dataNascimento || "",
    alunoEtapa: matricula.alunoData?.etapa || "",
    alunoNecessidadesEspeciais:
      matricula.alunoData?.necessidadesEspeciais || false,
    alunoObservacoes: matricula.alunoData?.observacoes || "",
    responsavelNome: matricula.responsavelData?.nome || matricula.responsavel,
    responsavelCpf: matricula.responsavelData?.cpf || "",
    responsavelTelefone: matricula.responsavelData?.telefone || "",
    responsavelEndereco: matricula.responsavelData?.endereco || "",
    responsavelBairro: matricula.responsavelData?.bairro || "",
    responsavelEmail: matricula.responsavelData?.email || "",
    responsavelParentesco: matricula.responsavelData?.parentesco || "",
    responsavelAutorizadoRetirada:
      matricula.responsavelData?.autorizadoRetirada || false,
    observacoes: "",
  });

  // Mutação para deletar matrícula
  const deleteMatricula = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `http://localhost:3000/api/matriculas/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao deletar matrícula");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Matrícula deletada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao deletar matrícula: " + error.message);
    },
  });

  // Mutação para atualizar matrícula
  const updateMatricula = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `http://localhost:3000/api/matriculas/${matricula.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao atualizar matrícula");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Matrícula atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar matrícula: " + error.message);
    },
  });

  const handleDelete = () => {
    deleteMatricula.mutate(matricula.id);
  };

  const handleUpdate = () => {
    updateMatricula.mutate(editData);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Ficha do Aluno</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Dados do Aluno */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dados do Aluno</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alunoNome">Nome</Label>
                  <Input
                    id="alunoNome"
                    value={editData.alunoNome}
                    onChange={(e) =>
                      setEditData({ ...editData, alunoNome: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="alunoDataNascimento">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="alunoDataNascimento"
                    type="date"
                    value={editData.alunoDataNascimento}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        alunoDataNascimento: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="alunoEtapa">Etapa</Label>
                  <Select
                    value={editData.alunoEtapa}
                    onValueChange={(value) =>
                      setEditData({ ...editData, alunoEtapa: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bercario">Berçário</SelectItem>
                      <SelectItem value="maternal">Maternal</SelectItem>
                      <SelectItem value="pre_escola">Pré-Escola</SelectItem>
                      <SelectItem value="fundamental">Fundamental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="necessidadesEspeciais"
                    checked={editData.alunoNecessidadesEspeciais}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        alunoNecessidadesEspeciais: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="necessidadesEspeciais">
                    Necessidades Especiais
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="alunoObservacoes">Observações do Aluno</Label>
                <Textarea
                  id="alunoObservacoes"
                  value={editData.alunoObservacoes}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      alunoObservacoes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Dados do Responsável */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dados do Responsável</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavelNome">Nome</Label>
                  <Input
                    id="responsavelNome"
                    value={editData.responsavelNome}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelNome: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavelCpf">CPF</Label>
                  <Input
                    id="responsavelCpf"
                    value={editData.responsavelCpf}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelCpf: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavelTelefone">Telefone</Label>
                  <Input
                    id="responsavelTelefone"
                    value={editData.responsavelTelefone}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelTelefone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavelEmail">Email</Label>
                  <Input
                    id="responsavelEmail"
                    type="email"
                    value={editData.responsavelEmail}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavelEndereco">Endereço</Label>
                  <Input
                    id="responsavelEndereco"
                    value={editData.responsavelEndereco}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelEndereco: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavelBairro">Bairro</Label>
                  <Input
                    id="responsavelBairro"
                    value={editData.responsavelBairro}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelBairro: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavelParentesco">Parentesco</Label>
                  <Select
                    value={editData.responsavelParentesco}
                    onValueChange={(value) =>
                      setEditData({ ...editData, responsavelParentesco: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="avo">Avô/Avó</SelectItem>
                      <SelectItem value="tio">Tio/Tia</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autorizadoRetirada"
                    checked={editData.responsavelAutorizadoRetirada}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        responsavelAutorizadoRetirada: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="autorizadoRetirada">
                    Autorizado para Retirada
                  </Label>
                </div>
              </div>
            </div>

            {/* Observações Gerais */}
            <div>
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                value={editData.observacoes}
                onChange={(e) =>
                  setEditData({ ...editData, observacoes: e.target.value })
                }
                rows={3}
                placeholder="Observações adicionais sobre a matrícula..."
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMatricula.isPending}
              >
                {updateMatricula.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Tem certeza que deseja deletar a matrícula de{" "}
              <strong>{matricula.aluno}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMatricula.isPending}
              >
                {deleteMatricula.isPending ? "Deletando..." : "Deletar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
