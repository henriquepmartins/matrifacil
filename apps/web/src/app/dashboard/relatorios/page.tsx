"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/protected-route";
import { API_URL } from "@/lib/api-client";
import {
  Download,
  FileText,
  BarChart,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { useRelatorios } from "@/lib/hooks/use-relatorios";
import type { GerarRelatorioRequest } from "@/infrastructure/api/relatorio-api.service";
import { AlunoApiService } from "@/infrastructure/api/aluno-api.service";
import { toast } from "sonner";

export default function RelatoriosPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("turmas");
  const [formato, setFormato] = useState<string>("pdf");
  const [periodo, setPeriodo] = useState<string>("mes_atual");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTurma, setFiltroTurma] = useState<string>("todos");
  const [campoData, setCampoData] = useState<string>("createdAt");
  const [search, setSearch] = useState<string>("");
  const [turmasSugeridas, setTurmasSugeridas] = useState<
    { id: string; nome: string; etapa: string; turno: string }[]
  >([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const {
    gerarRelatorio,
    isGerandoRelatorio,
    relatorios,
    totalRelatorios,
    isLoadingRelatorios,
    errorRelatorios,
  } = useRelatorios();

  // Debug logs
  console.log("📊 Relatórios no componente:", {
    relatorios,
    isArray: Array.isArray(relatorios),
    length: relatorios?.length,
    totalRelatorios,
    isLoadingRelatorios,
    errorRelatorios,
  });

  // Garante que relatorios é sempre um array
  const relatoriosList = Array.isArray(relatorios) ? relatorios : [];

  const handleGerarRelatorio = () => {
    try {
      const request: GerarRelatorioRequest = {
        tipo: tipoRelatorio as any,
        formato: formato as any,
        periodo: periodo as any,
        dataInicio:
          periodo === "personalizado" && dataInicio ? dataInicio : undefined,
        dataFim: periodo === "personalizado" && dataFim ? dataFim : undefined,
        campoData: campoData as any,
        status: filtroStatus !== "todos" ? filtroStatus : undefined,
        etapa: filtroTurma !== "todos" ? filtroTurma : undefined,
        search: search || undefined,
      };

      gerarRelatorio(request);
    } catch (error) {
      toast.error(
        "Erro ao gerar relatório. Verifique os dados e tente novamente."
      );
    }
  };

  // Carrega turmas do banco de dados via API
  async function carregarSugestoes(nomeParcial?: string) {
    try {
      console.log("🔍 Buscando turmas via API...", { nomeParcial });

      const response = await fetch(
        `${API_URL}/api/test/check-turmas`
      );
      const result = await response.json();

      if (result.success) {
        const turmas = result.turmas.filter(
          (turma: any) =>
            !nomeParcial ||
            turma.nome.toLowerCase().includes(nomeParcial.toLowerCase())
        );

        console.log(`✅ Encontradas ${turmas.length} turmas:`, turmas);
        setTurmasSugeridas(turmas);
      } else {
        setTurmasSugeridas([]);
      }
    } catch (e) {
      console.error("❌ Erro ao carregar sugestões:", e);
      setTurmasSugeridas([]);
    }
  }

  return (
    <ProtectedRoute permission="canAccessRelatorios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Gere relatórios por turma em PDF e CSV para análise e prestação de
              contas.
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Relatórios Gerados
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingRelatorios ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  totalRelatorios
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingRelatorios ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  totalRelatorios
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Último Relatório
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingRelatorios ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : relatorios.length > 0 ? (
                  new Date(relatorios[0].createdAt).toLocaleDateString("pt-BR")
                ) : (
                  "N/A"
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {relatorios.length > 0
                  ? new Date(relatorios[0].createdAt).toLocaleTimeString(
                      "pt-BR"
                    )
                  : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Geração */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Gerar Relatório por Turma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4">
            {/* Tipo de Relatório */}
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matriculas">Matrículas</SelectItem>
                    <SelectItem value="pre_matriculas">
                      Pré-Matrículas
                    </SelectItem>
                    <SelectItem value="turmas">Turmas</SelectItem>
                    <SelectItem value="documentos">
                      Documentos Pendentes
                    </SelectItem>
                    <SelectItem value="pendencias">Pendências</SelectItem>
                    <SelectItem value="geral">Relatório Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="formato">Formato</Label>
                <Select value={formato} onValueChange={setFormato}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Período */}
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana_atual">Esta Semana</SelectItem>
                    <SelectItem value="mes_atual">Este Mês</SelectItem>
                    <SelectItem value="ano_atual">Este Ano</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {periodo === "personalizado" && (
                <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data-inicio">Data Início</Label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-fim">Data Fim</Label>
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filtros Adicionais */}
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="filtro-status">Status</Label>
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
              <div className="space-y-2">
                <Label htmlFor="filtro-turma">Etapa</Label>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
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

            {/* Campo de Data e Busca */}
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="campo-data">Campo de Data</Label>
                <Select value={campoData} onValueChange={setCampoData}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="dataMatricula">
                      Data de Matrícula
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search">Buscar Turma</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Nome da turma..."
                    value={search}
                    onFocus={() => {
                      console.log("🎯 Campo focado, carregando sugestões...");
                      setMostrarSugestoes(true);
                      carregarSugestoes("");
                    }}
                    onChange={async (e) => {
                      const v = e.target.value;
                      console.log("Mudança no campo:", v);
                      setSearch(v);
                      setMostrarSugestoes(true);
                      await carregarSugestoes(v);
                    }}
                    onBlur={() => {
                      // usa timeout para permitir clique nas opções
                      setTimeout(() => setMostrarSugestoes(false), 150);
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      console.log("Testando carregamento de turmas...");
                      carregarSugestoes("");
                      setMostrarSugestoes(true);
                    }}
                  >
                    🔍
                  </button>
                  {mostrarSugestoes && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white text-gray-900 shadow-lg">
                      {(() => {
                        console.log("🔍 Renderizando sugestões:", {
                          turmasSugeridas,
                          length: turmasSugeridas.length,
                          mostrarSugestoes,
                        });
                        return null;
                      })()}
                      {turmasSugeridas.length > 0 ? (
                        <ul className="max-h-64 overflow-auto py-1">
                          {turmasSugeridas.map((turma) => (
                            <li
                              key={turma.id}
                              className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSearch(turma.nome);
                                setMostrarSugestoes(false);
                              }}
                            >
                              <div className="font-medium">{turma.nome}</div>
                              <div className="text-xs text-gray-500">
                                Etapa: {turma.etapa} | Turno: {turma.turno}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Nenhuma turma encontrada
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de Geração */}
            <div className="flex justify-end pt-1">
              <Button
                onClick={handleGerarRelatorio}
                className="min-w-[200px]"
                disabled={isGerandoRelatorio}
              >
                {isGerandoRelatorio ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGerandoRelatorio ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRelatorios ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando relatórios...</span>
              </div>
            ) : errorRelatorios ? (
                <div className="text-center p-8 text-red-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Erro ao carregar relatórios</p>
                  <p className="text-sm text-muted-foreground">
                    {errorRelatorios instanceof Error ? errorRelatorios.message : "Erro desconhecido"}
                  </p>
                </div>
              ) : relatoriosList.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum relatório gerado ainda.</p>
                  <p className="text-sm">
                    Gere seu primeiro relatório usando o formulário acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatoriosList.map((relatorio) => (
                    <div
                      key={relatorio.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                    <div className="flex items-center gap-3">
                      <FileText
                        className={`h-5 w-5 ${
                          relatorio.formato === "pdf"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{relatorio.nomeArquivo}</p>
                        <p className="text-sm text-muted-foreground">
                          Gerado em{" "}
                          {new Date(relatorio.createdAt).toLocaleString(
                            "pt-BR"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tipo: {relatorio.tipo} | Formato:{" "}
                          {relatorio.formato.toUpperCase()}
                          {relatorio.tamanhoArquivo &&
                            ` | Tamanho: ${relatorio.tamanhoArquivo}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        <Download className="h-4 w-4 mr-1" />
                        {relatorio.formato.toUpperCase()}
                      </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
