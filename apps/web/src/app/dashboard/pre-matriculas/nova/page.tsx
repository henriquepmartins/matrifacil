"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const preMatriculaSchema = z.object({
  aluno: z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
    etapa: z.enum(["bercario", "maternal", "pre_escola", "fundamental"]),
    necessidadesEspeciais: z.boolean().default(false),
    observacoes: z.string().optional(),
    rg: z.string().optional(),
    cpf: z.string().optional(),
    naturalidade: z.string().optional(),
    nacionalidade: z.string().default("Brasileira"),
    sexo: z.enum(["M", "F", "Outro"]).optional(),
    corRaca: z
      .enum(["Branca", "Preta", "Parda", "Amarela", "Indígena"])
      .optional(),
    tipoSanguineo: z.string().optional(),
    alergias: z.string().optional(),
    medicamentos: z.string().optional(),
    doencas: z.string().optional(),
    carteiraVacina: z.boolean().default(false),
    observacoesSaude: z.string().optional(),
  }),
  responsavel: z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
    telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
    bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
    email: z.string().optional(),
    parentesco: z.string().optional(),
    autorizadoRetirada: z.boolean().default(true),
    rg: z.string().optional(),
    dataNascimento: z.string().optional(),
    naturalidade: z.string().optional(),
    nacionalidade: z.string().default("Brasileira"),
    sexo: z.enum(["M", "F", "Outro"]).optional(),
    estadoCivil: z
      .enum(["Solteiro", "Casado", "Divorciado", "Viúvo"])
      .optional(),
    profissao: z.string().optional(),
    localTrabalho: z.string().optional(),
    telefoneTrabalho: z.string().optional(),
  }),
  contatosEmergencia: z
    .array(
      z.object({
        nome: z.string().optional(),
        telefone: z.string().optional(),
        parentesco: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .optional(),
  observacoes: z.string().optional(),
});

type PreMatriculaFormData = z.infer<typeof preMatriculaSchema>;

export default function NovaPreMatriculaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PreMatriculaFormData>({
    resolver: zodResolver(preMatriculaSchema),
    defaultValues: {
      aluno: {
        necessidadesEspeciais: false,
        carteiraVacina: false,
        nacionalidade: "Brasileira",
      },
      responsavel: {
        parentesco: "pai",
        autorizadoRetirada: true,
        nacionalidade: "Brasileira",
      },
      contatosEmergencia: [],
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
          aluno: {
            nome: data.aluno.nome,
            dataNascimento: new Date(data.aluno.dataNascimento),
            etapa: data.aluno.etapa,
            necessidadesEspeciais: data.aluno.necessidadesEspeciais,
            observacoes: data.aluno.observacoes,
          },
          responsavel: {
            nome: data.responsavel.nome,
            cpf: data.responsavel.cpf,
            telefone: data.responsavel.telefone,
            endereco: data.responsavel.endereco,
            bairro: data.responsavel.bairro,
            email: data.responsavel.email,
            parentesco: data.responsavel.parentesco,
            autorizadoRetirada: data.responsavel.autorizadoRetirada,
          },
          observacoes: data.observacoes,
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
      queryClient.invalidateQueries({ queryKey: ["pre-matriculas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      router.push("/dashboard/pre-matriculas");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: PreMatriculaFormData) => {
    createPreMatriculaMutation.mutate(data);
  };

  // Função para preencher o formulário automaticamente (apenas em desenvolvimento)
  const preencherFormularioTeste = () => {
    if (process.env.NODE_ENV !== "development") return;

    const dadosTeste: PreMatriculaFormData = {
      aluno: {
        nome: "João Silva Santos",
        dataNascimento: "2020-05-15",
        etapa: "maternal",
        necessidadesEspeciais: false,
        observacoes: "Aluno tranquilo e adaptável",
        rg: "12.345.678-9",
        cpf: "12345678901",
        naturalidade: "São Paulo",
        nacionalidade: "Brasileira",
        sexo: "M",
        corRaca: "Parda",
        tipoSanguineo: "O+",
        alergias: "Nenhuma",
        medicamentos: "Nenhum",
        doencas: "Nenhuma",
        carteiraVacina: true,
        observacoesSaude: "Criança saudável",
      },
      responsavel: {
        nome: "Maria Silva Santos",
        cpf: "98765432100",
        telefone: "11987654321",
        endereco: "Rua das Flores, 123",
        bairro: "Centro",
        email: "maria.santos@email.com",
        parentesco: "mãe",
        autorizadoRetirada: true,
        rg: "98.765.432-1",
        dataNascimento: "1985-03-20",
        naturalidade: "São Paulo",
        nacionalidade: "Brasileira",
        sexo: "F",
        estadoCivil: "Casado",
        profissao: "Professora",
        localTrabalho: "Escola Municipal",
        telefoneTrabalho: "1133334444",
        rendaFamiliar: "R$ 3.000,00",
      },
      contatosEmergencia: [
        {
          nome: "José Silva Santos",
          telefone: "11999888777",
          parentesco: "pai",
          observacoes: "Contato de emergência principal",
        },
        {
          nome: "Ana Silva",
          telefone: "11988776655",
          parentesco: "avó",
          observacoes: "Contato secundário",
        },
      ],
      observacoes:
        "Família muito presente e comprometida com a educação da criança.",
    };

    // Preencher todos os campos do formulário
    Object.keys(dadosTeste.aluno).forEach((key) => {
      setValue(
        `aluno.${key}` as any,
        dadosTeste.aluno[key as keyof typeof dadosTeste.aluno]
      );
    });

    Object.keys(dadosTeste.responsavel).forEach((key) => {
      setValue(
        `responsavel.${key}` as any,
        dadosTeste.responsavel[key as keyof typeof dadosTeste.responsavel]
      );
    });

    setValue("contatosEmergencia", dadosTeste.contatosEmergencia);
    setValue("observacoes", dadosTeste.observacoes);

    toast.success("Formulário preenchido automaticamente!");
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

  const formatRG = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 7) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
  };

  const contatosEmergencia = watch("contatosEmergencia") || [];

  const addContatoEmergencia = () => {
    const currentContatos = watch("contatosEmergencia") || [];
    setValue("contatosEmergencia", [
      ...currentContatos,
      { nome: "", telefone: "", parentesco: "", observacoes: "" },
    ]);
  };

  const removeContatoEmergencia = (index: number) => {
    const currentContatos = watch("contatosEmergencia") || [];
    if (currentContatos.length > 1) {
      setValue(
        "contatosEmergencia",
        currentContatos.filter((_, i) => i !== index)
      );
    }
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
              Preencha todos os dados necessários para criar uma nova
              pré-matrícula.
            </p>
          </div>
        </div>

        {/* Botão de preenchimento automático (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={preencherFormularioTeste}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-wand-2"
            >
              <path d="M15 4V2"></path>
              <path d="M15 16v-2"></path>
              <path d="M8 9h2"></path>
              <path d="M20 9h2"></path>
              <path d="M17.8 11.2 19 12l-1.2.8"></path>
              <path d="M6.2 11.2 5 12l1.2.8"></path>
              <path d="M17.8 12.8 19 12l-1.2-.8"></path>
              <path d="M6.2 12.8 5 12l1.2-.8"></path>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M4.93 19.07l1.41-1.41"></path>
              <path d="M17.66 6.34l1.41-1.41"></path>
            </svg>
            Preencher Teste
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Pessoais do Aluno */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais do Aluno</CardTitle>
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
                <Label htmlFor="aluno.sexo">Sexo</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("aluno.sexo", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.rg">RG</Label>
                <Input
                  id="aluno.rg"
                  {...register("aluno.rg")}
                  placeholder="00.000.000-0"
                  onChange={(e) => {
                    const formatted = formatRG(e.target.value);
                    setValue("aluno.rg", formatted);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.cpf">CPF</Label>
                <Input
                  id="aluno.cpf"
                  {...register("aluno.cpf")}
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    setValue("aluno.cpf", formatted);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.naturalidade">Naturalidade</Label>
                <Input
                  id="aluno.naturalidade"
                  {...register("aluno.naturalidade")}
                  placeholder="Cidade de nascimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.nacionalidade">Nacionalidade</Label>
                <Input
                  id="aluno.nacionalidade"
                  {...register("aluno.nacionalidade")}
                  placeholder="Nacionalidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.corRaca">Cor/Raça</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("aluno.corRaca", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor/raça" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Branca">Branca</SelectItem>
                    <SelectItem value="Preta">Preta</SelectItem>
                    <SelectItem value="Parda">Parda</SelectItem>
                    <SelectItem value="Amarela">Amarela</SelectItem>
                    <SelectItem value="Indígena">Indígena</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Dados de Saúde do Aluno */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Saúde do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aluno.tipoSanguineo">Tipo Sanguíneo</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("aluno.tipoSanguineo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo sanguíneo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.carteiraVacina">
                  Carteira de Vacinação
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aluno.carteiraVacina"
                    checked={watch("aluno.carteiraVacina")}
                    onCheckedChange={(checked) =>
                      setValue("aluno.carteiraVacina", checked as boolean)
                    }
                  />
                  <Label htmlFor="aluno.carteiraVacina" className="text-sm">
                    Carteira de vacinação em dia
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aluno.alergias">Alergias</Label>
                <Textarea
                  id="aluno.alergias"
                  {...register("aluno.alergias")}
                  placeholder="Descreva as alergias conhecidas"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno.medicamentos">Medicamentos</Label>
                <Textarea
                  id="aluno.medicamentos"
                  {...register("aluno.medicamentos")}
                  placeholder="Medicamentos em uso regular"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aluno.doencas">Doenças/Problemas de Saúde</Label>
              <Textarea
                id="aluno.doencas"
                {...register("aluno.doencas")}
                placeholder="Descreva problemas de saúde conhecidos"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aluno.observacoesSaude">
                Observações de Saúde
              </Label>
              <Textarea
                id="aluno.observacoesSaude"
                {...register("aluno.observacoesSaude")}
                placeholder="Outras observações importantes sobre a saúde"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Responsável Principal */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Responsável Principal</CardTitle>
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
                <Label htmlFor="responsavel.dataNascimento">
                  Data de Nascimento
                </Label>
                <Input
                  id="responsavel.dataNascimento"
                  type="date"
                  {...register("responsavel.dataNascimento")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel.sexo">Sexo</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("responsavel.sexo", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel.parentesco">Parentesco *</Label>
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
                <Label htmlFor="responsavel.estadoCivil">Estado Civil</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("responsavel.estadoCivil", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                    <SelectItem value="Viúvo">Viúvo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel.profissao">Profissão</Label>
                <Input
                  id="responsavel.profissao"
                  {...register("responsavel.profissao")}
                  placeholder="Profissão do responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel.localTrabalho">
                  Local de Trabalho
                </Label>
                <Input
                  id="responsavel.localTrabalho"
                  {...register("responsavel.localTrabalho")}
                  placeholder="Onde trabalha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel.telefoneTrabalho">
                  Telefone do Trabalho
                </Label>
                <Input
                  id="responsavel.telefoneTrabalho"
                  {...register("responsavel.telefoneTrabalho")}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setValue("responsavel.telefoneTrabalho", formatted);
                  }}
                />
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

        {/* Contatos de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contatos de Emergência</CardTitle>
            <p className="text-sm text-muted-foreground">
              Adicione pelo menos um contato de emergência além do responsável
              principal.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {contatosEmergencia.map((contato, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Contato {index + 1}</h4>
                  {contatosEmergencia.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContatoEmergencia(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`contatosEmergencia.${index}.nome`}>
                      Nome *
                    </Label>
                    <Input
                      {...register(`contatosEmergencia.${index}.nome`)}
                      placeholder="Nome completo"
                    />
                    {errors.contatosEmergencia?.[index]?.nome && (
                      <p className="text-sm text-red-500">
                        {errors.contatosEmergencia[index]?.nome?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`contatosEmergencia.${index}.telefone`}>
                      Telefone *
                    </Label>
                    <Input
                      {...register(`contatosEmergencia.${index}.telefone`)}
                      placeholder="(00) 00000-0000"
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setValue(
                          `contatosEmergencia.${index}.telefone`,
                          formatted
                        );
                      }}
                    />
                    {errors.contatosEmergencia?.[index]?.telefone && (
                      <p className="text-sm text-red-500">
                        {errors.contatosEmergencia[index]?.telefone?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`contatosEmergencia.${index}.parentesco`}>
                      Parentesco *
                    </Label>
                    <Input
                      {...register(`contatosEmergencia.${index}.parentesco`)}
                      placeholder="Ex: Avô, Tio, Vizinho"
                    />
                    {errors.contatosEmergencia?.[index]?.parentesco && (
                      <p className="text-sm text-red-500">
                        {errors.contatosEmergencia[index]?.parentesco?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`contatosEmergencia.${index}.observacoes`}>
                      Observações
                    </Label>
                    <Input
                      {...register(`contatosEmergencia.${index}.observacoes`)}
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addContatoEmergencia}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato de Emergência
            </Button>
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
          <Button type="submit" disabled={createPreMatriculaMutation.isPending}>
            {createPreMatriculaMutation.isPending ? (
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
