import { ProtocoloGenerator } from "../../utils/protocol-generator.js";

export class Protocolo {
  private readonly value: string;

  constructor(protocolo: string) {
    if (!this.isValid(protocolo)) {
      throw new Error("Protocolo inválido");
    }
    this.value = protocolo;
  }

  private isValid(protocolo: string): boolean {
    return ProtocoloGenerator.isValid(protocolo);
  }

  static generate(etapa: string, ano?: number): Protocolo {
    return new Protocolo(ProtocoloGenerator.generate(etapa, ano));
  }

  static generateNext(
    etapa: string,
    existingProtocols: string[],
    ano?: number
  ): Protocolo {
    return new Protocolo(
      ProtocoloGenerator.generateNext(etapa, existingProtocols, ano)
    );
  }

  toString(): string {
    return this.value;
  }

  getEtapa(): string {
    const parsed = ProtocoloGenerator.parse(this.value);
    return parsed?.etapa || "";
  }

  getYear(): number {
    const parsed = ProtocoloGenerator.parse(this.value);
    return parsed?.ano || 0;
  }

  getSequence(): number {
    const parsed = ProtocoloGenerator.parse(this.value);
    return parsed?.sequencia || 0;
  }
}
