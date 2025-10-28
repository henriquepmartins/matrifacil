/**
 * Gerador de protocolos no formato: ETAPA EDUCACIONAL - ANO - ID
 * Exemplo: BERCARIO - 2025 - 001
 */

export interface ProtocoloData {
  etapa: string;
  ano: number;
  sequencia: number;
}

export class ProtocoloGenerator {
  private static readonly ETAPA_MAP: Record<string, string> = {
    bercario: "BERCARIO",
    maternal: "MATERNAL",
    pre_escola: "PRE-ESCOLA",
    fundamental: "FUNDAMENTAL",
  };

  /**
   * Gera um protocolo no novo formato
   */
  static generate(etapa: string, ano?: number): string {
    const anoAtual = ano || new Date().getFullYear();
    const etapaFormatada = this.formatEtapa(etapa);

    // Por enquanto, usar sequência 001 (será implementada lógica de contagem depois)
    const sequencia = "001";

    return `${etapaFormatada} - ${anoAtual} - ${sequencia}`;
  }

  /**
   * Formata a etapa removendo acentos e cedilhas
   */
  private static formatEtapa(etapa: string): string {
    const etapaNormalizada = etapa.toLowerCase().trim();
    return this.ETAPA_MAP[etapaNormalizada] || etapaNormalizada.toUpperCase();
  }

  /**
   * Valida se um protocolo está no formato correto
   */
  static isValid(protocolo: string): boolean {
    const regex = /^[A-Z-]+ - \d{4} - \d{3}$/;
    return regex.test(protocolo);
  }

  /**
   * Extrai dados do protocolo
   */
  static parse(protocolo: string): ProtocoloData | null {
    const match = protocolo.match(/^([A-Z-]+) - (\d{4}) - (\d{3})$/);
    if (!match) return null;

    return {
      etapa: match[1],
      ano: parseInt(match[2]),
      sequencia: parseInt(match[3]),
    };
  }

  /**
   * Gera próximo protocolo baseado em uma lista existente
   */
  static generateNext(
    etapa: string,
    existingProtocols: string[],
    ano?: number
  ): string {
    const anoAtual = ano || new Date().getFullYear();
    const etapaFormatada = this.formatEtapa(etapa);

    // Filtrar protocolos da mesma etapa e ano
    const relevantProtocols = existingProtocols.filter((p) => {
      const parsed = this.parse(p);
      return (
        parsed && parsed.etapa === etapaFormatada && parsed.ano === anoAtual
      );
    });

    // Encontrar próxima sequência
    let nextSequencia = 1;
    if (relevantProtocols.length > 0) {
      const sequencias = relevantProtocols
        .map((p) => this.parse(p)?.sequencia || 0)
        .sort((a, b) => b - a);
      nextSequencia = sequencias[0] + 1;
    }

    return `${etapaFormatada} - ${anoAtual} - ${nextSequencia
      .toString()
      .padStart(3, "0")}`;
  }
}
