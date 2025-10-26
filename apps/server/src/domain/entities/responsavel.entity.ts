export class Responsavel {
  constructor(
    public readonly id: string,
    public readonly idGlobal: string,
    public readonly nome: string,
    public readonly cpf: string,
    public readonly telefone: string,
    public readonly endereco: string,
    public readonly bairro: string,
    public readonly email?: string,
    public readonly parentesco: string = "pai",
    public readonly autorizadoRetirada: boolean = true,
    public readonly rg?: string,
    public readonly dataNascimento?: Date,
    public readonly naturalidade?: string,
    public readonly nacionalidade: string = "Brasileira",
    public readonly sexo?: string,
    public readonly estadoCivil?: string,
    public readonly profissao?: string,
    public readonly localTrabalho?: string,
    public readonly telefoneTrabalho?: string,
    public readonly contatoEmergencia?: string,
    public readonly telefoneEmergencia?: string,
    public readonly parentescoEmergencia?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    idGlobal: string;
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    bairro: string;
    email?: string;
    parentesco?: string;
    autorizadoRetirada?: boolean;
    rg?: string;
    dataNascimento?: Date;
    naturalidade?: string;
    nacionalidade?: string;
    sexo?: string;
    estadoCivil?: string;
    profissao?: string;
    localTrabalho?: string;
    telefoneTrabalho?: string;
    contatoEmergencia?: string;
    telefoneEmergencia?: string;
    parentescoEmergencia?: string;
  }): Responsavel {
    return new Responsavel(
      data.id,
      data.idGlobal,
      data.nome,
      data.cpf,
      data.telefone,
      data.endereco,
      data.bairro,
      data.email,
      data.parentesco || "pai",
      data.autorizadoRetirada ?? true,
      data.rg,
      data.dataNascimento,
      data.naturalidade,
      data.nacionalidade || "Brasileira",
      data.sexo,
      data.estadoCivil,
      data.profissao,
      data.localTrabalho,
      data.telefoneTrabalho,
      data.contatoEmergencia,
      data.telefoneEmergencia,
      data.parentescoEmergencia
    );
  }
}
