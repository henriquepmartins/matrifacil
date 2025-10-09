/**
 * Este arquivo foi substituído pelo hook useAuth
 * Migração do Better Auth para autenticação customizada com Express
 *
 * Use: import { useAuth } from "@/lib/hooks/useAuth";
 */

export const authClient = {
  useSession: () => {
    console.warn(
      "authClient.useSession está deprecated. Use useAuth() ao invés."
    );
    return { isPending: false, data: null };
  },
};
