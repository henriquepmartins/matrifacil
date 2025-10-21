import * as drizzle_orm0 from "drizzle-orm";

//#region src/migrations/relations.d.ts
declare const accountRelations: drizzle_orm0.Relations<"account", {
  user: drizzle_orm0.One<"user", true>;
}>;
declare const userRelations: drizzle_orm0.Relations<"user", {
  accounts: drizzle_orm0.Many<"account">;
  sessions: drizzle_orm0.Many<"session">;
}>;
declare const sessionRelations: drizzle_orm0.Relations<"session", {
  user: drizzle_orm0.One<"user", true>;
}>;
declare const pendenciaRelations: drizzle_orm0.Relations<"pendencia", {
  documento: drizzle_orm0.One<"documento", false>;
  matricula: drizzle_orm0.One<"matricula", true>;
}>;
declare const documentoRelations: drizzle_orm0.Relations<"documento", {
  pendencias: drizzle_orm0.Many<"pendencia">;
  matricula: drizzle_orm0.One<"matricula", true>;
}>;
declare const matriculaRelations: drizzle_orm0.Relations<"matricula", {
  pendencias: drizzle_orm0.Many<"pendencia">;
  aluno: drizzle_orm0.One<"aluno", true>;
  responsavel: drizzle_orm0.One<"responsavel", true>;
  turma: drizzle_orm0.One<"turma", false>;
  documentos: drizzle_orm0.Many<"documento">;
  contatoEmergencias: drizzle_orm0.Many<"contato_emergencia">;
}>;
declare const alunoRelations: drizzle_orm0.Relations<"aluno", {
  matriculas: drizzle_orm0.Many<"matricula">;
}>;
declare const responsavelRelations: drizzle_orm0.Relations<"responsavel", {
  matriculas: drizzle_orm0.Many<"matricula">;
}>;
declare const turmaRelations: drizzle_orm0.Relations<"turma", {
  matriculas: drizzle_orm0.Many<"matricula">;
}>;
declare const contatoEmergenciaRelations: drizzle_orm0.Relations<"contato_emergencia", {
  matricula: drizzle_orm0.One<"matricula", true>;
}>;
//#endregion
export { accountRelations, alunoRelations, contatoEmergenciaRelations, documentoRelations, matriculaRelations, pendenciaRelations, responsavelRelations, sessionRelations, turmaRelations, userRelations };
//# sourceMappingURL=relations.d.ts.map