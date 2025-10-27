/**
 * Utilitários para detecção de conexão de rede
 */

/**
 * Verifica se o navegador está online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Registra callback para mudanças no status da rede
 * @param callback Função chamada quando a conexão muda
 * @returns Função para remover os listeners
 */
export function onNetworkChange(callback: (online: boolean) => void) {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
