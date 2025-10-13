"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermissions, type Permissions } from "@/lib/hooks/usePermissions";
import { useAuth } from "@/lib/hooks/useAuth";
import Loader from "./loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: keyof Permissions;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente para proteger rotas baseado em permissões
 */
export default function ProtectedRoute({
  children,
  permission,
  fallback,
  redirectTo = "/dashboard",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { [permission]: hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isLoading && user && !hasPermission) {
      router.push(redirectTo as any);
    }
  }, [user, isLoading, hasPermission, router, redirectTo]);

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  if (!hasPermission) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
