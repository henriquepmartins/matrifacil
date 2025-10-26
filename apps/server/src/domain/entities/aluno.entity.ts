export type Etapa = "bercario" | "maternal" | "pre_escola" | "fundamental";
export type StatusMatricula = "pre" | "pendente_doc" | "completo" | "concluido";

export class Aluno {
  constructor(
    public readonly id: string,
    public readonly idGlobal: string,
    public readonly nome: string,
    public readonly dataNascimento: Date,
    public readonly etapa: Etapa,
    public readonly status: StatusMatricula,
    public readonly necessidadesEspeciais: boolean,
    public readonly observacoes?: string,
    public readonly rg?: string,
    public readonly cpf?: string,
    public readonly naturalidade?: string,
    public readonly nacionalidade: string = "Brasileira",
    public readonly sexo?: string,
    public readonly corRaca?: string,
    public readonly tipoSanguineo?: string,
    public readonly alergias?: string,
    public readonly medicamentos?: string,
    public readonly doencas?: string,
    public readonly carteiraVacina: boolean = false,
    public readonly observacoesSaude?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    idGlobal: string;
    nome: string;
    dataNascimento: Date;
    etapa: Etapa;
    status?: StatusMatricula;
    necessidadesEspeciais?: boolean;
    observacoes?: string;
    rg?: string;
    cpf?: string;
    naturalidade?: string;
    nacionalidade?: string;
    sexo?: string;
    corRaca?: string;
    tipoSanguineo?: string;
    alergias?: string;
    medicamentos?: string;
    doencas?: string;
    carteiraVacina?: boolean;
    observacoesSaude?: string;
  }): Aluno {
    return new Aluno(
      data.id,
      data.idGlobal,
      data.nome,
      data.dataNascimento,
      data.etapa,
      data.status || "pre",
      data.necessidadesEspeciais || false,
      data.observacoes,
      data.rg,
      data.cpf,
      data.naturalidade,
      data.nacionalidade || "Brasileira",
      data.sexo,
      data.corRaca,
      data.tipoSanguineo,
      data.alergias,
      data.medicamentos,
      data.doencas,
      data.carteiraVacina || false,
      data.observacoesSaude
    );
  }

  updateStatus(status: StatusMatricula): Aluno {
    return new Aluno(
      this.id,
      this.idGlobal,
      this.nome,
      this.dataNascimento,
      this.etapa,
      status,
      this.necessidadesEspeciais,
      this.observacoes,
      this.rg,
      this.cpf,
      this.naturalidade,
      this.nacionalidade,
      this.sexo,
      this.corRaca,
      this.tipoSanguineo,
      this.alergias,
      this.medicamentos,
      this.doencas,
      this.carteiraVacina,
      this.observacoesSaude,
      this.createdAt,
      new Date()
    );
  }
}