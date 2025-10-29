"use client";

import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfflineSync } from "@/lib/hooks/useOfflineSync";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SyncIndicator() {
  const { isOnline, isSyncing, stats, sync } = useOfflineSync();
  const queryClient = useQueryClient();

  const getStatusIcon = () => {
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (isOnline) return <Wifi className="h-4 w-4" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (isSyncing) return "text-blue-500";
    if (isOnline) return "text-green-500";
    return "text-red-500";
  };

  const getStatusText = () => {
    if (isSyncing) return "Sincronizando...";
    if (isOnline) return "Online";
    return "Offline";
  };

  const hasPendingItems = stats.pending > 0;

  console.log("📊 SyncIndicator stats:", stats, "hasPending:", hasPendingItems);

  const handleSync = async () => {
    try {
      console.log("🔄 Iniciando sincronização manual...");
      const result = await sync();
      console.log("✅ Resultado da sincronização:", result);

      if (result?.success > 0) {
        toast.success(`${result.success} item(s) sincronizado(s) com sucesso!`);

        // Aguardar um pouco para garantir que IndexedDB foi atualizado
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Invalidar queries e forçar refetch
        console.log("🔄 Invalidando queries...");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["pre-matriculas"],
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: ["matriculas"],
            refetchType: "all",
          }),
        ]);

        console.log("✅ Queries invalidadas e refetchadas");
      }
    } catch (err: any) {
      console.error("❌ Erro na sincronização:", err);
      toast.error(err?.message || "Erro ao sincronizar");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status de conexão */}
      <div className="flex items-center gap-1">
        <div className={cn("flex items-center gap-1", getStatusColor())}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Indicador de itens pendentes */}
      {hasPendingItems && (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {stats.pending} pendente{stats.pending !== 1 ? "s" : ""}
        </Badge>
      )}

      {/* Botão de sincronização manual */}
      {isOnline && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing || !hasPendingItems}
          className="h-8"
        >
          {isSyncing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          <span className="ml-1">Sincronizar</span>
        </Button>
      )}

      {/* Indicador de sucesso */}
      {isOnline && !isSyncing && !hasPendingItems && stats.synced > 0 && (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Sincronizado</span>
        </div>
      )}
    </div>
  );
}
