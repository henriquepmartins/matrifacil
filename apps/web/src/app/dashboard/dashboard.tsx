"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: privateData } = useQuery({
    queryKey: ["privateData"],
    queryFn: async () => {
      // Exemplo de chamada para uma rota protegida
      // Você pode criar esta rota no backend se necessário
      return { message: "Dados privados carregados com sucesso" };
    },
    enabled: !!user,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bem-vindo, {user?.name}!</p>
      <p className="mt-2">API: {privateData?.message}</p>
    </div>
  );
}
