import type {
  TipoRelatorio,
  FormatoRelatorio,
  FiltrosRelatorio,
} from "../value-objects/relatorio-filtros.value-object.js";

export interface RelatorioMetadata {
  id: string;
  tipo: TipoRelatorio;
  formato: FormatoRelatorio;
  filtros: FiltrosRelatorio;
  usuarioId: string;
  nomeArquivo: string;
  tamanhoArquivo?: string;
  createdAt: Date;
}

export class RelatorioEntity {
  private readonly _id: string;
  private readonly _tipo: TipoRelatorio;
  private readonly _formato: FormatoRelatorio;
  private readonly _filtros: FiltrosRelatorio;
  private readonly _usuarioId: string;
  private readonly _nomeArquivo: string;
  private readonly _tamanhoArquivo?: string;
  private readonly _createdAt: Date;

  constructor(metadata: RelatorioMetadata) {
    this.validate(metadata);
    this._id = metadata.id;
    this._tipo = metadata.tipo;
    this._formato = metadata.formato;
    this._filtros = metadata.filtros;
    this._usuarioId = metadata.usuarioId;
    this._nomeArquivo = metadata.nomeArquivo;
    this._tamanhoArquivo = metadata.tamanhoArquivo;
    this._createdAt = metadata.createdAt;
  }

  private validate(metadata: RelatorioMetadata): void {
    if (!metadata.id) {
      throw new Error("ID do relatório é obrigatório");
    }

    if (!metadata.tipo) {
      throw new Error("Tipo do relatório é obrigatório");
    }

    if (!metadata.formato) {
      throw new Error("Formato do relatório é obrigatório");
    }

    if (!metadata.usuarioId) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!metadata.nomeArquivo) {
      throw new Error("Nome do arquivo é obrigatório");
    }

    if (!metadata.createdAt) {
      throw new Error("Data de criação é obrigatória");
    }
  }

  get id(): string {
    return this._id;
  }

  get tipo(): TipoRelatorio {
    return this._tipo;
  }

  get formato(): FormatoRelatorio {
    return this._formato;
  }

  get filtros(): FiltrosRelatorio {
    return this._filtros;
  }

  get usuarioId(): string {
    return this._usuarioId;
  }

  get nomeArquivo(): string {
    return this._nomeArquivo;
  }

  get tamanhoArquivo(): string | undefined {
    return this._tamanhoArquivo;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toMetadata(): RelatorioMetadata {
    return {
      id: this._id,
      tipo: this._tipo,
      formato: this._formato,
      filtros: this._filtros,
      usuarioId: this._usuarioId,
      nomeArquivo: this._nomeArquivo,
      tamanhoArquivo: this._tamanhoArquivo,
      createdAt: this._createdAt,
    };
  }

  static create(
    id: string,
    tipo: TipoRelatorio,
    formato: FormatoRelatorio,
    filtros: FiltrosRelatorio,
    usuarioId: string,
    nomeArquivo: string,
    tamanhoArquivo?: string
  ): RelatorioEntity {
    return new RelatorioEntity({
      id,
      tipo,
      formato,
      filtros,
      usuarioId,
      nomeArquivo,
      tamanhoArquivo,
      createdAt: new Date(),
    });
  }
}
