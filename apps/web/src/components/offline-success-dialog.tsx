"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Cloud, HardDrive, ArrowUp } from "lucide-react";

interface OfflineSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocoloLocal?: string;
}

export function OfflineSuccessDialog({
  open,
  onOpenChange,
  protocoloLocal,
}: OfflineSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Ícone principal com animação */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full animate-pulse"></div>
              </div>
              <CheckCircle2 className="relative w-16 h-16 text-green-500 animate-scale-in" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Pré-matrícula Salva Localmente!
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <div className="space-y-3">
              <p className="text-base text-gray-700 dark:text-gray-300">
                Seus dados foram salvos com segurança no dispositivo e serão
                sincronizados automaticamente quando a conexão for restaurada.
              </p>

              {protocoloLocal && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Protocolo Local:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {protocoloLocal}
                    </span>
                  </div>
                </div>
              )}

              {/* Informações visuais */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-900 dark:text-blue-300">
                    Dados Seguros
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Cloud className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-900 dark:text-purple-300">
                    Sync Automático
                  </span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Entendi
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Você pode continuar usando o app normalmente mesmo sem internet
          </p>
        </div>

        {/* Animação decorativa */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-shimmer"></div>
      </DialogContent>
    </Dialog>
  );
}
