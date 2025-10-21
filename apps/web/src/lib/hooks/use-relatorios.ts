import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RelatorioApiService,
  type GerarRelatorioRequest,
  type ListarRelatoriosResponse,
} from "@/infrastructure/api/relatorio-api.service";
import { toast } from "sonner";

export function useRelatorios() {
  const queryClient = useQueryClient();

  const gerarRelatorioMutation = useMutation({
    mutationFn: async (request: GerarRelatorioRequest) => {
      const blob = await RelatorioApiService.gerarRelatorio(request);
      const filename = `relatorio_${request.tipo}_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")}.${request.formato}`;

      RelatorioApiService.downloadFile(blob, filename);
      return { blob, filename };
    },
    onSuccess: (data) => {
      toast.success(`Relatório ${data.filename} gerado e baixado com sucesso!`);
      // Invalidar cache de relatórios para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["relatorios", "historico"] });
    },
    onError: (error) => {
      toast.error("Erro ao gerar relatório. Tente novamente.");
      console.error("Erro ao gerar relatório:", error);
    },
  });

  const listarRelatoriosQuery = useQuery({
    queryKey: ["relatorios", "historico"],
    queryFn: () => RelatorioApiService.listarRelatoriosGerados(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    gerarRelatorio: gerarRelatorioMutation.mutate,
    isGerandoRelatorio: gerarRelatorioMutation.isPending,
    relatorios: listarRelatoriosQuery.data?.data || [],
    totalRelatorios: listarRelatoriosQuery.data?.total || 0,
    isLoadingRelatorios: listarRelatoriosQuery.isLoading,
    errorRelatorios: listarRelatoriosQuery.error,
    refetchRelatorios: listarRelatoriosQuery.refetch,
  };
}

export function useRelatoriosHistorico(limit: number = 10, offset: number = 0) {
  return useQuery({
    queryKey: ["relatorios", "historico", limit, offset],
    queryFn: () => RelatorioApiService.listarRelatoriosGerados(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
