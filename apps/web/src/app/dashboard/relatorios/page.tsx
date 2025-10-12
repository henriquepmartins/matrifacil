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
import { Download, FileText, BarChart, Calendar, Filter } from "lucide-react";

export default function RelatoriosPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("matriculas");
  const [formato, setFormato] = useState<string>("pdf");
  const [periodo, setPeriodo] = useState<string>("mes_atual");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTurma, setFiltroTurma] = useState<string>("todos");

  const handleGerarRelatorio = () => {
    // Simular geração de relatório
    console.log("Gerando relatório:", {
      tipoRelatorio,
      formato,
      periodo,
      dataInicio,
      dataFim,
      filtroStatus,
      filtroTurma,
    });

    // Aqui seria feita a chamada para a API que gera o relatório
    alert("Relatório gerado com sucesso! (Simulação)");
  };

  return (
    <ProtectedRoute permission="canAccessRelatorios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Gere relatórios em PDF e CSV para análise e prestação de contas.
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
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
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
              <div className="text-2xl font-bold">Hoje</div>
              <p className="text-xs text-muted-foreground">14:30</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Geração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Gerar Novo Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de Relatório */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
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
              <div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
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
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="data-inicio">Data Início</Label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
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
              <div>
                <Label htmlFor="filtro-turma">Turma</Label>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
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

            {/* Botão de Geração */}
            <div className="flex justify-end">
              <Button onClick={handleGerarRelatorio} className="min-w-[200px]">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">
                      Relatório de Matrículas - Janeiro 2024
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Gerado em 15/01/2024 às 14:30
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">
                      Relatório de Turmas - Janeiro 2024
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Gerado em 14/01/2024 às 10:15
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
