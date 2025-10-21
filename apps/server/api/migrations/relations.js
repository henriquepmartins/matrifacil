import { account, aluno, contatoEmergencia, documento, matricula, pendencia, responsavel, session, turma, user } from "../schema-Dma5Noty.js";
import { relations } from "drizzle-orm/relations";

//#region src/migrations/relations.ts
const accountRelations = relations(account, ({ one }) => ({ user: one(user, {
	fields: [account.userId],
	references: [user.id]
}) }));
const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session)
}));
const sessionRelations = relations(session, ({ one }) => ({ user: one(user, {
	fields: [session.userId],
	references: [user.id]
}) }));
const pendenciaRelations = relations(pendencia, ({ one }) => ({
	documento: one(documento, {
		fields: [pendencia.documentoId],
		references: [documento.id]
	}),
	matricula: one(matricula, {
		fields: [pendencia.matriculaId],
		references: [matricula.id]
	})
}));
const documentoRelations = relations(documento, ({ one, many }) => ({
	pendencias: many(pendencia),
	matricula: one(matricula, {
		fields: [documento.matriculaId],
		references: [matricula.id]
	})
}));
const matriculaRelations = relations(matricula, ({ one, many }) => ({
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
	contatoEmergencias: many(contatoEmergencia)
}));
const alunoRelations = relations(aluno, ({ many }) => ({ matriculas: many(matricula) }));
const responsavelRelations = relations(responsavel, ({ many }) => ({ matriculas: many(matricula) }));
const turmaRelations = relations(turma, ({ many }) => ({ matriculas: many(matricula) }));
const contatoEmergenciaRelations = relations(contatoEmergencia, ({ one }) => ({ matricula: one(matricula, {
	fields: [contatoEmergencia.matriculaId],
	references: [matricula.id]
}) }));

//#endregion
export { accountRelations, alunoRelations, contatoEmergenciaRelations, documentoRelations, matriculaRelations, pendenciaRelations, responsavelRelations, sessionRelations, turmaRelations, userRelations };
//# sourceMappingURL=relations.js.map