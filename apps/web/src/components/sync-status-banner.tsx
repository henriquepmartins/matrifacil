"use client";

import { useOfflineSync } from "@/lib/hooks/useOfflineSync";
import { useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, Upload, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function SyncStatusBanner() {
  const { isOnline, isSyncing, stats, sync, lastSyncTime, error } =
    useOfflineSync();
  const { status } = useSyncStatus();

  const handleManualSync = async () => {
    try {
      toast.info(`Sincronizando ${stats.pending} operação(ões)...`, {
        duration: 2000,
      });

      const result = await sync();

      if (result && result.success > 0) {
        toast.success(
          `${result.success} registro(s) sincronizado(s) e salvo(s) no banco! 🎉`,
          {
            duration: 4000,
          }
        );
      } else if (stats.pending === 0) {
        toast.success("Todos os dados já estão sincronizados!", {
          duration: 3000,
        });
      }
    } catch (err: any) {
      console.error("Erro na sincronização manual:", err);
      toast.error(err?.message || "Erro ao sincronizar. Tente novamente.");
    }
  };

  // Não mostrar banner se não houver pendências e estiver online
  if (isOnline && stats.pending === 0 && stats.failed === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className={`mx-auto max-w-7xl px-4 py-3 shadow-lg ${
          !isOnline
            ? "bg-red-500 text-white"
            : stats.failed > 0
            ? "bg-red-600 text-white"
            : stats.pending > 0
            ? "bg-yellow-500 text-white"
            : "bg-green-500 text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <>
                <WifiOff className="h-5 w-5" />
                <div>
                  <p className="font-medium">Modo Offline</p>
                  <p className="text-sm opacity-90">
                    {stats.pending} operação(ões) pendente(s)
                  </p>
                </div>
              </>
            ) : isSyncing ? (
              <>
                <Upload className="h-5 w-5 animate-pulse" />
                <div>
                  <p className="font-medium">Sincronizando...</p>
                  <p className="text-sm opacity-90">
                    Enviando dados para o servidor
                  </p>
                </div>
              </>
            ) : stats.pending > 0 ? (
              <>
                <Wifi className="h-5 w-5" />
                <div>
                  <p className="font-medium">
                    {stats.pending} operação(ões) pendente(s)
                  </p>
                  <p className="text-sm opacity-90">
                    {lastSyncTime
                      ? `Última sincronização: ${lastSyncTime.toLocaleTimeString()}`
                      : "Aguardando sincronização"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="font-medium">Sincronizado</p>
                  <p className="text-sm opacity-90">
                    Todos os dados estão atualizados
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4" />
                <span className="opacity-90">{error}</span>
              </div>
            )}
          </div>

          {!isOnline ? (
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-gray-900"
              disabled
            >
              Aguardando conexão...
            </Button>
          ) : stats.pending > 0 && !isSyncing ? (
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-gray-900"
              onClick={handleManualSync}
            >
              Sincronizar Agora
            </Button>
          ) : null}
        </div>

        {/* Barra de progresso durante sincronização */}
        {isSyncing && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-full animate-pulse bg-white/50"></div>
          </div>
        )}
      </div>
    </div>
  );
}
