"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
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

export default function NovaPreMatriculaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PreMatriculaFormData>({
    resolver: zodResolver(preMatriculaSchema),
    defaultValues: {
      aluno: {
        necessidadesEspeciais: false,
      },
      responsavel: {
        parentesco: "pai",
        autorizadoRetirada: true,
      },
    },
  });

  const createPreMatriculaMutation = useMutation({
    mutationFn: async (data: PreMatriculaFormData) => {
      const response = await fetch("http://localhost:3000/api/pre-matriculas", {
        method: "POST",
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
        throw new Error(error.message || "Erro ao criar pré-matrícula");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Pré-matrícula criada com sucesso!");
      router.push("/dashboard/pre-matriculas");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: PreMatriculaFormData) => {
    setIsSubmitting(true);
    createPreMatriculaMutation.mutate(data);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Link href="/dashboard/pre-matriculas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nova Pré-Matrícula
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados do aluno e responsável para criar uma nova
              pré-matrícula.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados do Aluno */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Dados do Responsável */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Responsável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Observações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register("observacoes")}
                placeholder="Observações gerais sobre a pré-matrícula (opcional)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/pre-matriculas">Cancelar</Link>
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
                Salvar Pré-Matrícula
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
