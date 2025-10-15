import { preMatriculaRepository } from "../repositories/pre-matricula.repository.js";
import type {
  CreatePreMatriculaData,
  UpdatePreMatriculaData,
  PreMatriculaFilters,
  PreMatriculaWithDetails,
} from "../repositories/pre-matricula.repository.js";
import { AppError } from "../middlewares/error.middleware.js";

export class PreMatriculaService {
  /**
   * Valida CPF básico
   */
  private validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validação básica do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  /**
   * Valida telefone brasileiro
   */
  private validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Valida email
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida dados de criação de pré-matrícula
   */
  private validateCreateData(data: CreatePreMatriculaData): void {
    // Validar dados do aluno
    if (!data.aluno.nome || data.aluno.nome.trim().length < 2) {
      throw new AppError(
        400,
        "Nome do aluno é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    if (!data.aluno.dataNascimento) {
      throw new AppError(400, "Data de nascimento do aluno é obrigatória");
    }

    const age =
      new Date().getFullYear() -
      new Date(data.aluno.dataNascimento).getFullYear();
    if (age < 0 || age > 18) {
      throw new AppError(400, "Idade do aluno deve estar entre 0 e 18 anos");
    }

    if (!data.aluno.etapa) {
      throw new AppError(400, "Etapa educacional é obrigatória");
    }

    // Validar dados do responsável
    if (!data.responsavel.nome || data.responsavel.nome.trim().length < 2) {
      throw new AppError(
        400,
        "Nome do responsável é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    if (!data.responsavel.cpf || !this.validateCPF(data.responsavel.cpf)) {
      throw new AppError(
        400,
        "CPF do responsável é obrigatório e deve ser válido"
      );
    }

    if (
      !data.responsavel.telefone ||
      !this.validatePhone(data.responsavel.telefone)
    ) {
      throw new AppError(
        400,
        "Telefone do responsável é obrigatório e deve ser válido"
      );
    }

    if (
      !data.responsavel.endereco ||
      data.responsavel.endereco.trim().length < 5
    ) {
      throw new AppError(
        400,
        "Endereço do responsável é obrigatório e deve ter pelo menos 5 caracteres"
      );
    }

    if (!data.responsavel.bairro || data.responsavel.bairro.trim().length < 2) {
      throw new AppError(
        400,
        "Bairro do responsável é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    if (data.responsavel.email && !this.validateEmail(data.responsavel.email)) {
      throw new AppError(400, "Email do responsável deve ser válido");
    }
  }

  /**
   * Valida dados de atualização de pré-matrícula
   */
  private validateUpdateData(data: UpdatePreMatriculaData): void {
    if (data.aluno) {
      if (data.aluno.nome && data.aluno.nome.trim().length < 2) {
        throw new AppError(
          400,
          "Nome do aluno deve ter pelo menos 2 caracteres"
        );
      }

      if (data.aluno.dataNascimento) {
        const age =
          new Date().getFullYear() -
          new Date(data.aluno.dataNascimento).getFullYear();
        if (age < 0 || age > 18) {
          throw new AppError(
            400,
            "Idade do aluno deve estar entre 0 e 18 anos"
          );
        }
      }
    }

    if (data.responsavel) {
      if (data.responsavel.nome && data.responsavel.nome.trim().length < 2) {
        throw new AppError(
          400,
          "Nome do responsável deve ter pelo menos 2 caracteres"
        );
      }

      if (data.responsavel.cpf && !this.validateCPF(data.responsavel.cpf)) {
        throw new AppError(400, "CPF do responsável deve ser válido");
      }

      if (
        data.responsavel.telefone &&
        !this.validatePhone(data.responsavel.telefone)
      ) {
        throw new AppError(400, "Telefone do responsável deve ser válido");
      }

      if (
        data.responsavel.endereco &&
        data.responsavel.endereco.trim().length < 5
      ) {
        throw new AppError(
          400,
          "Endereço do responsável deve ter pelo menos 5 caracteres"
        );
      }

      if (
        data.responsavel.bairro &&
        data.responsavel.bairro.trim().length < 2
      ) {
        throw new AppError(
          400,
          "Bairro do responsável deve ter pelo menos 2 caracteres"
        );
      }

      if (
        data.responsavel.email &&
        !this.validateEmail(data.responsavel.email)
      ) {
        throw new AppError(400, "Email do responsável deve ser válido");
      }
    }
  }

  /**
   * Cria uma nova pré-matrícula
   */
  async createPreMatricula(
    data: CreatePreMatriculaData
  ): Promise<PreMatriculaWithDetails> {
    this.validateCreateData(data);

    // Verificar se CPF já existe (responsável possui unique index)
    const existingResponsavel =
      await preMatriculaRepository.findResponsavelByCPF(data.responsavel.cpf);
    if (existingResponsavel) {
      throw new AppError(400, "Já existe uma pré-matrícula com este CPF");
    }

    return preMatriculaRepository.createPreMatricula(data);
  }

  /**
   * Busca pré-matrículas com filtros
   */
  async getPreMatriculas(filters: PreMatriculaFilters = {}): Promise<{
    data: PreMatriculaWithDetails[];
    total: number;
  }> {
    const data = await preMatriculaRepository.findAll(filters);
    const total = await preMatriculaRepository.count(filters);

    return { data, total };
  }

  /**
   * Busca uma pré-matrícula por ID
   */
  async getPreMatriculaById(id: string): Promise<PreMatriculaWithDetails> {
    if (!id) {
      throw new AppError(400, "ID da pré-matrícula é obrigatório");
    }

    const preMatricula = await preMatriculaRepository.findById(id);
    if (!preMatricula) {
      throw new AppError(404, "Pré-matrícula não encontrada");
    }

    return preMatricula;
  }

  /**
   * Atualiza uma pré-matrícula
   */
  async updatePreMatricula(
    id: string,
    data: UpdatePreMatriculaData
  ): Promise<PreMatriculaWithDetails> {
    if (!id) {
      throw new AppError(400, "ID da pré-matrícula é obrigatório");
    }

    this.validateUpdateData(data);

    // Verificar se pré-matrícula existe
    const existing = await preMatriculaRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Pré-matrícula não encontrada");
    }

    // Se CPF foi alterado, verificar se já existe
    if (
      data.responsavel?.cpf &&
      data.responsavel.cpf !== existing.responsavel.cpf
    ) {
      const existingByCPF = await preMatriculaRepository.findAll({
        search: data.responsavel.cpf,
      });

      if (existingByCPF.length > 0) {
        throw new AppError(400, "Já existe uma pré-matrícula com este CPF");
      }
    }

    const updated = await preMatriculaRepository.updatePreMatricula(id, data);
    if (!updated) {
      throw new AppError(404, "Pré-matrícula não encontrada");
    }

    return updated;
  }

  /**
   * Deleta uma pré-matrícula
   */
  async deletePreMatricula(id: string): Promise<void> {
    if (!id) {
      throw new AppError(400, "ID da pré-matrícula é obrigatório");
    }

    const deleted = await preMatriculaRepository.deletePreMatricula(id);
    if (!deleted) {
      throw new AppError(404, "Pré-matrícula não encontrada");
    }
  }

  /**
   * Converte pré-matrícula para matrícula completa
   */
  async convertToMatriculaCompleta(
    id: string,
    turmaId?: string
  ): Promise<PreMatriculaWithDetails> {
    if (!id) {
      throw new AppError(400, "ID da pré-matrícula é obrigatório");
    }

    const existing = await preMatriculaRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Pré-matrícula não encontrada");
    }

    if (existing.status !== "pre") {
      throw new AppError(400, "Apenas pré-matrículas podem ser convertidas");
    }

    const converted = await preMatriculaRepository.convertToMatriculaCompleta(
      id,
      turmaId
    );
    if (!converted) {
      throw new AppError(404, "Pré-matrícula não encontrada");
    }

    return converted;
  }

  /**
   * Busca estatísticas de pré-matrículas
   */
  async getPreMatriculasStats(): Promise<{
    total: number;
    porEtapa: Record<string, number>;
    recentes: number;
  }> {
    const allPreMatriculas = await preMatriculaRepository.findAll();
    const recentes = await preMatriculaRepository.findAll({
      limit: 5,
    });

    const porEtapa = allPreMatriculas.reduce((acc, preMatricula) => {
      const etapa = preMatricula.aluno.etapa;
      acc[etapa] = (acc[etapa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: allPreMatriculas.length,
      porEtapa,
      recentes: recentes.length,
    };
  }
}

export const preMatriculaService = new PreMatriculaService();
