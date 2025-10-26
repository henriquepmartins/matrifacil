"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { API_URL } from "@/lib/api-client";
import { toast } from "sonner";

type PreDetalhe = {
  id: string;
  protocoloLocal: string;
  aluno: { nome: string; etapa: string; necessidadesEspeciais: boolean };
  responsavel: { nome: string };
  createdAt: string;
};

type TurmaResumo = {
  id: string;
  nome: string;
  etapa: string;
  turno: string;
};

const DOC_TIPOS = [
  "certidao",
  "rg_cpf_resp",
  "vacina",
  "residencia",
  "historico",
  "foto3x4",
] as const;

export default function ConverterPreMatriculaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const preId = params?.id;

  const [etapaFiltro, setEtapaFiltro] = useState<string>("todos");
  const [turnoFiltro, setTurnoFiltro] = useState<string>("todos");
  const [turmaId, setTurmaId] = useState<string>("");
  const [dataMatricula, setDataMatricula] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [observacoes, setObservacoes] = useState<string>("");
  const [docsSelecionados, setDocsSelecionados] = useState<string[]>([]);

  const { data: pre, isLoading: loadingPre } = useQuery({
    queryKey: ["pre-matricula", preId],
    queryFn: async (): Promise<PreDetalhe | null> => {
      if (!preId) return null;
      const res = await fetch(
        `${API_URL}/api/pre-matriculas/${preId}`
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as PreDetalhe;
    },
    enabled: !!preId,
  });

  const { data: turmas, isLoading: loadingTurmas } = useQuery({
    queryKey: ["turmas", etapaFiltro, turnoFiltro, preId],
    queryFn: async (): Promise<TurmaResumo[]> => {
      const params = new URLSearchParams();
      if (etapaFiltro !== "todos") params.set("etapa", etapaFiltro);
      if (turnoFiltro !== "todos") params.set("turno", turnoFiltro);
      params.set("limit", "20");
      const res = await fetch(`${API_URL}/api/turmas?${params}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data || []) as TurmaResumo[];
    },
    enabled: !!preId,
  });

  const criarMatricula = useMutation({
    mutationFn: async () => {
      if (!preId) throw new Error("Pré-matrícula inválida");
      const response = await fetch(
        `${API_URL}/api/matriculas/from-pre/${preId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            turmaId: turmaId || null,
            dataMatricula,
            documentosIniciais: docsSelecionados.map((t) => ({ tipo: t })),
            observacoes,
          }),
        }
      );
      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        throw new Error(e.message || "Erro ao criar matrícula");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Matrícula criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["pre-matriculas"] });
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      router.push("/dashboard/matriculas");
    },
    onError: (err: any) => toast.error(String(err.message || err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/pre-matriculas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Converter Pré‑Matrícula
            </h1>
            <p className="text-muted-foreground">
              Atribua a turma, confirme a data e finalize a matrícula.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPre ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : pre ? (
            <div className="text-sm text-muted-foreground">
              Pré: <span className="font-medium">{pre.protocoloLocal}</span> —
              Aluno: <span className="font-medium">{pre.aluno.nome}</span>
              {pre.aluno.necessidadesEspeciais && (
                <span className="ml-2 inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">
                  Cuidadora necessária (automático)
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600">
              Pré‑matrícula não encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Turma e Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="w-full">
              <Label className="mb-2 block">Etapa</Label>
              <Select value={etapaFiltro} onValueChange={setEtapaFiltro}>
                <SelectTrigger className="w-full">
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
            <div className="w-full">
              <Label className="mb-2 block">Turno</Label>
              <Select value={turnoFiltro} onValueChange={setTurnoFiltro}>
                <SelectTrigger className="w-full">
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
            <div className="w-full">
              <Label className="mb-2 block">Turma</Label>
              <Select
                value={turmaId}
                onValueChange={setTurmaId}
                disabled={!pre}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingTurmas ? "Carregando..." : "Selecione a turma"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(turmas || []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome} — {t.etapa} / {t.turno}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2 w-full">
              <Label className="mb-2 block">Data da Matrícula</Label>
              <Input
                className="w-full"
                type="date"
                value={dataMatricula}
                onChange={(e) => setDataMatricula(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2 w-full">
              <Label className="mb-2 block">Observações</Label>
              <Textarea
                className="w-full"
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais (opcional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="mb-2 block">Documentos pendentes iniciais</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DOC_TIPOS.map((tipo) => (
                <label key={tipo} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={docsSelecionados.includes(tipo)}
                    onCheckedChange={(checked) => {
                      setDocsSelecionados((prev) =>
                        checked
                          ? [...prev, tipo]
                          : prev.filter((t) => t !== tipo)
                      );
                    }}
                  />
                  {tipo}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => criarMatricula.mutate()}
              disabled={!pre || criarMatricula.isPending}
            >
              {criarMatricula.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Convertendo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Matrícula
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
