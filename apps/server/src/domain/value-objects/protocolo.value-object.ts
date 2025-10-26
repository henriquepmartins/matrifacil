export class Protocolo {
  private readonly value: string;

  constructor(protocolo: string) {
    if (!this.isValid(protocolo)) {
      throw new Error("Protocolo inválido");
    }
    this.value = protocolo;
  }

  private isValid(protocolo: string): boolean {
    const protocoloRegex = /^PRE-\d{4}-\d{3}$/;
    return protocoloRegex.test(protocolo);
  }

  static generate(year: number, sequence: number): Protocolo {
    const formattedSequence = sequence.toString().padStart(3, "0");
    return new Protocolo(`PRE-${year}-${formattedSequence}`);
  }

  toString(): string {
    return this.value;
  }

  getYear(): number {
    const match = this.value.match(/PRE-(\d{4})-\d{3}/);
    return match ? parseInt(match[1]) : 0;
  }

  getSequence(): number {
    const match = this.value.match(/PRE-\d{4}-(\d{3})/);
    return match ? parseInt(match[1]) : 0;
  }
}
