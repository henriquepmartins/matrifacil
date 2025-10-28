"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Database, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  clearLocalDatabase,
  deleteLocalDatabase,
  clearTestData,
  clearTestDataForce,
} from "@/lib/db";

export default function ConfiguracoesPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingTests, setIsClearingTests] = useState(false);

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "⚠️ Tem certeza que deseja limpar todos os dados do cache local?\n\nIsso removerá todas as pré-matrículas, alunos, responsáveis e outros dados cacheados."
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      await clearLocalDatabase();
      toast.success("✅ Cache limpo com sucesso!");
      // Recarrega a página após 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      toast.error("❌ Erro ao limpar cache");
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteDatabase = async () => {
    if (
      !confirm(
        "⚠️⚠️⚠️ ATENÇÃO: Esta ação irá DELETAR completamente o banco de dados local e recarregar a página!\n\nTodos os dados não sincronizados serão PERDIDOS!\n\nTem certeza absoluta?"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLocalDatabase();
      toast.success("✅ Banco de dados deletado com sucesso!");
      // A página será recarregada automaticamente pela função deleteLocalDatabase
    } catch (error) {
      console.error("Erro ao deletar banco:", error);
      toast.error("❌ Erro ao deletar banco de dados");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearTestData = async () => {
    if (
      !confirm(
        "⚠️ Tem certeza que deseja limpar apenas os dados de teste?\n\nIsso removerá alunos, responsáveis e matrículas, mas manterá usuários e sessões."
      )
    ) {
      return;
    }

    setIsClearingTests(true);
    try {
      // Tentar método normal primeiro
      await clearTestData();
      toast.success("✅ Dados de teste limpos com sucesso!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro ao limpar dados de teste:", error);
      console.log("🔄 Tentando método forçado...");

      // Se falhar, tentar método forçado
      try {
        await clearTestDataForce();
        toast.success("✅ Dados de teste limpos com sucesso (modo forçado)!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (fallbackError) {
        console.error("Erro no método forçado:", fallbackError);
        toast.error(
          "❌ Erro ao limpar dados de teste. Tente 'Deletar Banco de Dados'."
        );
      }
    } finally {
      setIsClearingTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>
      </div>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Banco de Dados Local
          </CardTitle>
          <CardDescription>
            Gerencie o cache local (IndexedDB) do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O banco de dados local armazena dados offline para trabalhar sem
              conexão. Limpe ou delete os dados se estiverem causando problemas.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            <div className="border rounded-lg p-4 space-y-2 bg-orange-50 dark:bg-orange-950/20">
              <h3 className="font-semibold flex items-center gap-2 text-orange-800 dark:text-orange-300">
                <AlertTriangle className="h-4 w-4" />
                Limpar Dados de Teste
              </h3>
              <p className="text-sm text-muted-foreground">
                Remove apenas dados de teste (alunos, responsáveis, matrículas).
                Mantém usuários e sessões.
              </p>
              <Button
                onClick={handleClearTestData}
                disabled={isClearing || isDeleting || isClearingTests}
                variant="outline"
                className="w-full border-orange-300 hover:bg-orange-100"
              >
                {isClearingTests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Dados de Teste
                  </>
                )}
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Limpar Cache
              </h3>
              <p className="text-sm text-muted-foreground">
                Remove todos os dados cacheados, mantendo a estrutura do banco.
              </p>
              <Button
                onClick={handleClearDatabase}
                disabled={isClearing || isDeleting || isClearingTests}
                variant="outline"
                className="w-full"
              >
                {isClearing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Cache
                  </>
                )}
              </Button>
            </div>

            <div className="border border-destructive/50 rounded-lg p-4 space-y-2 bg-destructive/5">
              <h3 className="font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Deletar Banco de Dados
              </h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-destructive">ATENÇÃO:</span>{" "}
                Remove completamente o banco IndexedDB e recarrega a página. Use
                apenas em caso de problemas graves.
              </p>
              <Button
                onClick={handleDeleteDatabase}
                disabled={isClearing || isDeleting}
                variant="destructive"
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive-foreground mr-2"></div>
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Banco de Dados
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Conexão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>URL da API:</strong>{" "}
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}
          </p>
          <p className="text-sm text-muted-foreground">
            Se o servidor não estiver respondendo, verifique se está rodando em{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              http://localhost:8080
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
