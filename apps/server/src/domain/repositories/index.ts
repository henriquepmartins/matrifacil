import { Aluno } from "../entities/aluno.entity";
import { Responsavel } from "../entities/responsavel.entity";
import { Matricula } from "../entities/matricula.entity";
import { Turma } from "../entities/matricula.entity";

export interface AlunoRepository {
  findById(id: string): Promise<Aluno | null>;
  findByMatriculaId(matriculaId: string): Promise<Aluno | null>;
  save(aluno: Aluno): Promise<Aluno>;
  update(aluno: Aluno): Promise<Aluno>;
  delete(id: string): Promise<void>;
}

export interface ResponsavelRepository {
  findById(id: string): Promise<Responsavel | null>;
  findByCPF(cpf: string): Promise<Responsavel | null>;
  findByMatriculaId(matriculaId: string): Promise<Responsavel | null>;
  save(responsavel: Responsavel): Promise<Responsavel>;
  update(responsavel: Responsavel): Promise<Responsavel>;
  delete(id: string): Promise<void>;
}

export interface MatriculaRepository {
  findById(id: string): Promise<Matricula | null>;
  findByProtocolo(protocolo: string): Promise<Matricula | null>;
  findByStatus(status: string): Promise<Matricula[]>;
  findByEtapa(etapa: string): Promise<Matricula[]>;
  findBySearch(search: string): Promise<Matricula[]>;
  findAll(filters?: {
    status?: string;
    etapa?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Matricula[]>;
  count(filters?: {
    status?: string;
    etapa?: string;
    search?: string;
  }): Promise<number>;
  save(matricula: Matricula): Promise<Matricula>;
  update(matricula: Matricula): Promise<Matricula>;
  delete(id: string): Promise<void>;
}

export interface TurmaRepository {
  findById(id: string): Promise<Turma | null>;
  findByEtapa(etapa: string): Promise<Turma[]>;
  findAvailableByEtapa(etapa: string): Promise<Turma[]>;
  findBestForEtapa(etapa: string): Promise<Turma | null>;
  save(turma: Turma): Promise<Turma>;
  update(turma: Turma): Promise<Turma>;
  delete(id: string): Promise<void>;
}

export * from "./relatorio.repository";
