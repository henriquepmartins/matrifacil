export class Telefone {
  private readonly value: string;

  constructor(telefone: string) {
    const cleanPhone = telefone.replace(/\D/g, "");

    if (!this.isValid(cleanPhone)) {
      throw new Error("Telefone inválido");
    }

    this.value = cleanPhone;
  }

  private isValid(phone: string): boolean {
    return phone.length >= 10 && phone.length <= 11;
  }

  toString(): string {
    return this.value;
  }

  getFormatted(): string {
    if (this.value.length === 11) {
      return this.value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else {
      return this.value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
  }
}
