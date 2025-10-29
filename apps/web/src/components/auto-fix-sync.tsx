"use client";

import { useEffect, useRef } from "react";

/**
 * Componente que detecta loops infinitos de sincronização e corrige automaticamente
 */
export default function AutoFixSync() {
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const hasFixedRef = useRef(false);

  useEffect(() => {
    // Interceptar erros de console para detectar loops
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args.join(" ");
      
      // Detectar erros de sincronização em loop
      if (
        message.includes("Assignment to constant variable") ||
        message.includes("Erro não resolvível") ||
        message.includes("ObjectStore não encontrado")
      ) {
        const now = Date.now();
        
        // Se múltiplos erros em menos de 5 segundos, é um loop
        if (now - lastErrorTimeRef.current < 5000) {
          errorCountRef.current++;
        } else {
          errorCountRef.current = 1;
        }
        
        lastErrorTimeRef.current = now;
        
        // Se 3+ erros em loop e ainda não corrigiu, aplicar correção
        if (errorCountRef.current >= 3 && !hasFixedRef.current) {
          hasFixedRef.current = true;
          
          console.warn(
            "🔧 LOOP INFINITO DETECTADO - Aplicando correção automática..."
          );
          
          // Aguardar um pouco para não interferir com transações em andamento
          setTimeout(async () => {
            try {
              const { diagnoseAndFix } = await import("@/lib/utils/diagnose-and-fix");
              await diagnoseAndFix();
              
              // Recarregar página após correção
              setTimeout(() => {
                console.log("🔄 Recarregando página para aplicar correções...");
                window.location.reload();
              }, 2000);
            } catch (error) {
              console.error("❌ Erro ao aplicar correção automática:", error);
              hasFixedRef.current = false; // Permitir nova tentativa
            }
          }, 1000);
        }
      }
      
      // Chamar console.error original
      originalError.apply(console, args);
    };
    
    // Restaurar console.error original na desmontagem
    return () => {
      console.error = originalError;
    };
  }, []);

  return null; // Componente invisível
}

