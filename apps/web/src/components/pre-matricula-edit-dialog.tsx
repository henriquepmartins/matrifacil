"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const preMatriculaSchema = z.object({
  aluno: z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
    etapa: z.enum(["bercario", "maternal", "pre_escola", "fundamental"]),
    necessidadesEspeciais: z.boolean(),
    observacoes: z.string(),
  }),
  responsavel: z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
    telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
    bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
    email: z.string(),
    parentesco: z.string(),
    autorizadoRetirada: z.boolean(),
  }),
  observacoes: z.string(),
});

type PreMatriculaFormData = z.infer<typeof preMatriculaSchema>;

interface PreMatriculaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preMatricula: {
    id: string;
    protocoloLocal: string;
    status: string;
    observacoes: string | null;
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
  } | null;
}

export default function PreMatriculaEditDialog({
  open,
  onOpenChange,
  preMatricula,
}: PreMatriculaEditDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [turmaId, setTurmaId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PreMatriculaFormData>({
    resolver: zodResolver(preMatriculaSchema),
  });

  // Reset form when preMatricula changes
  useEffect(() => {
    if (preMatricula) {
      reset({
        aluno: {
          nome: preMatricula.aluno.nome,
          dataNascimento: preMatricula.aluno.dataNascimento.split("T")[0],
          etapa: preMatricula.aluno.etapa as any,
          necessidadesEspeciais: preMatricula.aluno.necessidadesEspeciais,
          observacoes: preMatricula.aluno.observacoes || "",
        },
        responsavel: {
          nome: preMatricula.responsavel.nome,
          cpf: preMatricula.responsavel.cpf,
          telefone: preMatricula.responsavel.telefone,
          endereco: preMatricula.responsavel.endereco,
          bairro: preMatricula.responsavel.bairro,
          email: preMatricula.responsavel.email || "",
          parentesco: preMatricula.responsavel.parentesco,
          autorizadoRetirada: preMatricula.responsavel.autorizadoRetirada,
        },
        observacoes: preMatricula.observacoes || "",
      });
    }
  }, [preMatricula, reset]);

  const updatePreMatriculaMutation = useMutation({
    mutationFn: async (data: PreMatriculaFormData) => {
      const response = await fetch(`/api/pre-matriculas/${preMatricula?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          aluno: {
            ...data.aluno,
            dataNascimento: new Date(data.aluno.dataNascimento),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar pré-matrícula");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Pré-matrícula atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["pre-matriculas"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const convertPreMatriculaMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/pre-matriculas/${preMatricula?.id}/converter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ turmaId: turmaId || null }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao converter pré-matrícula");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Pré-matrícula convertida para matrícula completa!");
      queryClient.invalidateQueries({ queryKey: ["pre-matriculas"] });
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: PreMatriculaFormData) => {
    setIsSubmitting(true);
    updatePreMatriculaMutation.mutate(data);
  };

  const handleConvert = () => {
    convertPreMatriculaMutation.mutate();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  if (!preMatricula) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Pré-Matrícula - {preMatricula.protocoloLocal}
          </DialogTitle>
          <DialogDescription>
            Atualize os dados da pré-matrícula ou converta para matrícula
            completa.
          </DialogDescription>
        </DialogHeader>

        {!showConvertForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados do Aluno */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Aluno</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno.nome">Nome Completo *</Label>
                  <Input
                    id="aluno.nome"
                    {...register("aluno.nome")}
                    placeholder="Digite o nome completo do aluno"
                  />
                  {errors.aluno?.nome && (
                    <p className="text-sm text-red-500">
                      {errors.aluno.nome.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aluno.dataNascimento">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="aluno.dataNascimento"
                    type="date"
                    {...register("aluno.dataNascimento")}
                  />
                  {errors.aluno?.dataNascimento && (
                    <p className="text-sm text-red-500">
                      {errors.aluno.dataNascimento.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aluno.etapa">Etapa Educacional *</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("aluno.etapa", value as any)
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
                  {errors.aluno?.etapa && (
                    <p className="text-sm text-red-500">
                      {errors.aluno.etapa.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aluno.necessidadesEspeciais">
                    Necessidades Especiais
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aluno.necessidadesEspeciais"
                      checked={watch("aluno.necessidadesEspeciais")}
                      onCheckedChange={(checked) =>
                        setValue(
                          "aluno.necessidadesEspeciais",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor="aluno.necessidadesEspeciais"
                      className="text-sm"
                    >
                      Aluno possui necessidades especiais
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.observacoes">Observações do Aluno</Label>
                <Textarea
                  id="aluno.observacoes"
                  {...register("aluno.observacoes")}
                  placeholder="Observações sobre o aluno (opcional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Dados do Responsável */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Responsável</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel.nome">Nome Completo *</Label>
                  <Input
                    id="responsavel.nome"
                    {...register("responsavel.nome")}
                    placeholder="Digite o nome completo do responsável"
                  />
                  {errors.responsavel?.nome && (
                    <p className="text-sm text-red-500">
                      {errors.responsavel.nome.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel.cpf">CPF *</Label>
                  <Input
                    id="responsavel.cpf"
                    {...register("responsavel.cpf")}
                    placeholder="000.000.000-00"
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setValue("responsavel.cpf", formatted);
                    }}
                  />
                  {errors.responsavel?.cpf && (
                    <p className="text-sm text-red-500">
                      {errors.responsavel.cpf.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel.telefone">Telefone *</Label>
                  <Input
                    id="responsavel.telefone"
                    {...register("responsavel.telefone")}
                    placeholder="(00) 00000-0000"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setValue("responsavel.telefone", formatted);
                    }}
                  />
                  {errors.responsavel?.telefone && (
                    <p className="text-sm text-red-500">
                      {errors.responsavel.telefone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel.email">Email</Label>
                  <Input
                    id="responsavel.email"
                    type="email"
                    {...register("responsavel.email")}
                    placeholder="email@exemplo.com"
                  />
                  {errors.responsavel?.email && (
                    <p className="text-sm text-red-500">
                      {errors.responsavel.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel.parentesco">Parentesco</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("responsavel.parentesco", value)
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

                <div className="space-y-2">
                  <Label htmlFor="responsavel.autorizadoRetirada">
                    Autorizado para Retirada
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="responsavel.autorizadoRetirada"
                      checked={watch("responsavel.autorizadoRetirada")}
                      onCheckedChange={(checked) =>
                        setValue(
                          "responsavel.autorizadoRetirada",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor="responsavel.autorizadoRetirada"
                      className="text-sm"
                    >
                      Responsável autorizado para retirar o aluno
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel.endereco">Endereço *</Label>
                  <Input
                    id="responsavel.endereco"
                    {...register("responsavel.endereco")}
                    placeholder="Rua, número, complemento"
                  />
                  {errors.responsavel?.endereco && (
                    <p className="text-sm text-red-500">
                      {errors.responsavel.endereco.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel.bairro">Bairro *</Label>
                  <Input
                    id="responsavel.bairro"
                    {...register("responsavel.bairro")}
                    placeholder="Nome do bairro"
                  />
                  {errors.responsavel?.bairro && (
                    <p className="text-sm text-red-500">
                      {errors.responsavel.bairro.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Observações Gerais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observações Gerais</h3>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  {...register("observacoes")}
                  placeholder="Observações gerais sobre a pré-matrícula (opcional)"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowConvertForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Converter para Matrícula
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Converter Pré-Matrícula para Matrícula Completa
              </h3>
              <p className="text-yellow-700 text-sm">
                Esta ação irá converter a pré-matrícula em uma matrícula
                completa. O status será alterado e a data de matrícula será
                definida.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="turmaId">Turma (Opcional)</Label>
              <Input
                id="turmaId"
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                placeholder="ID da turma (deixe vazio se não houver turma específica)"
              />
              <p className="text-sm text-muted-foreground">
                Se não especificar uma turma, a matrícula será criada sem turma
                definida.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConvertForm(false)}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConvert}
                disabled={convertPreMatriculaMutation.isPending}
              >
                {convertPreMatriculaMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Conversão
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
