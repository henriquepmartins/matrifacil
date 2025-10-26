import type { TurmaRepository } from "../repositories";

export class TurmaNaoEncontradaError extends Error {
  constructor(turmaId: string) {
    super(`Turma com ID ${turmaId} não encontrada`);
    this.name = "TurmaNaoEncontradaError";
  }
}

export class TurmaSemVagasError extends Error {
  constructor(turmaId: string) {
    super(`Turma com ID ${turmaId} não possui vagas disponíveis`);
    this.name = "TurmaSemVagasError";
  }
}

export class TurmaInativaError extends Error {
  constructor(turmaId: string) {
    super(`Turma com ID ${turmaId} não está ativa`);
    this.name = "TurmaInativaError";
  }
}

export class EtapaIncompativelError extends Error {
  constructor(turmaId: string, etapaTurma: string, etapaAluno: string) {
    super(
      `Turma ${turmaId} (etapa: ${etapaTurma}) não é compatível com aluno (etapa: ${etapaAluno})`
    );
    this.name = "EtapaIncompativelError";
  }
}

export class TurmaVagasService {
  constructor(private turmaRepository: TurmaRepository) {}

  async validarEDecrementarVaga(
    turmaId: string,
    etapaAluno: string
  ): Promise<void> {
    // Verificar se turma existe
    const turma = await this.turmaRepository.findById(turmaId);
    if (!turma) {
      throw new TurmaNaoEncontradaError(turmaId);
    }

    // Verificar se turma está ativa
    if (!turma.ativa) {
      throw new TurmaInativaError(turmaId);
    }

    // Verificar se etapa é compatível
    if (turma.etapa !== etapaAluno) {
      throw new EtapaIncompativelError(turmaId, turma.etapa, etapaAluno);
    }

    // Verificar se tem vagas disponíveis
    if (turma.vagasDisponiveis <= 0) {
      throw new TurmaSemVagasError(turmaId);
    }

    // Decrementar vaga
    await this.turmaRepository.decrementarVaga(turmaId);
  }

  async validarEDecrementarVagaComTurma(
    turmaId: string,
    etapaAluno: string
  ): Promise<import("../../domain/entities/matricula.entity").Turma> {
    console.log("🔍 Validando turma:", { turmaId, etapaAluno });
    
    // Verificar se turma existe
    const turma = await this.turmaRepository.findById(turmaId);
    console.log("🔍 Turma encontrada:", turma ? { id: turma.id, nome: turma.nome, etapa: turma.etapa, ativa: turma.ativa, vagas: turma.vagasDisponiveis } : null);
    
    if (!turma) {
      console.log("❌ Turma não encontrada:", turmaId);
      throw new TurmaNaoEncontradaError(turmaId);
    }

    // Verificar se turma está ativa
    if (!turma.ativa) {
      console.log("❌ Turma inativa:", turmaId);
      throw new TurmaInativaError(turmaId);
    }

    // Verificar se etapa é compatível
    if (turma.etapa !== etapaAluno) {
      console.log("❌ Etapa incompatível:", { turmaId, etapaTurma: turma.etapa, etapaAluno });
      throw new EtapaIncompativelError(turmaId, turma.etapa, etapaAluno);
    }

    // Verificar se tem vagas disponíveis
    if (turma.vagasDisponiveis <= 0) {
      console.log("❌ Sem vagas disponíveis:", { turmaId, vagas: turma.vagasDisponiveis });
      throw new TurmaSemVagasError(turmaId);
    }

    console.log("✅ Turma validada, decrementando vaga...");
    // Decrementar vaga
    await this.turmaRepository.decrementarVaga(turmaId);
    console.log("✅ Vaga decrementada com sucesso");

    // Retornar a turma validada
    return turma;
  }

  async incrementarVaga(turmaId: string): Promise<void> {
    // Verificar se turma existe
    const turma = await this.turmaRepository.findById(turmaId);
    if (!turma) {
      throw new TurmaNaoEncontradaError(turmaId);
    }

    // Incrementar vaga
    await this.turmaRepository.incrementarVaga(turmaId);
  }

  async validarVagasDisponiveis(turmaId: string): Promise<boolean> {
    return this.turmaRepository.validarVagasDisponiveis(turmaId);
  }

  async validarTurmaAtiva(turmaId: string): Promise<boolean> {
    return this.turmaRepository.validarTurmaAtiva(turmaId);
  }

  async validarEtapaCompativel(
    turmaId: string,
    etapaAluno: string
  ): Promise<boolean> {
    return this.turmaRepository.validarEtapaCompativel(turmaId, etapaAluno);
  }

  async encontrarMelhorTurma(etapa: string): Promise<string | null> {
    const turma = await this.turmaRepository.findBestForEtapa(etapa);
    return turma ? turma.id : null;
  }

  async validarTurmaCompleta(
    turmaId: string,
    etapaAluno: string
  ): Promise<void> {
    // Verificar se turma existe
    const turma = await this.turmaRepository.findById(turmaId);
    if (!turma) {
      throw new TurmaNaoEncontradaError(turmaId);
    }

    // Verificar se turma está ativa
    if (!turma.ativa) {
      throw new TurmaInativaError(turmaId);
    }

    // Verificar se etapa é compatível
    if (turma.etapa !== etapaAluno) {
      throw new EtapaIncompativelError(turmaId, turma.etapa, etapaAluno);
    }

    // Verificar se tem vagas disponíveis
    if (turma.vagasDisponiveis <= 0) {
      throw new TurmaSemVagasError(turmaId);
    }
  }
}
