import { account, session, user, verification } from "./auth-DwdncA3I.js";
import { aluno, contatoEmergencia, documento, etapaEnum, matricula, pendencia, responsavel, statusDocumentoEnum, statusMatriculaEnum, tipoDocumentoEnum, turma, turnoEnum } from "./matriculas-v99Swx4X.js";
import { formatoRelatorioEnum, relatorioGerado, tipoRelatorioEnum } from "./relatorios-Djl1uoXm.js";
import * as drizzle_orm_node_postgres0 from "drizzle-orm/node-postgres";
import { Pool } from "pg";

//#region src/index.d.ts
declare const db: drizzle_orm_node_postgres0.NodePgDatabase<Record<string, never>> & {
  $client: Pool;
};
//#endregion
export { account, aluno, contatoEmergencia, db, documento, etapaEnum, formatoRelatorioEnum, matricula, pendencia, relatorioGerado, responsavel, session, statusDocumentoEnum, statusMatriculaEnum, tipoDocumentoEnum, tipoRelatorioEnum, turma, turnoEnum, user, verification };
//# sourceMappingURL=index.d.ts.map