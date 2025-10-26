import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RelatorioApiService,
  type GerarRelatorioRequest,
  type ListarRelatoriosResponse,
} from "@/infrastructure/api/relatorio-api.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRelatorios() {
  const queryClient = useQueryClient();
  const router = useRouter();

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
    onError: (error: any) => {
      console.error("Erro ao gerar relatório:", error);
      
      // Verifica se é erro de autenticação
      if (error?.message?.includes("Sessão") || error?.message?.includes("login")) {
        toast.error("Sessão expirada. Redirecionando para login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        toast.error(error?.message || "Erro ao gerar relatório. Tente novamente.");
      }
    },
  });

  const listarRelatoriosQuery = useQuery({
    queryKey: ["relatorios", "historico"],
    queryFn: async () => {
      console.log("🔍 Buscando relatórios...");
      const result = await RelatorioApiService.listarRelatoriosGerados();
      console.log("✅ Relatórios recebidos:", result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      // Não tenta novamente se for erro de autenticação
      if (error?.message?.includes("Sessão") || error?.message?.includes("login")) {
        toast.error("Sessão expirada. Redirecionando para login...");
        setTimeout(() => router.push("/login"), 1500);
        return false;
      }
      return failureCount < 3;
    },
  });

  console.log("📊 Estado do query:", {
    data: listarRelatoriosQuery.data,
    isLoading: listarRelatoriosQuery.isLoading,
    error: listarRelatoriosQuery.error,
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
  const router = useRouter();
  
  return useQuery({
    queryKey: ["relatorios", "historico", limit, offset],
    queryFn: async () => {
      console.log("🔍 Buscando relatórios histórico...", { limit, offset });
      const result = await RelatorioApiService.listarRelatoriosGerados(limit, offset);
      console.log("✅ Relatórios histórico recebidos:", result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      console.error("❌ Erro ao buscar relatórios:", error);
      // Não tenta novamente se for erro de autenticação
      if (error?.message?.includes("Sessão") || error?.message?.includes("login")) {
        toast.error("Sessão expirada. Redirecionando para login...");
        setTimeout(() => router.push("/login"), 1500);
        return false;
      }
      return failureCount < 3;
    },
  });
}
