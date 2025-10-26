import { relations } from "drizzle-orm/relations";
import { user, account, session, documento, pendencia, matricula, aluno, responsavel, turma, contatoEmergencia } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const pendenciaRelations = relations(pendencia, ({one}) => ({
	documento: one(documento, {
		fields: [pendencia.documentoId],
		references: [documento.id]
	}),
	matricula: one(matricula, {
		fields: [pendencia.matriculaId],
		references: [matricula.id]
	}),
}));

export const documentoRelations = relations(documento, ({one, many}) => ({
	pendencias: many(pendencia),
	matricula: one(matricula, {
		fields: [documento.matriculaId],
		references: [matricula.id]
	}),
}));

export const matriculaRelations = relations(matricula, ({one, many}) => ({
	pendencias: many(pendencia),
	aluno: one(aluno, {
		fields: [matricula.alunoId],
		references: [aluno.id]
	}),
	responsavel: one(responsavel, {
		fields: [matricula.responsavelId],
		references: [responsavel.id]
	}),
	turma: one(turma, {
		fields: [matricula.turmaId],
		references: [turma.id]
	}),
	documentos: many(documento),
	contatoEmergencias: many(contatoEmergencia),
}));

export const alunoRelations = relations(aluno, ({many}) => ({
	matriculas: many(matricula),
}));

export const responsavelRelations = relations(responsavel, ({many}) => ({
	matriculas: many(matricula),
}));

export const turmaRelations = relations(turma, ({many}) => ({
	matriculas: many(matricula),
}));

export const contatoEmergenciaRelations = relations(contatoEmergencia, ({one}) => ({
	matricula: one(matricula, {
		fields: [contatoEmergencia.matriculaId],
		references: [matricula.id]
	}),
}));