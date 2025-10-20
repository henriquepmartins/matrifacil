import { Aluno } from "./aluno.entity";
import { Responsavel } from "./responsavel.entity";
import { StatusMatricula } from "./aluno.entity";

export type Turno = "manha" | "tarde" | "integral";

export class Turma {
  constructor(
    public readonly id: string,
    public readonly idGlobal: string,
    public readonly etapa: string,
    public readonly turno: Turno,
    public readonly capacidade: number,
    public readonly vagasDisponiveis: number,
    public readonly anoLetivo: string,
    public readonly nome: string,
    public readonly ativa: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    idGlobal: string;
    etapa: string;
    turno: Turno;
    capacidade: number;
    vagasDisponiveis: number;
    anoLetivo: string;
    nome: string;
    ativa?: boolean;
  }): Turma {
    return new Turma(
      data.id,
      data.idGlobal,
      data.etapa,
      data.turno,
      data.capacidade,
      data.vagasDisponiveis,
      data.anoLetivo,
      data.nome,
      data.ativa ?? true
    );
  }

  temVagasDisponiveis(): boolean {
    return this.vagasDisponiveis > 0;
  }
}

export class Matricula {
  constructor(
    public readonly id: string,
    public readonly idGlobal: string,
    public readonly protocoloLocal: string,
    public readonly aluno: Aluno,
    public readonly responsavel: Responsavel,
    public readonly turma?: Turma,
    public readonly status: StatusMatricula = "pre",
    public readonly dataMatricula?: Date,
    public readonly observacoes?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    idGlobal: string;
    protocoloLocal: string;
    aluno: Aluno;
    responsavel: Responsavel;
    turma?: Turma;
    status?: StatusMatricula;
    dataMatricula?: Date;
    observacoes?: string;
  }): Matricula {
    return new Matricula(
      data.id,
      data.idGlobal,
      data.protocoloLocal,
      data.aluno,
      data.responsavel,
      data.turma,
      data.status || "pre",
      data.dataMatricula,
      data.observacoes
    );
  }

  converterParaCompleta(turma?: Turma, dataMatricula?: Date): Matricula {
    return new Matricula(
      this.id,
      this.idGlobal,
      this.protocoloLocal,
      this.aluno.updateStatus("completo"),
      this.responsavel,
      turma || this.turma,
      "completo",
      dataMatricula || new Date(),
      this.observacoes,
      this.createdAt,
      new Date()
    );
  }

  aprovar(): Matricula {
    return new Matricula(
      this.id,
      this.idGlobal,
      this.protocoloLocal,
      this.aluno.updateStatus("completo"),
      this.responsavel,
      this.turma,
      "completo",
      this.dataMatricula || new Date(),
      this.observacoes,
      this.createdAt,
      new Date()
    );
  }
}
