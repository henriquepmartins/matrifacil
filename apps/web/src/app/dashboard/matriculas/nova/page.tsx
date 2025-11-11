"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { isOnline } from "@/lib/utils/network";
import { getAllPreMatriculas } from "@/lib/services/pre-matricula-cache.service";
import { cachePreMatriculasFromServer } from "@/lib/services/pre-matricula-cache.service";
import { db } from "@/lib/db";
import { syncPendingOperations } from "@/lib/db/sync";

type PreResumo = {
  id: string;
  idLocal?: string; // ID local do IndexedDB (para pré-matrículas criadas offline)
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

export default function NovaMatriculaPage() {
  const queryClient = useQueryClient();
  const [searchPre, setSearchPre] = useState("");
  const [selectedPreId, setSelectedPreId] = useState<string>("");
  const [etapaFiltro, setEtapaFiltro] = useState<string>("todos");
  const [turnoFiltro, setTurnoFiltro] = useState<string>("todos");
  const [turmaId, setTurmaId] = useState<string>("");
  const [dataMatricula, setDataMatricula] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [observacoes, setObservacoes] = useState<string>("");
  const [docsSelecionados, setDocsSelecionados] = useState<string[]>([]);

  const { data: pres, isLoading: loadingPres } = useQuery({
    queryKey: ["pre-matriculas", searchPre],
    queryFn: async (): Promise<PreResumo[]> => {
      console.log("🔍 Buscando pré-matrículas para nova matrícula...");

      try {
        // Tentar buscar do servidor se online
        if (isOnline()) {
          console.log("🌐 Online - buscando do servidor e cacheando");
          await cachePreMatriculasFromServer();
        }
      } catch (error) {
        console.warn("⚠️ Erro ao buscar do servidor, usando cache:", error);
      }

      // Sempre retornar dados locais (synced + pending)
      console.log("📂 Buscando dados locais...");
      const localData = await getAllPreMatriculas();

      // Filtrar apenas pré-matrículas (status: "pre") e buscar se houver
      let filtered = localData.filter((item: any) => item.status === "pre");

      // Se houver busca, filtrar localmente
      if (searchPre) {
        const searchLower = searchPre.toLowerCase();
        filtered = filtered.filter(
          (item: any) =>
            item.aluno?.nome.toLowerCase().includes(searchLower) ||
            item.protocoloLocal.toLowerCase().includes(searchLower)
        );
      }

      console.log(
        `✅ ${filtered.length} pré-matrículas encontradas (${localData.length} total)`
      );

      // Converter para o formato esperado
      const result = filtered.map((item: any) => ({
        id: item.id, // Já prioriza ID global nos serviços de cache
        idLocal: item.idLocal, // Manter referência ao ID local se necessário
        protocoloLocal: item.protocoloLocal,
        aluno: {
          nome: item.aluno?.nome || "",
          etapa: item.aluno?.etapa || "",
          necessidadesEspeciais: item.aluno?.necessidadesEspeciais || false,
        },
        responsavel: {
          nome: item.responsavel?.nome || "",
        },
        createdAt: item.createdAt,
      }));

      // Debug: Mostrar IDs para verificar se estão corretos
      console.log(
        "🔍 IDs das pré-matrículas:",
        result.map((r) => ({ protocolo: r.protocoloLocal, id: r.id, idLocal: r.idLocal }))
      );

      return result;
    },
  });

  const selectedPre = useMemo(
    () => pres?.find((p) => p.id === selectedPreId),
    [pres, selectedPreId]
  );

  useEffect(() => {
    if (selectedPre?.aluno?.etapa) {
      setEtapaFiltro(selectedPre.aluno.etapa);
    }
  }, [selectedPre]);

  const { data: turmas, isLoading: loadingTurmas } = useQuery({
    queryKey: ["turmas", etapaFiltro, turnoFiltro],
    queryFn: async (): Promise<TurmaResumo[]> => {
      const params = new URLSearchParams();
      if (etapaFiltro !== "todos") params.set("etapa", etapaFiltro);
      if (turnoFiltro !== "todos") params.set("turno", turnoFiltro);
      params.set("limit", "20");
      try {
        const result = await apiClient.get(`/api/turmas?${params}`);
        return ((result as any).data || []) as TurmaResumo[];
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        return [];
      }
    },
    enabled: !!selectedPreId,
  });

  const criarMatricula = useMutation({
    mutationFn: async () => {
      if (!selectedPreId) {
        throw new Error("Selecione uma pré-matrícula");
      }

      if (!turmaId) {
        throw new Error("Selecione uma turma para a matrícula");
      }

      console.log("🎯 Criando matrícula:", {
        preMatriculaId: selectedPreId,
        selectedPre: selectedPre,
        turmaId,
        dataMatricula,
        documentosIniciais: docsSelecionados,
      });

      // Verificar se a pré-matrícula está sincronizada
      // Buscar no IndexedDB usando o idLocal se disponível, ou o ID fornecido
      let preMatriculaIdToUse = selectedPreId;
      const preMatriculaLocal = selectedPre?.idLocal 
        ? await db.matriculas.get(selectedPre.idLocal)
        : await db.matriculas.where("id").equals(selectedPreId).first();

      if (!preMatriculaLocal) {
        // Se não encontrou localmente, pode estar apenas no servidor
        console.log("⚠️ Pré-matrícula não encontrada localmente, assumindo que está sincronizada");
      } else if (preMatriculaLocal.sync_status !== "synced") {
        // Pré-matrícula não está sincronizada, tentar sincronizar
        console.log("🔄 Pré-matrícula não sincronizada, tentando sincronizar...");
        
        if (!isOnline()) {
          throw new Error(
            "A pré-matrícula selecionada ainda não foi sincronizada com o servidor. " +
            "Por favor, aguarde a sincronização automática ou conecte-se à internet."
          );
        }

        // Tentar sincronizar
        try {
          const syncResult = await syncPendingOperations();
          
          if (syncResult.failed > 0) {
            console.warn(`⚠️ ${syncResult.failed} item(s) falharam na sincronização`);
          }

          // Aguardar um pouco e verificar novamente
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Buscar novamente para verificar se foi sincronizada
          const preMatriculaAtualizada = selectedPre?.idLocal
            ? await db.matriculas.get(selectedPre.idLocal)
            : await db.matriculas.where("id").equals(selectedPreId).first();

          if (preMatriculaAtualizada?.sync_status !== "synced") {
            throw new Error(
              "Não foi possível sincronizar a pré-matrícula. " +
              "Por favor, aguarde alguns instantes e tente novamente."
            );
          }

          // Atualizar o ID para usar o ID global sincronizado
          if (preMatriculaAtualizada.idGlobal) {
            preMatriculaIdToUse = preMatriculaAtualizada.idGlobal;
            console.log(`✅ Pré-matrícula sincronizada! Usando ID global: ${preMatriculaIdToUse}`);
          }
        } catch (syncError: any) {
          console.error("❌ Erro ao sincronizar:", syncError);
          throw new Error(
            `Erro ao sincronizar pré-matrícula: ${syncError.message || "Erro desconhecido"}. ` +
            "Por favor, tente novamente."
          );
        }
      } else {
        // Pré-matrícula está sincronizada, usar o ID global se disponível
        if (preMatriculaLocal.idGlobal) {
          preMatriculaIdToUse = preMatriculaLocal.idGlobal;
          console.log(`✅ Pré-matrícula já sincronizada. Usando ID global: ${preMatriculaIdToUse}`);
        }
      }

      const payload = {
        turmaId: turmaId || null,
        dataMatricula,
        documentosIniciais: docsSelecionados.map((t) => ({ tipo: t })),
        observacoes,
      };

      console.log("📦 Payload:", payload);
      console.log("📤 Enviando para:", `/api/pre-matriculas/${preMatriculaIdToUse}/converter`);

      try {
        const result = await apiClient.post(
          `/api/pre-matriculas/${preMatriculaIdToUse}/converter`,
          payload
        );
        console.log("✅ Matrícula criada:", result);
        return result;
      } catch (error: any) {
        console.error("❌ Erro ao criar matrícula:", error);

        // Mapear erros específicos para mensagens mais claras
        let errorMessage = error?.message || "Falha ao criar matrícula";

        if (errorMessage.includes("não encontrada") || errorMessage.includes("not found")) {
          errorMessage =
            "Pré-matrícula não encontrada no servidor. " +
            "A pré-matrícula pode ainda não ter sido sincronizada. " +
            "Por favor, aguarde alguns instantes e tente novamente.";
        } else if (errorMessage.includes("não possui vagas")) {
          errorMessage =
            "A turma selecionada não possui vagas disponíveis. Tente outra turma.";
        } else if (errorMessage.includes("não está ativa")) {
          errorMessage =
            "A turma selecionada não está ativa. Tente outra turma.";
        } else if (errorMessage.includes("não é compatível")) {
          errorMessage =
            "A turma selecionada não é compatível com a etapa do aluno.";
        } else if (errorMessage.includes("Nenhuma turma disponível")) {
          errorMessage =
            "Não há turmas disponíveis para esta etapa. Entre em contato com a administração.";
        }

        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success("Matrícula criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["pre-matriculas"] });
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
    },
    onError: (err: any) => toast.error(String(err.message || err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/matriculas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nova Matrícula
            </h1>
            <p className="text-muted-foreground">
              Selecione uma pré‑matrícula, atribua a turma e confirme.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Pré‑Matrícula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="w-full">
              <Label className="mb-2 block">Buscar aluno</Label>
              <Input
                className="w-full"
                placeholder="Digite o nome do aluno"
                value={searchPre}
                onChange={(e) => setSearchPre(e.target.value)}
              />
            </div>
            <div className="w-full">
              <Label className="mb-2 block">Pré‑Matrícula</Label>
              <Select value={selectedPreId} onValueChange={setSelectedPreId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={loadingPres ? "Carregando..." : "Selecione"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(pres || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.protocoloLocal} — {p.aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPre && (
            <div className="text-sm text-muted-foreground">
              Aluno:{" "}
              <span className="font-medium">{selectedPre.aluno.nome}</span>
              {selectedPre.aluno.necessidadesEspeciais && (
                <span className="ml-2 inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">
                  Cuidadora necessária (automático)
                </span>
              )}
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
              <Select
                value={etapaFiltro}
                onValueChange={setEtapaFiltro}
                disabled={!!selectedPreId}
              >
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
                disabled={!selectedPreId}
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
              disabled={!selectedPreId || !turmaId || criarMatricula.isPending}
            >
              {criarMatricula.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Matrícula
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
