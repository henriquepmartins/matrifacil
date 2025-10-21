const require_dist = require('./dist-DCU7xQ0d.js');
let express = require("express");
express = require_dist.__toESM(express);
let cookie_parser = require("cookie-parser");
cookie_parser = require_dist.__toESM(cookie_parser);
let cors = require("cors");
cors = require_dist.__toESM(cors);
let zod = require("zod");
zod = require_dist.__toESM(zod);
let dotenv = require("dotenv");
dotenv = require_dist.__toESM(dotenv);
let path = require("path");
path = require_dist.__toESM(path);
let drizzle_orm = require("drizzle-orm");
drizzle_orm = require_dist.__toESM(drizzle_orm);
let bcrypt = require("bcrypt");
bcrypt = require_dist.__toESM(bcrypt);
let jsonwebtoken = require("jsonwebtoken");
jsonwebtoken = require_dist.__toESM(jsonwebtoken);
let crypto = require("crypto");
crypto = require_dist.__toESM(crypto);
let node_crypto = require("node:crypto");
node_crypto = require_dist.__toESM(node_crypto);
let pdfkit = require("pdfkit");
pdfkit = require_dist.__toESM(pdfkit);
let csv_stringify = require("csv-stringify");
csv_stringify = require_dist.__toESM(csv_stringify);

//#region src/config/env.config.ts
dotenv.default.config({ path: path.default.resolve(process.cwd(), "apps/server/.env") });
const envSchema = zod.z.object({
	PORT: zod.z.string().default("8080"),
	DATABASE_URL: zod.z.string().min(1, "DATABASE_URL é obrigatória"),
	CORS_ORIGIN: zod.z.string().default("http://localhost:3001"),
	NODE_ENV: zod.z.enum([
		"development",
		"test",
		"production"
	]).default("development"),
	JWT_SECRET: zod.z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres")
});
function validateEnv() {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		console.error("❌ Erro nas variáveis de ambiente:");
		if (error?.issues && Array.isArray(error.issues)) error.issues.forEach((issue) => {
			console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
		});
		else if (error?.message) console.error(`  - ${error.message}`);
		else console.error(`  - ${String(error)}`);
		console.error("\nCrie o arquivo apps/server/.env com as variáveis necessárias.");
		console.error("Veja apps/server/.env.example para referência.\n");
		process.exit(1);
	}
}
const env = validateEnv();

//#endregion
//#region src/middlewares/cors.middleware.ts
const corsMiddleware = (0, cors.default)({
	origin: env.CORS_ORIGIN,
	credentials: true,
	methods: [
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE",
		"OPTIONS"
	],
	allowedHeaders: ["Content-Type", "Authorization"]
});

//#endregion
//#region src/middlewares/error.middleware.ts
var AppError = class AppError extends Error {
	constructor(statusCode, message, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		this.isOperational = isOperational;
		Object.setPrototypeOf(this, AppError.prototype);
	}
};
function errorHandler(error, req, res, next) {
	if (error instanceof zod.ZodError) {
		res.status(400).json({
			success: false,
			message: "Erro de validação",
			errors: error.errors.map((err) => ({
				path: err.path.join("."),
				message: err.message
			}))
		});
		return;
	}
	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			success: false,
			message: error.message
		});
		return;
	}
	console.error("❌ Erro não tratado:", error);
	res.status(500).json({
		success: false,
		message: "Erro interno do servidor"
	});
}
function notFoundHandler(req, res) {
	res.status(404).json({
		success: false,
		message: `Rota não encontrada: ${req.method} ${req.path}`
	});
}

//#endregion
//#region src/config/database.config.ts
async function checkDatabaseConnection$1() {
	try {
		await require_dist.db.execute(drizzle_orm.sql`SELECT 1`);
		return true;
	} catch (error) {
		console.error("❌ Erro ao conectar ao banco de dados:", error);
		return false;
	}
}

//#endregion
//#region src/controllers/health.controller.ts
var HealthController = class {
	/**
	* Health check endpoint
	* Verifica se o servidor está rodando e se o banco de dados está acessível
	*/
	async check(req, res, next) {
		try {
			const startTime = Date.now();
			const isDatabaseHealthy = await checkDatabaseConnection$1();
			const responseTime = Date.now() - startTime;
			if (!isDatabaseHealthy) {
				res.status(503).json({
					success: false,
					message: "Service Unavailable",
					status: "unhealthy",
					checks: {
						database: "down",
						server: "up"
					},
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					responseTime: `${responseTime}ms`
				});
				return;
			}
			res.status(200).json({
				success: true,
				message: "OK",
				status: "healthy",
				checks: {
					database: "up",
					server: "up"
				},
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				responseTime: `${responseTime}ms`
			});
		} catch (error) {
			next(error);
		}
	}
	/**
	* Readiness check - verifica se o servidor está pronto para receber requisições
	*/
	async readiness(req, res, next) {
		try {
			if (!await checkDatabaseConnection$1()) {
				res.status(503).json({
					success: false,
					message: "Not Ready",
					ready: false
				});
				return;
			}
			res.status(200).json({
				success: true,
				message: "Ready",
				ready: true
			});
		} catch (error) {
			next(error);
		}
	}
	/**
	* Liveness check - verifica se o servidor está vivo
	*/
	async liveness(req, res) {
		res.status(200).json({
			success: true,
			message: "Alive",
			alive: true
		});
	}
};
const healthController = new HealthController();

//#endregion
//#region src/routes/health.routes.ts
const router$5 = (0, express.Router)();
/**
* GET /health - Health check completo
*/
router$5.get("/", (req, res, next) => healthController.check(req, res, next));
/**
* GET /health/readiness - Readiness probe
*/
router$5.get("/readiness", (req, res, next) => healthController.readiness(req, res, next));
/**
* GET /health/liveness - Liveness probe
*/
router$5.get("/liveness", (req, res, next) => healthController.liveness(req, res, next));
var health_routes_default = router$5;

//#endregion
//#region src/repositories/user.repository.ts
var UserRepository = class {
	/**
	* Cria um novo usuário no banco de dados
	*/
	async createUser(data) {
		const [newUser] = await require_dist.db.insert(require_dist.user).values({
			id: data.id,
			name: data.name,
			email: data.email,
			emailVerified: false,
			createdAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date()
		}).returning();
		await require_dist.db.insert(require_dist.account).values({
			id: `${data.id}-password`,
			accountId: data.id,
			providerId: "credential",
			userId: data.id,
			password: data.password,
			createdAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date()
		});
		return newUser;
	}
	/**
	* Busca um usuário por email
	*/
	async findUserByEmail(email) {
		const [foundUser] = await require_dist.db.select().from(require_dist.user).where((0, drizzle_orm.eq)(require_dist.user.email, email)).limit(1);
		return foundUser;
	}
	/**
	* Busca um usuário por ID
	*/
	async findUserById(id) {
		const [foundUser] = await require_dist.db.select().from(require_dist.user).where((0, drizzle_orm.eq)(require_dist.user.id, id)).limit(1);
		return foundUser;
	}
	/**
	* Busca a senha do usuário
	*/
	async findUserPassword(userId) {
		const [userAccount] = await require_dist.db.select().from(require_dist.account).where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.account.userId, userId), (0, drizzle_orm.eq)(require_dist.account.providerId, "credential"))).limit(1);
		return userAccount?.password;
	}
	/**
	* Cria uma nova sessão
	*/
	async createSession(data) {
		const [newSession] = await require_dist.db.insert(require_dist.session).values({
			id: data.id,
			userId: data.userId,
			token: data.token,
			expiresAt: data.expiresAt,
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			createdAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date()
		}).returning();
		return newSession;
	}
	/**
	* Busca uma sessão por token
	*/
	async findSessionByToken(token) {
		const [foundSession] = await require_dist.db.select().from(require_dist.session).where((0, drizzle_orm.eq)(require_dist.session.token, token)).limit(1);
		return foundSession;
	}
	/**
	* Deleta uma sessão
	*/
	async deleteSession(sessionId) {
		await require_dist.db.delete(require_dist.session).where((0, drizzle_orm.eq)(require_dist.session.id, sessionId));
	}
	/**
	* Deleta sessões expiradas
	*/
	async deleteExpiredSessions() {
		const now = /* @__PURE__ */ new Date();
		await require_dist.db.delete(require_dist.session).where((0, drizzle_orm.eq)(require_dist.session.expiresAt, now));
	}
	/**
	* Atualiza o último acesso do usuário
	*/
	async updateUserLastAccess(userId) {
		await require_dist.db.update(require_dist.user).set({ updatedAt: /* @__PURE__ */ new Date() }).where((0, drizzle_orm.eq)(require_dist.user.id, userId));
	}
};
const userRepository = new UserRepository();

//#endregion
//#region src/services/auth.service.ts
var AuthService = class {
	SALT_ROUNDS = 10;
	SESSION_EXPIRY_DAYS = 7;
	/**
	* Registra um novo usuário
	*/
	async signUp(data, sessionInfo) {
		if (await userRepository.findUserByEmail(data.email)) throw new AppError(400, "Email já cadastrado");
		const hashedPassword = await bcrypt.default.hash(data.password, this.SALT_ROUNDS);
		const userId = this.generateId();
		const user$1 = await userRepository.createUser({
			id: userId,
			name: data.name,
			email: data.email,
			password: hashedPassword
		});
		const sessionData = await this.createSessionForUser(user$1.id, sessionInfo);
		return {
			user: {
				id: user$1.id,
				name: user$1.name,
				email: user$1.email,
				emailVerified: user$1.emailVerified
			},
			session: sessionData
		};
	}
	/**
	* Autentica um usuário
	*/
	async signIn(data, sessionInfo) {
		const user$1 = await userRepository.findUserByEmail(data.email);
		if (!user$1) throw new AppError(401, "Email ou senha inválidos");
		const hashedPassword = await userRepository.findUserPassword(user$1.id);
		if (!hashedPassword) throw new AppError(401, "Email ou senha inválidos");
		if (!await bcrypt.default.compare(data.password, hashedPassword)) throw new AppError(401, "Email ou senha inválidos");
		await userRepository.updateUserLastAccess(user$1.id);
		const sessionData = await this.createSessionForUser(user$1.id, sessionInfo);
		return {
			user: {
				id: user$1.id,
				name: user$1.name,
				email: user$1.email,
				emailVerified: user$1.emailVerified
			},
			session: sessionData
		};
	}
	/**
	* Invalida uma sessão (logout)
	*/
	async signOut(sessionId) {
		await userRepository.deleteSession(sessionId);
	}
	/**
	* Obtém informações da sessão atual
	*/
	async getSession(token) {
		const session$1 = await userRepository.findSessionByToken(token);
		if (!session$1) throw new AppError(401, "Sessão inválida");
		if (session$1.expiresAt < /* @__PURE__ */ new Date()) {
			await userRepository.deleteSession(session$1.id);
			throw new AppError(401, "Sessão expirada");
		}
		const user$1 = await userRepository.findUserById(session$1.userId);
		if (!user$1) throw new AppError(401, "Usuário não encontrado");
		return {
			user: {
				id: user$1.id,
				name: user$1.name,
				email: user$1.email,
				emailVerified: user$1.emailVerified
			},
			session: {
				id: session$1.id,
				expiresAt: session$1.expiresAt
			}
		};
	}
	/**
	* Cria uma nova sessão para um usuário
	*/
	async createSessionForUser(userId, sessionInfo) {
		const sessionId = this.generateId();
		const token = this.generateToken();
		const expiresAt = /* @__PURE__ */ new Date();
		expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);
		const session$1 = await userRepository.createSession({
			id: sessionId,
			userId,
			token,
			expiresAt,
			ipAddress: sessionInfo?.ipAddress,
			userAgent: sessionInfo?.userAgent
		});
		const user$1 = await userRepository.findUserById(userId);
		if (!user$1) throw new AppError(500, "Erro ao criar sessão");
		const jwtToken = jsonwebtoken.default.sign({
			userId: user$1.id,
			email: user$1.email,
			name: user$1.name,
			sessionId: session$1.id
		}, env.JWT_SECRET, { expiresIn: `${this.SESSION_EXPIRY_DAYS}d` });
		return {
			id: session$1.id,
			token: jwtToken,
			expiresAt: session$1.expiresAt
		};
	}
	/**
	* Gera um ID único
	*/
	generateId() {
		return (0, crypto.randomBytes)(16).toString("hex");
	}
	/**
	* Gera um token único
	*/
	generateToken() {
		return (0, crypto.randomBytes)(32).toString("hex");
	}
	/**
	* Limpa sessões expiradas (pode ser chamado periodicamente)
	*/
	async cleanExpiredSessions() {
		await userRepository.deleteExpiredSessions();
	}
};
const authService = new AuthService();

//#endregion
//#region src/controllers/auth.controller.ts
const signUpSchema = zod.z.object({
	name: zod.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	email: zod.z.string().email("Email inválido"),
	password: zod.z.string().min(8, "Senha deve ter pelo menos 8 caracteres")
});
const signInSchema = zod.z.object({
	email: zod.z.string().email("Email inválido"),
	password: zod.z.string().min(1, "Senha é obrigatória")
});
var AuthController = class {
	/**
	* Registra um novo usuário
	* POST /api/auth/signup
	*/
	async signUp(req, res, next) {
		try {
			const data = signUpSchema.parse(req.body);
			const sessionInfo = {
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"]
			};
			const result = await authService.signUp(data, sessionInfo);
			res.cookie("token", result.session.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 10080 * 60 * 1e3
			});
			res.status(201).json({
				success: true,
				message: "Usuário criado com sucesso",
				data: {
					user: result.user,
					token: result.session.token,
					expiresAt: result.session.expiresAt
				}
			});
		} catch (error) {
			next(error);
		}
	}
	/**
	* Autentica um usuário
	* POST /api/auth/login
	*/
	async signIn(req, res, next) {
		try {
			const data = signInSchema.parse(req.body);
			const sessionInfo = {
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"]
			};
			const result = await authService.signIn(data, sessionInfo);
			res.cookie("token", result.session.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 10080 * 60 * 1e3
			});
			res.status(200).json({
				success: true,
				message: "Login realizado com sucesso",
				data: {
					user: result.user,
					token: result.session.token,
					expiresAt: result.session.expiresAt
				}
			});
		} catch (error) {
			next(error);
		}
	}
	/**
	* Desautentica um usuário
	* POST /api/auth/logout
	*/
	async signOut(req, res, next) {
		try {
			if (!req.sessionId) throw new AppError(401, "Não autenticado");
			await authService.signOut(req.sessionId);
			res.clearCookie("token");
			res.status(200).json({
				success: true,
				message: "Logout realizado com sucesso"
			});
		} catch (error) {
			next(error);
		}
	}
	/**
	* Obtém a sessão atual
	* GET /api/auth/session
	*/
	async getSession(req, res, next) {
		try {
			const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
			if (!token) throw new AppError(401, "Token não fornecido");
			const result = await authService.getSession(token);
			res.status(200).json({
				success: true,
				data: result
			});
		} catch (error) {
			next(error);
		}
	}
	/**
	* Obtém informações do usuário autenticado
	* GET /api/auth/me
	*/
	async getMe(req, res, next) {
		try {
			if (!req.user) throw new AppError(401, "Não autenticado");
			res.status(200).json({
				success: true,
				data: { user: req.user }
			});
		} catch (error) {
			next(error);
		}
	}
};
const authController = new AuthController();

//#endregion
//#region src/middlewares/auth.middleware.ts
function authenticateToken(req, res, next) {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(" ")[1];
		if (!token) {
			if (!req.cookies?.token) throw new AppError(401, "Token não fornecido");
		}
		const actualToken = token || req.cookies?.token;
		const decoded = jsonwebtoken.default.verify(actualToken, env.JWT_SECRET);
		req.user = {
			id: decoded.userId,
			email: decoded.email,
			name: decoded.name
		};
		req.sessionId = decoded.sessionId;
		next();
	} catch (error) {
		if (error instanceof jsonwebtoken.default.JsonWebTokenError) next(new AppError(401, "Token inválido"));
		else if (error instanceof jsonwebtoken.default.TokenExpiredError) next(new AppError(401, "Token expirado"));
		else next(error);
	}
}

//#endregion
//#region src/routes/auth.routes.ts
const router$4 = (0, express.Router)();
/**
* POST /api/auth/signup - Registrar novo usuário
*/
router$4.post("/signup", (req, res, next) => authController.signUp(req, res, next));
/**
* POST /api/auth/login - Autenticar usuário
*/
router$4.post("/login", (req, res, next) => authController.signIn(req, res, next));
/**
* POST /api/auth/logout - Desautenticar usuário (requer autenticação)
*/
router$4.post("/logout", authenticateToken, (req, res, next) => authController.signOut(req, res, next));
/**
* GET /api/auth/session - Obter sessão atual
*/
router$4.get("/session", (req, res, next) => authController.getSession(req, res, next));
/**
* GET /api/auth/me - Obter informações do usuário autenticado
*/
router$4.get("/me", authenticateToken, (req, res, next) => authController.getMe(req, res, next));
var auth_routes_default = router$4;

//#endregion
//#region src/db/index.js
var require_db = /* @__PURE__ */ require_dist.__commonJS({ "src/db/index.js": ((exports, module) => {
	const { drizzle } = require("drizzle-orm/node-postgres");
	const { Pool } = require("pg");
	if (!process.env.DATABASE_URL) throw new Error("❌ DATABASE_URL is not defined!\n\nPlease set the DATABASE_URL environment variable with your database connection string.");
	const db$6 = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));
	module.exports = { db: db$6 };
	module.exports.checkDatabaseConnection = async function() {
		try {
			const { sql: sql$5 } = require("drizzle-orm");
			await db$6.execute(sql$5`SELECT 1`);
			return true;
		} catch (error) {
			console.error("❌ Erro ao conectar ao banco de dados:", error);
			return false;
		}
	};
	module.exports.initializeDatabase = async function() {
		console.log("🔌 Conectando ao banco de dados...");
		if (!await module.exports.checkDatabaseConnection()) throw new Error("Falha ao conectar ao banco de dados");
		console.log("✅ Banco de dados conectado com sucesso!");
	};
}) });

//#endregion
//#region src/infrastructure/database/database.config.ts
var import_db = /* @__PURE__ */ require_dist.__toESM(require_db());

//#endregion
//#region src/domain/entities/aluno.entity.ts
var Aluno = class Aluno {
	constructor(id, idGlobal, nome, dataNascimento, etapa, status, necessidadesEspeciais, observacoes, rg, cpf, naturalidade, nacionalidade = "Brasileira", sexo, corRaca, tipoSanguineo, alergias, medicamentos, doencas, carteiraVacina = false, observacoesSaude, createdAt = /* @__PURE__ */ new Date(), updatedAt = /* @__PURE__ */ new Date()) {
		this.id = id;
		this.idGlobal = idGlobal;
		this.nome = nome;
		this.dataNascimento = dataNascimento;
		this.etapa = etapa;
		this.status = status;
		this.necessidadesEspeciais = necessidadesEspeciais;
		this.observacoes = observacoes;
		this.rg = rg;
		this.cpf = cpf;
		this.naturalidade = naturalidade;
		this.nacionalidade = nacionalidade;
		this.sexo = sexo;
		this.corRaca = corRaca;
		this.tipoSanguineo = tipoSanguineo;
		this.alergias = alergias;
		this.medicamentos = medicamentos;
		this.doencas = doencas;
		this.carteiraVacina = carteiraVacina;
		this.observacoesSaude = observacoesSaude;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	static create(data) {
		return new Aluno(data.id, data.idGlobal, data.nome, data.dataNascimento, data.etapa, data.status || "pre", data.necessidadesEspeciais || false, data.observacoes, data.rg, data.cpf, data.naturalidade, data.nacionalidade || "Brasileira", data.sexo, data.corRaca, data.tipoSanguineo, data.alergias, data.medicamentos, data.doencas, data.carteiraVacina || false, data.observacoesSaude);
	}
	updateStatus(status) {
		return new Aluno(this.id, this.idGlobal, this.nome, this.dataNascimento, this.etapa, status, this.necessidadesEspeciais, this.observacoes, this.rg, this.cpf, this.naturalidade, this.nacionalidade, this.sexo, this.corRaca, this.tipoSanguineo, this.alergias, this.medicamentos, this.doencas, this.carteiraVacina, this.observacoesSaude, this.createdAt, /* @__PURE__ */ new Date());
	}
};

//#endregion
//#region src/infrastructure/repositories/drizzle-aluno.repository.ts
var DrizzleAlunoRepository = class {
	async findById(id) {
		const [result] = await import_db.db.select().from(require_dist.aluno).where((0, drizzle_orm.eq)(require_dist.aluno.id, id)).limit(1);
		if (!result) return null;
		return Aluno.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			dataNascimento: result.dataNascimento,
			etapa: result.etapa,
			status: result.status,
			necessidadesEspeciais: result.necessidadesEspeciais,
			observacoes: result.observacoes,
			rg: result.rg,
			cpf: result.cpf,
			naturalidade: result.naturalidade,
			nacionalidade: result.nacionalidade,
			sexo: result.sexo,
			corRaca: result.corRaca,
			tipoSanguineo: result.tipoSanguineo,
			alergias: result.alergias,
			medicamentos: result.medicamentos,
			doencas: result.doencas,
			carteiraVacina: result.carteiraVacina,
			observacoesSaude: result.observacoesSaude
		});
	}
	async findByMatriculaId(matriculaId) {
		const [result] = await import_db.db.select().from(require_dist.aluno).innerJoin(require_dist.matricula, (0, drizzle_orm.eq)(require_dist.aluno.id, require_dist.matricula.alunoId)).where((0, drizzle_orm.eq)(require_dist.matricula.id, matriculaId)).limit(1);
		if (!result) return null;
		return Aluno.create({
			id: result.aluno.id,
			idGlobal: result.aluno.idGlobal,
			nome: result.aluno.nome,
			dataNascimento: result.aluno.dataNascimento,
			etapa: result.aluno.etapa,
			status: result.aluno.status,
			necessidadesEspeciais: result.aluno.necessidadesEspeciais,
			observacoes: result.aluno.observacoes,
			rg: result.aluno.rg,
			cpf: result.aluno.cpf,
			naturalidade: result.aluno.naturalidade,
			nacionalidade: result.aluno.nacionalidade,
			sexo: result.aluno.sexo,
			corRaca: result.aluno.corRaca,
			tipoSanguineo: result.aluno.tipoSanguineo,
			alergias: result.aluno.alergias,
			medicamentos: result.aluno.medicamentos,
			doencas: result.aluno.doencas,
			carteiraVacina: result.aluno.carteiraVacina,
			observacoesSaude: result.aluno.observacoesSaude
		});
	}
	async save(alunoEntity) {
		const [result] = await import_db.db.insert(require_dist.aluno).values({
			id: alunoEntity.id,
			idGlobal: alunoEntity.idGlobal,
			nome: alunoEntity.nome,
			dataNascimento: alunoEntity.dataNascimento,
			etapa: alunoEntity.etapa,
			status: alunoEntity.status,
			necessidadesEspeciais: alunoEntity.necessidadesEspeciais,
			observacoes: alunoEntity.observacoes,
			rg: alunoEntity.rg,
			cpf: alunoEntity.cpf,
			naturalidade: alunoEntity.naturalidade,
			nacionalidade: alunoEntity.nacionalidade,
			sexo: alunoEntity.sexo,
			corRaca: alunoEntity.corRaca,
			tipoSanguineo: alunoEntity.tipoSanguineo,
			alergias: alunoEntity.alergias,
			medicamentos: alunoEntity.medicamentos,
			doencas: alunoEntity.doencas,
			carteiraVacina: alunoEntity.carteiraVacina,
			observacoesSaude: alunoEntity.observacoesSaude,
			createdAt: alunoEntity.createdAt,
			updatedAt: alunoEntity.updatedAt
		}).returning();
		return Aluno.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			dataNascimento: result.dataNascimento,
			etapa: result.etapa,
			status: result.status,
			necessidadesEspeciais: result.necessidadesEspeciais,
			observacoes: result.observacoes,
			rg: result.rg,
			cpf: result.cpf,
			naturalidade: result.naturalidade,
			nacionalidade: result.nacionalidade,
			sexo: result.sexo,
			corRaca: result.corRaca,
			tipoSanguineo: result.tipoSanguineo,
			alergias: result.alergias,
			medicamentos: result.medicamentos,
			doencas: result.doencas,
			carteiraVacina: result.carteiraVacina,
			observacoesSaude: result.observacoesSaude
		});
	}
	async update(alunoEntity) {
		const [result] = await import_db.db.update(require_dist.aluno).set({
			nome: alunoEntity.nome,
			dataNascimento: alunoEntity.dataNascimento,
			etapa: alunoEntity.etapa,
			status: alunoEntity.status,
			necessidadesEspeciais: alunoEntity.necessidadesEspeciais,
			observacoes: alunoEntity.observacoes,
			rg: alunoEntity.rg,
			cpf: alunoEntity.cpf,
			naturalidade: alunoEntity.naturalidade,
			nacionalidade: alunoEntity.nacionalidade,
			sexo: alunoEntity.sexo,
			corRaca: alunoEntity.corRaca,
			tipoSanguineo: alunoEntity.tipoSanguineo,
			alergias: alunoEntity.alergias,
			medicamentos: alunoEntity.medicamentos,
			doencas: alunoEntity.doencas,
			carteiraVacina: alunoEntity.carteiraVacina,
			observacoesSaude: alunoEntity.observacoesSaude,
			updatedAt: /* @__PURE__ */ new Date()
		}).where((0, drizzle_orm.eq)(require_dist.aluno.id, alunoEntity.id)).returning();
		return Aluno.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			dataNascimento: result.dataNascimento,
			etapa: result.etapa,
			status: result.status,
			necessidadesEspeciais: result.necessidadesEspeciais,
			observacoes: result.observacoes,
			rg: result.rg,
			cpf: result.cpf,
			naturalidade: result.naturalidade,
			nacionalidade: result.nacionalidade,
			sexo: result.sexo,
			corRaca: result.corRaca,
			tipoSanguineo: result.tipoSanguineo,
			alergias: result.alergias,
			medicamentos: result.medicamentos,
			doencas: result.doencas,
			carteiraVacina: result.carteiraVacina,
			observacoesSaude: result.observacoesSaude
		});
	}
	async delete(id) {
		await import_db.db.delete(require_dist.aluno).where((0, drizzle_orm.eq)(require_dist.aluno.id, id));
	}
};

//#endregion
//#region src/domain/entities/responsavel.entity.ts
var Responsavel = class Responsavel {
	constructor(id, idGlobal, nome, cpf, telefone, endereco, bairro, email, parentesco = "pai", autorizadoRetirada = true, rg, dataNascimento, naturalidade, nacionalidade = "Brasileira", sexo, estadoCivil, profissao, localTrabalho, telefoneTrabalho, contatoEmergencia$1, telefoneEmergencia, parentescoEmergencia, createdAt = /* @__PURE__ */ new Date(), updatedAt = /* @__PURE__ */ new Date()) {
		this.id = id;
		this.idGlobal = idGlobal;
		this.nome = nome;
		this.cpf = cpf;
		this.telefone = telefone;
		this.endereco = endereco;
		this.bairro = bairro;
		this.email = email;
		this.parentesco = parentesco;
		this.autorizadoRetirada = autorizadoRetirada;
		this.rg = rg;
		this.dataNascimento = dataNascimento;
		this.naturalidade = naturalidade;
		this.nacionalidade = nacionalidade;
		this.sexo = sexo;
		this.estadoCivil = estadoCivil;
		this.profissao = profissao;
		this.localTrabalho = localTrabalho;
		this.telefoneTrabalho = telefoneTrabalho;
		this.contatoEmergencia = contatoEmergencia$1;
		this.telefoneEmergencia = telefoneEmergencia;
		this.parentescoEmergencia = parentescoEmergencia;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	static create(data) {
		return new Responsavel(data.id, data.idGlobal, data.nome, data.cpf, data.telefone, data.endereco, data.bairro, data.email, data.parentesco || "pai", data.autorizadoRetirada ?? true, data.rg, data.dataNascimento, data.naturalidade, data.nacionalidade || "Brasileira", data.sexo, data.estadoCivil, data.profissao, data.localTrabalho, data.telefoneTrabalho, data.contatoEmergencia, data.telefoneEmergencia, data.parentescoEmergencia);
	}
};

//#endregion
//#region src/domain/entities/matricula.entity.ts
var Turma = class Turma {
	constructor(id, idGlobal, etapa, turno, capacidade, vagasDisponiveis, anoLetivo, nome, ativa = true, createdAt = /* @__PURE__ */ new Date(), updatedAt = /* @__PURE__ */ new Date()) {
		this.id = id;
		this.idGlobal = idGlobal;
		this.etapa = etapa;
		this.turno = turno;
		this.capacidade = capacidade;
		this.vagasDisponiveis = vagasDisponiveis;
		this.anoLetivo = anoLetivo;
		this.nome = nome;
		this.ativa = ativa;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	static create(data) {
		return new Turma(data.id, data.idGlobal, data.etapa, data.turno, data.capacidade, data.vagasDisponiveis, data.anoLetivo, data.nome, data.ativa ?? true);
	}
	temVagasDisponiveis() {
		return this.vagasDisponiveis > 0;
	}
};
var Matricula = class Matricula {
	constructor(id, idGlobal, protocoloLocal, aluno$1, responsavel$1, turma$1, status = "pre", dataMatricula, observacoes, createdAt = /* @__PURE__ */ new Date(), updatedAt = /* @__PURE__ */ new Date()) {
		this.id = id;
		this.idGlobal = idGlobal;
		this.protocoloLocal = protocoloLocal;
		this.aluno = aluno$1;
		this.responsavel = responsavel$1;
		this.turma = turma$1;
		this.status = status;
		this.dataMatricula = dataMatricula;
		this.observacoes = observacoes;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	static create(data) {
		return new Matricula(data.id, data.idGlobal, data.protocoloLocal, data.aluno, data.responsavel, data.turma, data.status || "pre", data.dataMatricula, data.observacoes);
	}
	converterParaCompleta(turma$1, dataMatricula) {
		return new Matricula(this.id, this.idGlobal, this.protocoloLocal, this.aluno.updateStatus("completo"), this.responsavel, turma$1 || this.turma, "completo", dataMatricula || /* @__PURE__ */ new Date(), this.observacoes, this.createdAt, /* @__PURE__ */ new Date());
	}
	aprovar() {
		return new Matricula(this.id, this.idGlobal, this.protocoloLocal, this.aluno.updateStatus("completo"), this.responsavel, this.turma, "completo", this.dataMatricula || /* @__PURE__ */ new Date(), this.observacoes, this.createdAt, /* @__PURE__ */ new Date());
	}
};

//#endregion
//#region ../../node_modules/uuid/dist-node/stringify.js
const byteToHex = [];
for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));
function unsafeStringify(arr, offset = 0) {
	return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

//#endregion
//#region ../../node_modules/uuid/dist-node/rng.js
const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
	if (poolPtr > rnds8Pool.length - 16) {
		(0, node_crypto.randomFillSync)(rnds8Pool);
		poolPtr = 0;
	}
	return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

//#endregion
//#region ../../node_modules/uuid/dist-node/native.js
var native_default = { randomUUID: node_crypto.randomUUID };

//#endregion
//#region ../../node_modules/uuid/dist-node/v4.js
function _v4(options, buf, offset) {
	options = options || {};
	const rnds = options.random ?? options.rng?.() ?? rng();
	if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
	rnds[6] = rnds[6] & 15 | 64;
	rnds[8] = rnds[8] & 63 | 128;
	if (buf) {
		offset = offset || 0;
		if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
		for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
		return buf;
	}
	return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
	if (native_default.randomUUID && !buf && !options) return native_default.randomUUID();
	return _v4(options, buf, offset);
}
var v4_default = v4;

//#endregion
//#region src/infrastructure/repositories/drizzle-matricula.repository.ts
var DrizzleMatriculaRepository = class {
	async findById(id) {
		const [result] = await import_db.db.select({
			matricula: require_dist.matricula,
			aluno: require_dist.aluno,
			responsavel: require_dist.responsavel,
			turma: require_dist.turma
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.eq)(require_dist.matricula.id, id)).limit(1);
		if (!result || !result.aluno || !result.responsavel) return null;
		return Matricula.create({
			id: result.matricula.id,
			idGlobal: result.matricula.idGlobal,
			protocoloLocal: result.matricula.protocoloLocal,
			aluno: Aluno.create({
				id: result.aluno.id,
				idGlobal: result.aluno.idGlobal,
				nome: result.aluno.nome,
				dataNascimento: result.aluno.dataNascimento,
				etapa: result.aluno.etapa,
				status: result.matricula.status,
				necessidadesEspeciais: result.aluno.necessidadesEspeciais,
				observacoes: result.aluno.observacoes
			}),
			responsavel: Responsavel.create({
				id: result.responsavel.id,
				idGlobal: result.responsavel.idGlobal,
				nome: result.responsavel.nome,
				cpf: result.responsavel.cpf,
				telefone: result.responsavel.telefone,
				endereco: result.responsavel.endereco,
				bairro: result.responsavel.bairro,
				email: result.responsavel.email,
				parentesco: result.responsavel.parentesco,
				autorizadoRetirada: result.responsavel.autorizadoRetirada
			}),
			turma: result.turma ? Turma.create({
				id: result.turma.id,
				idGlobal: result.turma.id,
				etapa: result.turma.etapa,
				turno: result.turma.turno,
				capacidade: 20,
				vagasDisponiveis: 5,
				anoLetivo: "2024",
				nome: result.turma.nome,
				ativa: true
			}) : void 0,
			status: result.matricula.status,
			dataMatricula: result.matricula.dataMatricula,
			observacoes: result.matricula.observacoes
		});
	}
	async findByProtocolo(protocolo) {
		return null;
	}
	async findByStatus(status) {
		return (await import_db.db.select({
			matricula: require_dist.matricula,
			aluno: require_dist.aluno,
			responsavel: require_dist.responsavel,
			turma: require_dist.turma
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.eq)(require_dist.matricula.status, status))).map(this.mapToMatricula);
	}
	async findByEtapa(etapa) {
		return (await import_db.db.select({
			matricula: require_dist.matricula,
			aluno: require_dist.aluno,
			responsavel: require_dist.responsavel,
			turma: require_dist.turma
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.eq)(require_dist.aluno.etapa, etapa))).map(this.mapToMatricula);
	}
	async findBySearch(search) {
		return (await import_db.db.select({
			matricula: require_dist.matricula,
			aluno: require_dist.aluno,
			responsavel: require_dist.responsavel,
			turma: require_dist.turma
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.or)((0, drizzle_orm.like)(require_dist.aluno.nome, `%${search}%`), (0, drizzle_orm.like)(require_dist.responsavel.nome, `%${search}%`), (0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, `%${search}%`)))).map(this.mapToMatricula);
	}
	async findAll(filters) {
		let query = import_db.db.select({
			matricula: require_dist.matricula,
			aluno: require_dist.aluno,
			responsavel: require_dist.responsavel,
			turma: require_dist.turma
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id));
		if (filters?.status && filters.status !== "todos") query = query.where((0, drizzle_orm.eq)(require_dist.matricula.status, filters.status));
		if (filters?.etapa && filters.etapa !== "todos") query = query.where((0, drizzle_orm.eq)(require_dist.aluno.etapa, filters.etapa));
		if (filters?.search) {
			const searchTerm = `%${filters.search}%`;
			query = query.where((0, drizzle_orm.or)((0, drizzle_orm.like)(require_dist.aluno.nome, searchTerm), (0, drizzle_orm.like)(require_dist.responsavel.nome, searchTerm), (0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, searchTerm)));
		}
		query = query.orderBy(drizzle_orm.sql`${require_dist.matricula.createdAt} DESC`);
		if (filters?.limit) query = query.limit(filters.limit);
		if (filters?.offset) query = query.offset(filters.offset);
		return (await query).map(this.mapToMatricula);
	}
	async count(filters) {
		let query = import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id));
		if (filters?.status && filters.status !== "todos") query = query.where((0, drizzle_orm.eq)(require_dist.matricula.status, filters.status));
		if (filters?.etapa && filters.etapa !== "todos") query = query.where((0, drizzle_orm.eq)(require_dist.aluno.etapa, filters.etapa));
		if (filters?.search) {
			const searchTerm = `%${filters.search}%`;
			query = query.where((0, drizzle_orm.or)((0, drizzle_orm.like)(require_dist.aluno.nome, searchTerm), (0, drizzle_orm.like)(require_dist.responsavel.nome, searchTerm), (0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, searchTerm)));
		}
		const [result] = await query;
		return result?.count || 0;
	}
	async save(matriculaEntity) {
		const [result] = await import_db.db.insert(require_dist.matricula).values({
			id: matriculaEntity.id,
			idGlobal: matriculaEntity.idGlobal,
			protocoloLocal: matriculaEntity.protocoloLocal,
			alunoId: matriculaEntity.aluno.id,
			responsavelId: matriculaEntity.responsavel.id,
			turmaId: matriculaEntity.turma?.id || null,
			status: matriculaEntity.status,
			dataMatricula: matriculaEntity.dataMatricula,
			observacoes: matriculaEntity.observacoes,
			createdAt: matriculaEntity.createdAt,
			updatedAt: matriculaEntity.updatedAt
		}).returning();
		return Matricula.create({
			id: result.id,
			idGlobal: result.idGlobal,
			protocoloLocal: result.protocoloLocal,
			aluno: matriculaEntity.aluno,
			responsavel: matriculaEntity.responsavel,
			turma: matriculaEntity.turma,
			status: result.status,
			dataMatricula: result.dataMatricula,
			observacoes: result.observacoes
		});
	}
	async update(matriculaEntity) {
		await import_db.db.update(require_dist.matricula).set({
			status: matriculaEntity.status,
			dataMatricula: matriculaEntity.dataMatricula,
			observacoes: matriculaEntity.observacoes,
			turmaId: matriculaEntity.turma?.id || null
		}).where((0, drizzle_orm.eq)(require_dist.matricula.id, matriculaEntity.id));
		await import_db.db.update(require_dist.aluno).set({
			status: matriculaEntity.aluno.status,
			necessidadesEspeciais: matriculaEntity.aluno.necessidadesEspeciais,
			observacoes: matriculaEntity.aluno.observacoes
		}).where((0, drizzle_orm.eq)(require_dist.aluno.id, matriculaEntity.aluno.id));
		return this.findById(matriculaEntity.id);
	}
	async delete(id) {
		await import_db.db.delete(require_dist.matricula).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
	}
	async createPreMatricula(data) {
		const protocolo = await this.generateProtocolo();
		const turmaDisponivel = await import_db.db.select().from(require_dist.turma).where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.turma.etapa, data.aluno.etapa), (0, drizzle_orm.eq)(require_dist.turma.ativa, true), drizzle_orm.sql`${require_dist.turma.vagasDisponiveis} > 0`)).limit(1);
		const turmaId = turmaDisponivel.length > 0 ? turmaDisponivel[0].id : null;
		const alunoId = v4_default();
		const [newAluno] = await import_db.db.insert(require_dist.aluno).values({
			id: alunoId,
			idGlobal: v4_default(),
			nome: data.aluno.nome,
			dataNascimento: data.aluno.dataNascimento,
			etapa: data.aluno.etapa,
			status: "pre",
			necessidadesEspeciais: data.aluno.necessidadesEspeciais || false,
			observacoes: data.aluno.observacoes
		}).returning();
		const responsavelId = v4_default();
		const [newResponsavel] = await import_db.db.insert(require_dist.responsavel).values({
			id: responsavelId,
			idGlobal: v4_default(),
			nome: data.responsavel.nome,
			cpf: data.responsavel.cpf,
			telefone: data.responsavel.telefone,
			endereco: data.responsavel.endereco,
			bairro: data.responsavel.bairro,
			email: data.responsavel.email,
			parentesco: data.responsavel.parentesco || "pai",
			autorizadoRetirada: data.responsavel.autorizadoRetirada ?? true
		}).returning();
		const matriculaId = v4_default();
		const [newMatricula] = await import_db.db.insert(require_dist.matricula).values({
			id: matriculaId,
			idGlobal: v4_default(),
			protocoloLocal: protocolo,
			alunoId,
			responsavelId,
			turmaId,
			status: "pre",
			observacoes: data.observacoes
		}).returning();
		return this.findById(matriculaId);
	}
	async generateProtocolo() {
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		const existingProtocols = await import_db.db.select({ protocoloLocal: require_dist.matricula.protocoloLocal }).from(require_dist.matricula).where((0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, `PRE-${year}-%`)).orderBy(drizzle_orm.sql`${require_dist.matricula.protocoloLocal} DESC`);
		let nextNumber = 1;
		if (existingProtocols.length > 0) {
			const match = existingProtocols[0].protocoloLocal.match(/PRE-\d{4}-(\d{3})/);
			if (match) nextNumber = parseInt(match[1]) + 1;
		}
		return `PRE-${year}-${nextNumber.toString().padStart(3, "0")}`;
	}
	mapToMatricula(result) {
		if (!result.aluno || !result.responsavel) throw new Error("Dados incompletos para criar matrícula");
		return Matricula.create({
			id: result.matricula.id,
			idGlobal: result.matricula.idGlobal,
			protocoloLocal: result.matricula.protocoloLocal,
			aluno: Aluno.create({
				id: result.aluno.id,
				idGlobal: result.aluno.idGlobal,
				nome: result.aluno.nome,
				dataNascimento: result.aluno.dataNascimento,
				etapa: result.aluno.etapa,
				status: result.matricula.status,
				necessidadesEspeciais: result.aluno.necessidadesEspeciais,
				observacoes: result.aluno.observacoes
			}),
			responsavel: Responsavel.create({
				id: result.responsavel.id,
				idGlobal: result.responsavel.idGlobal,
				nome: result.responsavel.nome,
				cpf: result.responsavel.cpf,
				telefone: result.responsavel.telefone,
				endereco: result.responsavel.endereco,
				bairro: result.responsavel.bairro,
				email: result.responsavel.email,
				parentesco: result.responsavel.parentesco,
				autorizadoRetirada: result.responsavel.autorizadoRetirada
			}),
			turma: result.turma ? Turma.create({
				id: result.turma.id,
				idGlobal: result.turma.id,
				etapa: result.turma.etapa,
				turno: result.turma.turno,
				capacidade: 20,
				vagasDisponiveis: 5,
				anoLetivo: "2024",
				nome: result.turma.nome,
				ativa: true
			}) : void 0,
			status: result.matricula.status,
			dataMatricula: result.matricula.dataMatricula,
			observacoes: result.matricula.observacoes,
			createdAt: result.matricula.createdAt,
			updatedAt: result.matricula.updatedAt
		});
	}
};

//#endregion
//#region src/infrastructure/repositories/drizzle-responsavel.repository.ts
var DrizzleResponsavelRepository = class {
	async findById(id) {
		const [result] = await import_db.db.select().from(require_dist.responsavel).where((0, drizzle_orm.eq)(require_dist.responsavel.id, id)).limit(1);
		if (!result) return null;
		return Responsavel.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			cpf: result.cpf,
			telefone: result.telefone,
			endereco: result.endereco,
			bairro: result.bairro,
			email: result.email,
			parentesco: result.parentesco,
			autorizadoRetirada: result.autorizadoRetirada
		});
	}
	async findByCPF(cpf) {
		const [result] = await import_db.db.select().from(require_dist.responsavel).where((0, drizzle_orm.eq)(require_dist.responsavel.cpf, cpf)).limit(1);
		if (!result) return null;
		return Responsavel.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			cpf: result.cpf,
			telefone: result.telefone,
			endereco: result.endereco,
			bairro: result.bairro,
			email: result.email,
			parentesco: result.parentesco,
			autorizadoRetirada: result.autorizadoRetirada
		});
	}
	async findByMatriculaId(matriculaId) {
		return null;
	}
	async save(responsavelEntity) {
		const [result] = await import_db.db.insert(require_dist.responsavel).values({
			id: responsavelEntity.id,
			idGlobal: responsavelEntity.idGlobal,
			nome: responsavelEntity.nome,
			cpf: responsavelEntity.cpf,
			telefone: responsavelEntity.telefone,
			endereco: responsavelEntity.endereco,
			bairro: responsavelEntity.bairro,
			email: responsavelEntity.email,
			parentesco: responsavelEntity.parentesco,
			autorizadoRetirada: responsavelEntity.autorizadoRetirada,
			rg: responsavelEntity.rg,
			dataNascimento: responsavelEntity.dataNascimento,
			naturalidade: responsavelEntity.naturalidade,
			nacionalidade: responsavelEntity.nacionalidade,
			sexo: responsavelEntity.sexo,
			estadoCivil: responsavelEntity.estadoCivil,
			profissao: responsavelEntity.profissao,
			localTrabalho: responsavelEntity.localTrabalho,
			telefoneTrabalho: responsavelEntity.telefoneTrabalho,
			contatoEmergencia: responsavelEntity.contatoEmergencia,
			telefoneEmergencia: responsavelEntity.telefoneEmergencia,
			parentescoEmergencia: responsavelEntity.parentescoEmergencia,
			createdAt: responsavelEntity.createdAt,
			updatedAt: responsavelEntity.updatedAt
		}).returning();
		return Responsavel.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			cpf: result.cpf,
			telefone: result.telefone,
			endereco: result.endereco,
			bairro: result.bairro,
			email: result.email,
			parentesco: result.parentesco,
			autorizadoRetirada: result.autorizadoRetirada
		});
	}
	async update(responsavelEntity) {
		const [result] = await import_db.db.update(require_dist.responsavel).set({
			nome: responsavelEntity.nome,
			cpf: responsavelEntity.cpf,
			telefone: responsavelEntity.telefone,
			endereco: responsavelEntity.endereco,
			bairro: responsavelEntity.bairro,
			email: responsavelEntity.email,
			parentesco: responsavelEntity.parentesco,
			autorizadoRetirada: responsavelEntity.autorizadoRetirada,
			updatedAt: /* @__PURE__ */ new Date()
		}).where((0, drizzle_orm.eq)(require_dist.responsavel.id, responsavelEntity.id)).returning();
		return Responsavel.create({
			id: result.id,
			idGlobal: result.idGlobal,
			nome: result.nome,
			cpf: result.cpf,
			telefone: result.telefone,
			endereco: result.endereco,
			bairro: result.bairro,
			email: result.email,
			parentesco: result.parentesco,
			autorizadoRetirada: result.autorizadoRetirada
		});
	}
	async delete(id) {
		await import_db.db.delete(require_dist.responsavel).where((0, drizzle_orm.eq)(require_dist.responsavel.id, id));
	}
};

//#endregion
//#region src/infrastructure/repositories/drizzle-turma.repository.ts
var DrizzleTurmaRepository = class {
	async findById(id) {
		return null;
	}
	async findByEtapa(etapa) {
		return [];
	}
	async findAvailableByEtapa(etapa) {
		return [];
	}
	async findBestForEtapa(etapa) {
		const turmasDisponiveis = [
			{
				id: "turma-1",
				nome: "Berçário A",
				etapa: "bercario",
				turno: "integral",
				capacidade: 15,
				vagasDisponiveis: 3
			},
			{
				id: "turma-2",
				nome: "Maternal A",
				etapa: "maternal",
				turno: "manha",
				capacidade: 20,
				vagasDisponiveis: 5
			},
			{
				id: "turma-3",
				nome: "Maternal B",
				etapa: "maternal",
				turno: "tarde",
				capacidade: 20,
				vagasDisponiveis: 0
			},
			{
				id: "turma-4",
				nome: "Pré-Escola A",
				etapa: "pre_escola",
				turno: "manha",
				capacidade: 25,
				vagasDisponiveis: 8
			},
			{
				id: "turma-5",
				nome: "Pré-Escola B",
				etapa: "pre_escola",
				turno: "tarde",
				capacidade: 25,
				vagasDisponiveis: 5
			},
			{
				id: "turma-6",
				nome: "Fundamental A",
				etapa: "fundamental",
				turno: "manha",
				capacidade: 30,
				vagasDisponiveis: 10
			}
		].filter((t) => t.etapa === etapa && t.vagasDisponiveis > 0);
		if (turmasDisponiveis.length === 0) return null;
		const turma$1 = turmasDisponiveis[0];
		return Turma.create({
			id: turma$1.id,
			idGlobal: turma$1.id,
			etapa: turma$1.etapa,
			turno: turma$1.turno,
			capacidade: turma$1.capacidade,
			vagasDisponiveis: turma$1.vagasDisponiveis,
			anoLetivo: "2024",
			nome: turma$1.nome,
			ativa: true
		});
	}
	async save(turma$1) {
		return turma$1;
	}
	async update(turma$1) {
		return turma$1;
	}
	async delete(id) {}
};

//#endregion
//#region src/domain/entities/relatorio.entity.ts
var RelatorioEntity = class RelatorioEntity {
	_id;
	_tipo;
	_formato;
	_filtros;
	_usuarioId;
	_nomeArquivo;
	_tamanhoArquivo;
	_createdAt;
	constructor(metadata) {
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
	validate(metadata) {
		if (!metadata.id) throw new Error("ID do relatório é obrigatório");
		if (!metadata.tipo) throw new Error("Tipo do relatório é obrigatório");
		if (!metadata.formato) throw new Error("Formato do relatório é obrigatório");
		if (!metadata.usuarioId) throw new Error("ID do usuário é obrigatório");
		if (!metadata.nomeArquivo) throw new Error("Nome do arquivo é obrigatório");
		if (!metadata.createdAt) throw new Error("Data de criação é obrigatória");
	}
	get id() {
		return this._id;
	}
	get tipo() {
		return this._tipo;
	}
	get formato() {
		return this._formato;
	}
	get filtros() {
		return this._filtros;
	}
	get usuarioId() {
		return this._usuarioId;
	}
	get nomeArquivo() {
		return this._nomeArquivo;
	}
	get tamanhoArquivo() {
		return this._tamanhoArquivo;
	}
	get createdAt() {
		return this._createdAt;
	}
	toMetadata() {
		return {
			id: this._id,
			tipo: this._tipo,
			formato: this._formato,
			filtros: this._filtros,
			usuarioId: this._usuarioId,
			nomeArquivo: this._nomeArquivo,
			tamanhoArquivo: this._tamanhoArquivo,
			createdAt: this._createdAt
		};
	}
	static create(id, tipo, formato, filtros, usuarioId, nomeArquivo, tamanhoArquivo) {
		return new RelatorioEntity({
			id,
			tipo,
			formato,
			filtros,
			usuarioId,
			nomeArquivo,
			tamanhoArquivo,
			createdAt: /* @__PURE__ */ new Date()
		});
	}
};

//#endregion
//#region src/infrastructure/repositories/drizzle-relatorio.repository.ts
var DrizzleRelatorioRepository = class {
	async saveMetadata(relatorio) {
		const metadata = relatorio.toMetadata();
		await require_dist.db.insert(require_dist.relatorioGerado).values({
			id: metadata.id,
			tipo: metadata.tipo,
			formato: metadata.formato,
			filtros: metadata.filtros,
			usuarioId: metadata.usuarioId,
			nomeArquivo: metadata.nomeArquivo,
			tamanhoArquivo: metadata.tamanhoArquivo,
			createdAt: metadata.createdAt
		});
	}
	async findRecentReports(usuarioId, limit = 10, offset = 0) {
		return (await require_dist.db.select().from(require_dist.relatorioGerado).where((0, drizzle_orm.eq)(require_dist.relatorioGerado.usuarioId, usuarioId)).orderBy((0, drizzle_orm.desc)(require_dist.relatorioGerado.createdAt)).limit(limit).offset(offset)).map((report) => ({
			id: report.id,
			tipo: report.tipo,
			formato: report.formato,
			filtros: report.filtros,
			usuarioId: report.usuarioId,
			nomeArquivo: report.nomeArquivo,
			tamanhoArquivo: report.tamanhoArquivo || void 0,
			createdAt: report.createdAt
		}));
	}
	async countReports(usuarioId) {
		return (await require_dist.db.select().from(require_dist.relatorioGerado).where((0, drizzle_orm.eq)(require_dist.relatorioGerado.usuarioId, usuarioId))).length;
	}
	async getReportData(tipo, filtros) {
		switch (tipo) {
			case "matriculas": return this.getMatriculasData(filtros);
			case "pre_matriculas": return this.getPreMatriculasData(filtros);
			case "turmas": return this.getTurmasData(filtros);
			case "documentos": return this.getDocumentosData(filtros);
			case "pendencias": return this.getPendenciasData(filtros);
			case "geral": return this.getGeralData(filtros);
			default: throw new Error(`Tipo de relatório não suportado: ${tipo}`);
		}
	}
	async getMatriculasData(filtros) {
		const { aluno: aluno$1, responsavel: responsavel$1, matricula: matricula$1, turma: turma$1 } = await Promise.resolve().then(() => require("./dist-BiQyyt1H.js"));
		let query = require_dist.db.select({
			id: matricula$1.id,
			protocoloLocal: matricula$1.protocoloLocal,
			status: matricula$1.status,
			dataMatricula: matricula$1.dataMatricula,
			observacoes: matricula$1.observacoes,
			createdAt: matricula$1.createdAt,
			updatedAt: matricula$1.updatedAt,
			aluno: {
				id: aluno$1.id,
				nome: aluno$1.nome,
				dataNascimento: aluno$1.dataNascimento,
				etapa: aluno$1.etapa,
				necessidadesEspeciais: aluno$1.necessidadesEspeciais,
				observacoes: aluno$1.observacoes
			},
			responsavel: {
				id: responsavel$1.id,
				nome: responsavel$1.nome,
				cpf: responsavel$1.cpf,
				telefone: responsavel$1.telefone,
				endereco: responsavel$1.endereco,
				bairro: responsavel$1.bairro,
				email: responsavel$1.email,
				parentesco: responsavel$1.parentesco,
				autorizadoRetirada: responsavel$1.autorizadoRetirada
			},
			turma: {
				id: turma$1.id,
				nome: turma$1.nome,
				etapa: turma$1.etapa,
				turno: turma$1.turno
			}
		}).from(matricula$1).innerJoin(aluno$1, (0, drizzle_orm.eq)(matricula$1.alunoId, aluno$1.id)).innerJoin(responsavel$1, (0, drizzle_orm.eq)(matricula$1.responsavelId, responsavel$1.id)).leftJoin(turma$1, (0, drizzle_orm.eq)(matricula$1.turmaId, turma$1.id));
		const conditions = [];
		if (filtros.dataInicio && filtros.dataFim) {
			const campoData = filtros.campoData === "dataMatricula" ? matricula$1.dataMatricula : matricula$1.createdAt;
			conditions.push((0, drizzle_orm.and)((0, drizzle_orm.gte)(campoData, filtros.dataInicio), (0, drizzle_orm.lte)(campoData, filtros.dataFim)));
		}
		if (filtros.status && filtros.status !== "todos") conditions.push((0, drizzle_orm.eq)(matricula$1.status, filtros.status));
		if (filtros.etapa && filtros.etapa !== "todos") conditions.push((0, drizzle_orm.eq)(aluno$1.etapa, filtros.etapa));
		if (filtros.turma && filtros.turma !== "todos") conditions.push((0, drizzle_orm.eq)(turma$1.id, filtros.turma));
		if (filtros.search) conditions.push((0, drizzle_orm.or)((0, drizzle_orm.ilike)(aluno$1.nome, `%${filtros.search}%`), (0, drizzle_orm.ilike)(responsavel$1.nome, `%${filtros.search}%`), (0, drizzle_orm.ilike)(matricula$1.protocoloLocal, `%${filtros.search}%`)));
		if (conditions.length > 0) query = query.where((0, drizzle_orm.and)(...conditions));
		return await query;
	}
	async getPreMatriculasData(filtros) {
		return await this.getMatriculasData({
			...filtros,
			status: "pre"
		});
	}
	async getTurmasData(filtros) {
		const { turma: turma$1 } = await Promise.resolve().then(() => require("./dist-BiQyyt1H.js"));
		const { eq: eq$7, and: and$5, ilike: ilike$1 } = await import("drizzle-orm");
		let query = require_dist.db.select().from(turma$1);
		const conditions = [];
		if (filtros.etapa && filtros.etapa !== "todos") conditions.push(eq$7(turma$1.etapa, filtros.etapa));
		if (filtros.turma && filtros.turma !== "todos") conditions.push(eq$7(turma$1.id, filtros.turma));
		if (filtros.search) conditions.push(ilike$1(turma$1.nome, `%${filtros.search}%`));
		if (conditions.length > 0) query = query.where(and$5(...conditions));
		const turmas = await query;
		const { matricula: matricula$1 } = await Promise.resolve().then(() => require("./dist-BiQyyt1H.js"));
		const turmasComContagem = [];
		for (const turma$2 of turmas) {
			const alunosCount = await require_dist.db.select({ count: (0, drizzle_orm.count)() }).from(matricula$1).where(eq$7(matricula$1.turmaId, turma$2.id));
			turmasComContagem.push({
				...turma$2,
				alunosCount: alunosCount[0]?.count || 0
			});
		}
		return turmasComContagem;
	}
	async getDocumentosData(filtros) {
		const { documento: documento$1, matricula: matricula$1, aluno: aluno$1, responsavel: responsavel$1 } = await Promise.resolve().then(() => require("./dist-BiQyyt1H.js"));
		let query = require_dist.db.select({
			id: documento$1.id,
			tipo: documento$1.tipo,
			status: documento$1.status,
			nomeArquivo: documento$1.nomeArquivo,
			tamanhoArquivo: documento$1.tamanhoArquivo,
			observacoes: documento$1.observacoes,
			createdAt: documento$1.createdAt,
			updatedAt: documento$1.updatedAt,
			matricula: {
				id: matricula$1.id,
				protocoloLocal: matricula$1.protocoloLocal,
				aluno: {
					nome: aluno$1.nome,
					etapa: aluno$1.etapa
				},
				responsavel: { nome: responsavel$1.nome }
			}
		}).from(documento$1).innerJoin(matricula$1, (0, drizzle_orm.eq)(documento$1.matriculaId, matricula$1.id)).innerJoin(aluno$1, (0, drizzle_orm.eq)(matricula$1.alunoId, aluno$1.id)).innerJoin(responsavel$1, (0, drizzle_orm.eq)(matricula$1.responsavelId, responsavel$1.id));
		const conditions = [];
		if (filtros.dataInicio && filtros.dataFim) conditions.push((0, drizzle_orm.and)((0, drizzle_orm.gte)(documento$1.createdAt, filtros.dataInicio), (0, drizzle_orm.lte)(documento$1.createdAt, filtros.dataFim)));
		if (filtros.status && filtros.status !== "todos") conditions.push((0, drizzle_orm.eq)(documento$1.status, filtros.status));
		if (filtros.search) conditions.push((0, drizzle_orm.or)((0, drizzle_orm.ilike)(aluno$1.nome, `%${filtros.search}%`), (0, drizzle_orm.ilike)(responsavel$1.nome, `%${filtros.search}%`), (0, drizzle_orm.ilike)(matricula$1.protocoloLocal, `%${filtros.search}%`)));
		if (conditions.length > 0) query = query.where((0, drizzle_orm.and)(...conditions));
		return await query;
	}
	async getPendenciasData(filtros) {
		const { pendencia: pendencia$1, matricula: matricula$1, aluno: aluno$1, responsavel: responsavel$1 } = await Promise.resolve().then(() => require("./dist-BiQyyt1H.js"));
		let query = require_dist.db.select({
			id: pendencia$1.id,
			descricao: pendencia$1.descricao,
			prazo: pendencia$1.prazo,
			resolvido: pendencia$1.resolvido,
			dataResolucao: pendencia$1.dataResolucao,
			observacoes: pendencia$1.observacoes,
			createdAt: pendencia$1.createdAt,
			updatedAt: pendencia$1.updatedAt,
			matricula: {
				id: matricula$1.id,
				protocoloLocal: matricula$1.protocoloLocal,
				aluno: {
					nome: aluno$1.nome,
					etapa: aluno$1.etapa
				},
				responsavel: { nome: responsavel$1.nome }
			}
		}).from(pendencia$1).innerJoin(matricula$1, (0, drizzle_orm.eq)(pendencia$1.matriculaId, matricula$1.id)).innerJoin(aluno$1, (0, drizzle_orm.eq)(matricula$1.alunoId, aluno$1.id)).innerJoin(responsavel$1, (0, drizzle_orm.eq)(matricula$1.responsavelId, responsavel$1.id));
		const conditions = [];
		if (filtros.dataInicio && filtros.dataFim) conditions.push((0, drizzle_orm.and)((0, drizzle_orm.gte)(pendencia$1.createdAt, filtros.dataInicio), (0, drizzle_orm.lte)(pendencia$1.createdAt, filtros.dataFim)));
		if (filtros.status && filtros.status !== "todos") conditions.push((0, drizzle_orm.eq)(pendencia$1.resolvido, filtros.status === "resolvido"));
		if (filtros.search) conditions.push((0, drizzle_orm.or)((0, drizzle_orm.ilike)(aluno$1.nome, `%${filtros.search}%`), (0, drizzle_orm.ilike)(responsavel$1.nome, `%${filtros.search}%`), (0, drizzle_orm.ilike)(matricula$1.protocoloLocal, `%${filtros.search}%`), (0, drizzle_orm.ilike)(pendencia$1.descricao, `%${filtros.search}%`)));
		if (conditions.length > 0) query = query.where((0, drizzle_orm.and)(...conditions));
		return await query;
	}
	async getGeralData(filtros) {
		const [matriculas, turmas, documentos, pendencias] = await Promise.all([
			this.getMatriculasData(filtros),
			this.getTurmasData(filtros),
			this.getDocumentosData(filtros),
			this.getPendenciasData(filtros)
		]);
		return {
			matriculas,
			turmas,
			documentos,
			pendencias,
			resumo: {
				totalMatriculas: matriculas.length,
				totalTurmas: turmas.length,
				totalDocumentos: documentos.length,
				totalPendencias: pendencias.length,
				pendenciasResolvidas: pendencias.filter((p) => p.resolvido).length,
				pendenciasPendentes: pendencias.filter((p) => !p.resolvido).length
			}
		};
	}
};

//#endregion
//#region src/domain/value-objects/cpf.value-object.ts
var CPF = class {
	value;
	constructor(cpf) {
		const cleanCPF = cpf.replace(/\D/g, "");
		if (!this.isValid(cleanCPF)) throw new Error("CPF inválido");
		this.value = cleanCPF;
	}
	isValid(cpf) {
		if (cpf.length !== 11) return false;
		if (/^(\d)\1{10}$/.test(cpf)) return false;
		let sum = 0;
		for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
		let remainder = sum * 10 % 11;
		if (remainder === 10 || remainder === 11) remainder = 0;
		if (remainder !== parseInt(cpf.charAt(9))) return false;
		sum = 0;
		for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
		remainder = sum * 10 % 11;
		if (remainder === 10 || remainder === 11) remainder = 0;
		if (remainder !== parseInt(cpf.charAt(10))) return false;
		return true;
	}
	toString() {
		return this.value;
	}
	getFormatted() {
		return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}
};

//#endregion
//#region src/domain/value-objects/email.value-object.ts
var Email = class {
	value;
	constructor(email) {
		if (!this.isValid(email)) throw new Error("Email inválido");
		this.value = email.toLowerCase().trim();
	}
	isValid(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
	toString() {
		return this.value;
	}
};

//#endregion
//#region src/domain/value-objects/telefone.value-object.ts
var Telefone = class {
	value;
	constructor(telefone) {
		const cleanPhone = telefone.replace(/\D/g, "");
		if (!this.isValid(cleanPhone)) throw new Error("Telefone inválido");
		this.value = cleanPhone;
	}
	isValid(phone) {
		return phone.length >= 10 && phone.length <= 11;
	}
	toString() {
		return this.value;
	}
	getFormatted() {
		if (this.value.length === 11) return this.value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
		else return this.value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
};

//#endregion
//#region src/domain/value-objects/protocolo.value-object.ts
var Protocolo = class Protocolo {
	value;
	constructor(protocolo) {
		if (!this.isValid(protocolo)) throw new Error("Protocolo inválido");
		this.value = protocolo;
	}
	isValid(protocolo) {
		return /^PRE-\d{4}-\d{3}$/.test(protocolo);
	}
	static generate(year, sequence) {
		return new Protocolo(`PRE-${year}-${sequence.toString().padStart(3, "0")}`);
	}
	toString() {
		return this.value;
	}
	getYear() {
		const match = this.value.match(/PRE-(\d{4})-\d{3}/);
		return match ? parseInt(match[1]) : 0;
	}
	getSequence() {
		const match = this.value.match(/PRE-\d{4}-(\d{3})/);
		return match ? parseInt(match[1]) : 0;
	}
};

//#endregion
//#region src/domain/services/matricula.domain-service.ts
var MatriculaDomainService = class {
	validateAlunoData(data) {
		if (!data.nome || data.nome.trim().length < 2) throw new Error("Nome do aluno é obrigatório e deve ter pelo menos 2 caracteres");
		if (!data.dataNascimento) throw new Error("Data de nascimento do aluno é obrigatória");
		const age = (/* @__PURE__ */ new Date()).getFullYear() - new Date(data.dataNascimento).getFullYear();
		if (age < 0 || age > 18) throw new Error("Idade do aluno deve estar entre 0 e 18 anos");
		if (!data.etapa) throw new Error("Etapa educacional é obrigatória");
	}
	validateResponsavelData(data) {
		if (!data.nome || data.nome.trim().length < 2) throw new Error("Nome do responsável é obrigatório e deve ter pelo menos 2 caracteres");
		try {
			new CPF(data.cpf);
		} catch {
			throw new Error("CPF do responsável é obrigatório e deve ser válido");
		}
		try {
			new Telefone(data.telefone);
		} catch {
			throw new Error("Telefone do responsável é obrigatório e deve ser válido");
		}
		if (!data.endereco || data.endereco.trim().length < 5) throw new Error("Endereço do responsável é obrigatório e deve ter pelo menos 5 caracteres");
		if (!data.bairro || data.bairro.trim().length < 2) throw new Error("Bairro do responsável é obrigatório e deve ter pelo menos 2 caracteres");
		if (data.email) try {
			new Email(data.email);
		} catch {
			throw new Error("Email do responsável deve ser válido");
		}
	}
	canConvertToMatriculaCompleta(matricula$1) {
		return matricula$1.status === "pre";
	}
	canApproveMatricula(matricula$1) {
		return matricula$1.status !== "completo";
	}
	generateProtocolo(year, sequence) {
		return Protocolo.generate(year, sequence);
	}
	assignTurmaToMatricula(matricula$1, turma$1) {
		if (!turma$1.temVagasDisponiveis()) throw new Error("Turma não possui vagas disponíveis");
		if (turma$1.etapa !== matricula$1.aluno.etapa) throw new Error("Turma não é compatível com a etapa do aluno");
		return new Matricula(matricula$1.id, matricula$1.idGlobal, matricula$1.protocoloLocal, matricula$1.aluno, matricula$1.responsavel, turma$1, matricula$1.status, matricula$1.dataMatricula, matricula$1.observacoes, matricula$1.createdAt, /* @__PURE__ */ new Date());
	}
};

//#endregion
//#region src/repositories/pre-matricula.repository.ts
var PreMatriculaRepository = class {
	async findBestTurmaForEtapa(etapa) {
		const turmasDisponiveis = [
			{
				id: "turma-1",
				nome: "Berçário A",
				etapa: "bercario",
				turno: "integral",
				capacidade: 15,
				vagasDisponiveis: 3
			},
			{
				id: "turma-2",
				nome: "Maternal A",
				etapa: "maternal",
				turno: "manha",
				capacidade: 20,
				vagasDisponiveis: 5
			},
			{
				id: "turma-3",
				nome: "Maternal B",
				etapa: "maternal",
				turno: "tarde",
				capacidade: 20,
				vagasDisponiveis: 0
			},
			{
				id: "turma-4",
				nome: "Pré-Escola A",
				etapa: "pre_escola",
				turno: "manha",
				capacidade: 25,
				vagasDisponiveis: 8
			},
			{
				id: "turma-5",
				nome: "Pré-Escola B",
				etapa: "pre_escola",
				turno: "tarde",
				capacidade: 25,
				vagasDisponiveis: 5
			},
			{
				id: "turma-6",
				nome: "Fundamental A",
				etapa: "fundamental",
				turno: "manha",
				capacidade: 30,
				vagasDisponiveis: 10
			}
		].filter((t) => t.etapa === etapa && t.vagasDisponiveis > 0);
		if (turmasDisponiveis.length === 0) return null;
		const turma$1 = turmasDisponiveis[0];
		return {
			id: turma$1.id,
			nome: turma$1.nome
		};
	}
	async updateMatriculasWithTurmas() {}
	async updateMatricula(id, data) {
		const existing = await this.findById(id);
		if (!existing) return null;
		if (data.alunoNome || data.alunoDataNascimento || data.alunoEtapa || data.alunoNecessidadesEspeciais !== void 0 || data.alunoObservacoes !== void 0) await require_dist.db.update(require_dist.aluno).set({
			nome: data.alunoNome || existing.aluno.nome,
			dataNascimento: data.alunoDataNascimento ? new Date(data.alunoDataNascimento) : existing.aluno.dataNascimento,
			etapa: data.alunoEtapa || existing.aluno.etapa,
			necessidadesEspeciais: data.alunoNecessidadesEspeciais !== void 0 ? data.alunoNecessidadesEspeciais : existing.aluno.necessidadesEspeciais,
			observacoes: data.alunoObservacoes !== void 0 ? data.alunoObservacoes : existing.aluno.observacoes
		}).where((0, drizzle_orm.eq)(require_dist.aluno.id, existing.aluno.id));
		if (data.responsavelNome || data.responsavelCpf || data.responsavelTelefone || data.responsavelEmail !== void 0 || data.responsavelEndereco || data.responsavelBairro || data.responsavelParentesco || data.responsavelAutorizadoRetirada !== void 0) await require_dist.db.update(require_dist.responsavel).set({
			nome: data.responsavelNome || existing.responsavel.nome,
			cpf: data.responsavelCpf || existing.responsavel.cpf,
			telefone: data.responsavelTelefone || existing.responsavel.telefone,
			email: data.responsavelEmail !== void 0 ? data.responsavelEmail : existing.responsavel.email,
			endereco: data.responsavelEndereco || existing.responsavel.endereco,
			bairro: data.responsavelBairro || existing.responsavel.bairro,
			parentesco: data.responsavelParentesco || existing.responsavel.parentesco,
			autorizadoRetirada: data.responsavelAutorizadoRetirada !== void 0 ? data.responsavelAutorizadoRetirada : existing.responsavel.autorizadoRetirada
		}).where((0, drizzle_orm.eq)(require_dist.responsavel.id, existing.responsavel.id));
		if (data.observacoes !== void 0) await require_dist.db.update(require_dist.matricula).set({ observacoes: data.observacoes }).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
		return this.findById(id);
	}
	async approveMatricula(id) {
		const existing = await this.findById(id);
		if (!existing) return null;
		if (existing.status === "completo") throw new Error("Matrícula já está aprovada");
		await require_dist.db.update(require_dist.matricula).set({
			status: "completo",
			dataMatricula: /* @__PURE__ */ new Date()
		}).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
		await require_dist.db.update(require_dist.aluno).set({ status: "completo" }).where((0, drizzle_orm.eq)(require_dist.aluno.id, existing.aluno.id));
		return this.findById(id);
	}
	async deleteMatricula(id) {
		if (!await this.findByIdAny(id)) return false;
		try {
			await require_dist.db.delete(require_dist.documento).where((0, drizzle_orm.eq)(require_dist.documento.matriculaId, id));
			await require_dist.db.delete(require_dist.matricula).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
			return true;
		} catch (error) {
			console.error("Erro ao deletar matrícula:", error);
			return false;
		}
	}
	async findResponsavelByCPF(cpfValue) {
		const [result] = await require_dist.db.select({ id: require_dist.responsavel.id }).from(require_dist.responsavel).where((0, drizzle_orm.eq)(require_dist.responsavel.cpf, cpfValue)).limit(1);
		return result || null;
	}
	async generateProtocolo() {
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		const existingProtocols = await require_dist.db.select({ protocoloLocal: require_dist.matricula.protocoloLocal }).from(require_dist.matricula).where((0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, `PRE-${year}-%`)).orderBy((0, drizzle_orm.desc)(require_dist.matricula.protocoloLocal));
		let nextNumber = 1;
		if (existingProtocols.length > 0) {
			const match = existingProtocols[0].protocoloLocal.match(/PRE-\d{4}-(\d{3})/);
			if (match) nextNumber = parseInt(match[1]) + 1;
		}
		return `PRE-${year}-${nextNumber.toString().padStart(3, "0")}`;
	}
	async createPreMatricula(data) {
		const protocolo = await this.generateProtocolo();
		const alunoId = v4_default();
		const [newAluno] = await require_dist.db.insert(require_dist.aluno).values({
			id: alunoId,
			idGlobal: v4_default(),
			nome: data.aluno.nome,
			dataNascimento: data.aluno.dataNascimento,
			etapa: data.aluno.etapa,
			status: "pre",
			necessidadesEspeciais: data.aluno.necessidadesEspeciais || false,
			observacoes: data.aluno.observacoes
		}).returning();
		const responsavelId = v4_default();
		const idGlobal = v4_default();
		console.log("🔍 Tentando inserir responsável:", {
			id: responsavelId,
			nome: data.responsavel.nome,
			cpf: data.responsavel.cpf
		});
		try {
			const result = await require_dist.db.execute(drizzle_orm.sql`
        INSERT INTO responsavel (
          id, id_global, nome, cpf, telefone, endereco, bairro, email
        ) VALUES (
          ${responsavelId}, ${idGlobal}, ${data.responsavel.nome}, ${data.responsavel.cpf}, 
          ${data.responsavel.telefone}, ${data.responsavel.endereco}, ${data.responsavel.bairro}, 
          ${data.responsavel.email}
        ) RETURNING id, nome, cpf
      `);
			console.log("✅ Responsável inserido com sucesso:", result.rows[0]);
			result.rows[0];
		} catch (error) {
			console.error("❌ Erro detalhado ao inserir responsável:", {
				message: error.message,
				code: error.code,
				detail: error.detail,
				hint: error.hint,
				constraint: error.constraint,
				fullError: error
			});
			throw error;
		}
		const matriculaId = v4_default();
		const [newMatricula] = await require_dist.db.insert(require_dist.matricula).values({
			id: matriculaId,
			idGlobal: v4_default(),
			protocoloLocal: protocolo,
			alunoId,
			responsavelId,
			status: "pre",
			observacoes: data.observacoes
		}).returning();
		return this.findById(matriculaId);
	}
	async findAll(filters = {}) {
		let query = require_dist.db.select({
			id: require_dist.matricula.id,
			protocoloLocal: require_dist.matricula.protocoloLocal,
			status: require_dist.matricula.status,
			dataMatricula: require_dist.matricula.dataMatricula,
			observacoes: require_dist.matricula.observacoes,
			createdAt: require_dist.matricula.createdAt,
			updatedAt: require_dist.matricula.updatedAt,
			aluno: {
				id: require_dist.aluno.id,
				nome: require_dist.aluno.nome,
				dataNascimento: require_dist.aluno.dataNascimento,
				etapa: require_dist.aluno.etapa,
				necessidadesEspeciais: require_dist.aluno.necessidadesEspeciais,
				observacoes: require_dist.aluno.observacoes
			},
			responsavel: {
				id: require_dist.responsavel.id,
				nome: require_dist.responsavel.nome,
				cpf: require_dist.responsavel.cpf,
				telefone: require_dist.responsavel.telefone,
				endereco: require_dist.responsavel.endereco,
				bairro: require_dist.responsavel.bairro,
				email: require_dist.responsavel.email,
				parentesco: require_dist.responsavel.parentesco,
				autorizadoRetirada: require_dist.responsavel.autorizadoRetirada
			},
			turma: {
				id: require_dist.turma.id,
				nome: require_dist.turma.nome,
				etapa: require_dist.turma.etapa,
				turno: require_dist.turma.turno
			}
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.eq)(require_dist.matricula.status, "pre")).orderBy((0, drizzle_orm.desc)(require_dist.matricula.createdAt));
		if (filters.etapa) query = query.where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.matricula.status, "pre"), (0, drizzle_orm.eq)(require_dist.aluno.etapa, filters.etapa)));
		if (filters.search) {
			const searchTerm = `%${filters.search}%`;
			query = query.where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.matricula.status, "pre"), (0, drizzle_orm.or)((0, drizzle_orm.like)(require_dist.aluno.nome, searchTerm), (0, drizzle_orm.like)(require_dist.responsavel.nome, searchTerm), (0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, searchTerm))));
		}
		if (filters.limit) query = query.limit(filters.limit);
		if (filters.offset) query = query.offset(filters.offset);
		return query;
	}
	async findAllMatriculas(filters = {}) {
		let query = require_dist.db.select({
			id: require_dist.matricula.id,
			protocoloLocal: require_dist.matricula.protocoloLocal,
			status: require_dist.matricula.status,
			dataMatricula: require_dist.matricula.dataMatricula,
			observacoes: require_dist.matricula.observacoes,
			createdAt: require_dist.matricula.createdAt,
			updatedAt: require_dist.matricula.updatedAt,
			aluno: {
				id: require_dist.aluno.id,
				nome: require_dist.aluno.nome,
				dataNascimento: require_dist.aluno.dataNascimento,
				etapa: require_dist.aluno.etapa,
				necessidadesEspeciais: require_dist.aluno.necessidadesEspeciais,
				observacoes: require_dist.aluno.observacoes
			},
			responsavel: {
				id: require_dist.responsavel.id,
				nome: require_dist.responsavel.nome,
				cpf: require_dist.responsavel.cpf,
				telefone: require_dist.responsavel.telefone,
				endereco: require_dist.responsavel.endereco,
				bairro: require_dist.responsavel.bairro,
				email: require_dist.responsavel.email,
				parentesco: require_dist.responsavel.parentesco,
				autorizadoRetirada: require_dist.responsavel.autorizadoRetirada
			},
			turma: {
				id: require_dist.turma.id,
				nome: require_dist.turma.nome,
				etapa: require_dist.turma.etapa,
				turno: require_dist.turma.turno
			}
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).orderBy((0, drizzle_orm.desc)(require_dist.matricula.createdAt));
		if (filters.status && filters.status !== "todos") query = query.where((0, drizzle_orm.eq)(require_dist.matricula.status, filters.status));
		if (filters.etapa) query = query.where((0, drizzle_orm.eq)(require_dist.aluno.etapa, filters.etapa));
		if (filters.search) {
			const searchTerm = `%${filters.search}%`;
			query = query.where((0, drizzle_orm.or)((0, drizzle_orm.like)(require_dist.aluno.nome, searchTerm), (0, drizzle_orm.like)(require_dist.responsavel.nome, searchTerm), (0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, searchTerm)));
		}
		if (filters.limit) query = query.limit(filters.limit);
		if (filters.offset) query = query.offset(filters.offset);
		const results = await query;
		return await Promise.all(results.map(async (matricula$1) => {
			if (!matricula$1.turma) {
				const bestTurma = await this.findBestTurmaForEtapa(matricula$1.aluno.etapa);
				if (bestTurma) return {
					...matricula$1,
					turma: {
						id: bestTurma.id,
						nome: bestTurma.nome,
						etapa: matricula$1.aluno.etapa,
						turno: "manha"
					}
				};
			}
			return matricula$1;
		}));
	}
	async findById(id) {
		const [result] = await require_dist.db.select({
			id: require_dist.matricula.id,
			protocoloLocal: require_dist.matricula.protocoloLocal,
			status: require_dist.matricula.status,
			dataMatricula: require_dist.matricula.dataMatricula,
			observacoes: require_dist.matricula.observacoes,
			createdAt: require_dist.matricula.createdAt,
			updatedAt: require_dist.matricula.updatedAt,
			aluno: {
				id: require_dist.aluno.id,
				nome: require_dist.aluno.nome,
				dataNascimento: require_dist.aluno.dataNascimento,
				etapa: require_dist.aluno.etapa,
				necessidadesEspeciais: require_dist.aluno.necessidadesEspeciais,
				observacoes: require_dist.aluno.observacoes
			},
			responsavel: {
				id: require_dist.responsavel.id,
				nome: require_dist.responsavel.nome,
				cpf: require_dist.responsavel.cpf,
				telefone: require_dist.responsavel.telefone,
				endereco: require_dist.responsavel.endereco,
				bairro: require_dist.responsavel.bairro,
				email: require_dist.responsavel.email,
				parentesco: require_dist.responsavel.parentesco,
				autorizadoRetirada: require_dist.responsavel.autorizadoRetirada
			},
			turma: {
				id: require_dist.turma.id,
				nome: require_dist.turma.nome,
				etapa: require_dist.turma.etapa,
				turno: require_dist.turma.turno
			}
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.matricula.id, id), (0, drizzle_orm.eq)(require_dist.matricula.status, "pre"))).limit(1);
		return result || null;
	}
	async findByIdAny(id) {
		const [result] = await require_dist.db.select({
			id: require_dist.matricula.id,
			protocoloLocal: require_dist.matricula.protocoloLocal,
			status: require_dist.matricula.status,
			dataMatricula: require_dist.matricula.dataMatricula,
			observacoes: require_dist.matricula.observacoes,
			createdAt: require_dist.matricula.createdAt,
			updatedAt: require_dist.matricula.updatedAt,
			aluno: {
				id: require_dist.aluno.id,
				nome: require_dist.aluno.nome,
				dataNascimento: require_dist.aluno.dataNascimento,
				etapa: require_dist.aluno.etapa,
				necessidadesEspeciais: require_dist.aluno.necessidadesEspeciais,
				observacoes: require_dist.aluno.observacoes
			},
			responsavel: {
				id: require_dist.responsavel.id,
				nome: require_dist.responsavel.nome,
				cpf: require_dist.responsavel.cpf,
				telefone: require_dist.responsavel.telefone,
				endereco: require_dist.responsavel.endereco,
				bairro: require_dist.responsavel.bairro,
				email: require_dist.responsavel.email,
				parentesco: require_dist.responsavel.parentesco,
				autorizadoRetirada: require_dist.responsavel.autorizadoRetirada
			},
			turma: {
				id: require_dist.turma.id,
				nome: require_dist.turma.nome,
				etapa: require_dist.turma.etapa,
				turno: require_dist.turma.turno
			}
		}).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).leftJoin(require_dist.turma, (0, drizzle_orm.eq)(require_dist.matricula.turmaId, require_dist.turma.id)).where((0, drizzle_orm.eq)(require_dist.matricula.id, id)).limit(1);
		return result || null;
	}
	async updatePreMatricula(id, data) {
		const existing = await this.findById(id);
		if (!existing) return null;
		if (data.aluno) await require_dist.db.update(require_dist.aluno).set({ ...data.aluno }).where((0, drizzle_orm.eq)(require_dist.aluno.id, existing.aluno.id));
		if (data.responsavel) await require_dist.db.update(require_dist.responsavel).set({ ...data.responsavel }).where((0, drizzle_orm.eq)(require_dist.responsavel.id, existing.responsavel.id));
		await require_dist.db.update(require_dist.matricula).set({ observacoes: data.observacoes }).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
		return this.findById(id);
	}
	async deletePreMatricula(id) {
		if (!await this.findById(id)) return false;
		await require_dist.db.delete(require_dist.matricula).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
		return true;
	}
	async convertToMatriculaCompleta(id, turmaId, dataMatriculaOverride, documentosIniciais) {
		const existing = await this.findById(id);
		if (!existing) return null;
		let finalTurmaId = turmaId;
		if (!finalTurmaId) finalTurmaId = (await this.findBestTurmaForEtapa(existing.aluno.etapa))?.id || null;
		await require_dist.db.update(require_dist.matricula).set({
			status: "completo",
			dataMatricula: dataMatriculaOverride || /* @__PURE__ */ new Date(),
			turmaId: finalTurmaId
		}).where((0, drizzle_orm.eq)(require_dist.matricula.id, id));
		await require_dist.db.update(require_dist.aluno).set({ status: "completo" }).where((0, drizzle_orm.eq)(require_dist.aluno.id, existing.aluno.id));
		if (documentosIniciais && documentosIniciais.length > 0) await require_dist.db.insert(require_dist.documento).values(documentosIniciais.map((d) => ({
			id: v4_default(),
			matriculaId: id,
			tipo: d.tipo,
			status: "pendente",
			observacoes: d.observacoes,
			createdAt: /* @__PURE__ */ new Date()
		})));
		return this.findByIdAny(id);
	}
	async count(filters = {}) {
		let query = require_dist.db.select({ count: require_dist.matricula.id }).from(require_dist.matricula).leftJoin(require_dist.aluno, (0, drizzle_orm.eq)(require_dist.matricula.alunoId, require_dist.aluno.id)).leftJoin(require_dist.responsavel, (0, drizzle_orm.eq)(require_dist.matricula.responsavelId, require_dist.responsavel.id)).where((0, drizzle_orm.eq)(require_dist.matricula.status, "pre"));
		if (filters.etapa) query = query.where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.matricula.status, "pre"), (0, drizzle_orm.eq)(require_dist.aluno.etapa, filters.etapa)));
		if (filters.search) {
			const searchTerm = `%${filters.search}%`;
			query = query.where((0, drizzle_orm.and)((0, drizzle_orm.eq)(require_dist.matricula.status, "pre"), (0, drizzle_orm.or)((0, drizzle_orm.like)(require_dist.aluno.nome, searchTerm), (0, drizzle_orm.like)(require_dist.responsavel.nome, searchTerm), (0, drizzle_orm.like)(require_dist.matricula.protocoloLocal, searchTerm))));
		}
		return (await query).length;
	}
};
const preMatriculaRepository = new PreMatriculaRepository();

//#endregion
//#region src/application/use-cases/create-pre-matricula.use-case.ts
var CreatePreMatriculaUseCase = class {
	constructor(alunoRepository, matriculaRepository, responsavelRepository, turmaRepository, domainService) {
		this.alunoRepository = alunoRepository;
		this.matriculaRepository = matriculaRepository;
		this.responsavelRepository = responsavelRepository;
		this.turmaRepository = turmaRepository;
		this.domainService = domainService;
	}
	async execute(request) {
		this.domainService.validateAlunoData(request.aluno);
		this.domainService.validateResponsavelData(request.responsavel);
		return { matricula: await preMatriculaRepository.createPreMatricula(request) };
	}
};

//#endregion
//#region src/application/use-cases/convert-to-matricula-completa.use-case.ts
var ConvertToMatriculaCompletaUseCase = class {
	constructor(matriculaRepository, turmaRepository, domainService) {
		this.matriculaRepository = matriculaRepository;
		this.turmaRepository = turmaRepository;
		this.domainService = domainService;
	}
	async execute(request) {
		const matricula$1 = await this.matriculaRepository.findById(request.matriculaId);
		if (!matricula$1) throw new Error("Pré-matrícula não encontrada");
		if (!this.domainService.canConvertToMatriculaCompleta(matricula$1)) throw new Error("Apenas pré-matrículas podem ser convertidas");
		let turma$1 = matricula$1.turma;
		if (request.turmaId) {
			turma$1 = await this.turmaRepository.findById(request.turmaId);
			if (!turma$1) throw new Error("Turma não encontrada");
		} else if (!turma$1) {
			turma$1 = await this.turmaRepository.findBestForEtapa(matricula$1.aluno.etapa);
			if (!turma$1) throw new Error("Nenhuma turma disponível para esta etapa");
		}
		const matriculaCompleta = matricula$1.converterParaCompleta(turma$1, request.dataMatricula);
		return { matricula: await this.matriculaRepository.update(matriculaCompleta) };
	}
};

//#endregion
//#region src/application/use-cases/get-matriculas.use-case.ts
var GetMatriculasUseCase = class {
	constructor(matriculaRepository, domainService) {
		this.matriculaRepository = matriculaRepository;
		this.domainService = domainService;
	}
	async execute(request) {
		return {
			matriculas: await this.matriculaRepository.findAll({
				status: request.status,
				etapa: request.etapa,
				search: request.search,
				limit: request.limit,
				offset: request.offset
			}),
			total: await this.matriculaRepository.count({
				status: request.status,
				etapa: request.etapa,
				search: request.search
			})
		};
	}
};

//#endregion
//#region src/application/use-cases/approve-matricula.use-case.ts
var ApproveMatriculaUseCase = class {
	constructor(matriculaRepository, domainService) {
		this.matriculaRepository = matriculaRepository;
		this.domainService = domainService;
	}
	async execute(request) {
		const matricula$1 = await this.matriculaRepository.findById(request.matriculaId);
		if (!matricula$1) throw new Error("Matrícula não encontrada");
		if (!this.domainService.canApproveMatricula(matricula$1)) throw new Error("Matrícula já está aprovada");
		const matriculaAprovada = matricula$1.aprovar();
		return { matricula: await this.matriculaRepository.update(matriculaAprovada) };
	}
};

//#endregion
//#region src/application/use-cases/get-dashboard-stats.use-case.ts
var GetDashboardStatsUseCase = class {
	constructor(matriculaRepository, turmaRepository) {
		this.matriculaRepository = matriculaRepository;
		this.turmaRepository = turmaRepository;
	}
	async execute() {
		const [totalMatriculasResult, preMatriculasResult, documentosPendentesResult, vagasDisponiveisResult, matriculasCompletasResult, matriculasPendentesResult, totalAlunosResult, turmasAtivasResult] = await Promise.all([
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.matricula),
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.matricula).where((0, drizzle_orm.eq)(require_dist.matricula.status, "pre")),
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.documento).where((0, drizzle_orm.eq)(require_dist.documento.status, "pendente")),
			import_db.db.select({
				totalVagas: drizzle_orm.sql`sum(${require_dist.turma.capacidade})`,
				vagasOcupadas: drizzle_orm.sql`sum(${require_dist.turma.capacidade} - ${require_dist.turma.vagasDisponiveis})`
			}).from(require_dist.turma).where((0, drizzle_orm.eq)(require_dist.turma.ativa, true)),
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.matricula).where((0, drizzle_orm.eq)(require_dist.matricula.status, "completo")),
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.matricula).where((0, drizzle_orm.eq)(require_dist.matricula.status, "pendente_doc")),
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.aluno),
			import_db.db.select({ count: drizzle_orm.sql`count(*)` }).from(require_dist.turma).where((0, drizzle_orm.eq)(require_dist.turma.ativa, true))
		]);
		const totalMatriculas = totalMatriculasResult[0]?.count || 0;
		const preMatriculas = preMatriculasResult[0]?.count || 0;
		const documentosPendentes = documentosPendentesResult[0]?.count || 0;
		const matriculasCompletas = matriculasCompletasResult[0]?.count || 0;
		const matriculasPendentes = matriculasPendentesResult[0]?.count || 0;
		const totalAlunos = totalAlunosResult[0]?.count || 0;
		const turmasAtivas = turmasAtivasResult[0]?.count || 0;
		const vagasData = vagasDisponiveisResult[0];
		const vagasDisponiveis = (vagasData?.totalVagas || 0) - (vagasData?.vagasOcupadas || 0);
		return {
			totalMatriculas,
			preMatriculas,
			documentosPendentes,
			vagasDisponiveis: Math.max(0, vagasDisponiveis),
			matriculasCompletas,
			matriculasPendentes,
			totalAlunos,
			turmasAtivas
		};
	}
};

//#endregion
//#region src/domain/value-objects/relatorio-filtros.value-object.ts
var RelatorioFiltrosValueObject = class {
	_filtros;
	constructor(filtros) {
		this.validate(filtros);
		this._filtros = this.processPeriod(filtros);
	}
	validate(filtros) {
		if (!filtros.periodo) throw new Error("Período é obrigatório");
		if (filtros.periodo === "personalizado") {
			if (!filtros.dataInicio || !filtros.dataFim) throw new Error("Data início e fim são obrigatórias para período personalizado");
			if (filtros.dataInicio > filtros.dataFim) throw new Error("Data início deve ser anterior à data fim");
		}
		if (!filtros.campoData) throw new Error("Campo de data para filtro é obrigatório");
	}
	processPeriod(filtros) {
		const now = /* @__PURE__ */ new Date();
		const processed = { ...filtros };
		switch (filtros.periodo) {
			case "hoje":
				processed.dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				processed.dataFim = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
				break;
			case "semana_atual":
				const startOfWeek = new Date(now);
				startOfWeek.setDate(now.getDate() - now.getDay());
				startOfWeek.setHours(0, 0, 0, 0);
				processed.dataInicio = startOfWeek;
				const endOfWeek = new Date(startOfWeek);
				endOfWeek.setDate(startOfWeek.getDate() + 6);
				endOfWeek.setHours(23, 59, 59, 999);
				processed.dataFim = endOfWeek;
				break;
			case "mes_atual":
				processed.dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
				processed.dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
				break;
			case "ano_atual":
				processed.dataInicio = new Date(now.getFullYear(), 0, 1);
				processed.dataFim = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
				break;
			case "personalizado": break;
		}
		return processed;
	}
	get filtros() {
		return this._filtros;
	}
	get dataInicio() {
		return this._filtros.dataInicio;
	}
	get dataFim() {
		return this._filtros.dataFim;
	}
	get campoData() {
		return this._filtros.campoData;
	}
	get periodo() {
		return this._filtros.periodo;
	}
	get status() {
		return this._filtros.status;
	}
	get etapa() {
		return this._filtros.etapa;
	}
	get turma() {
		return this._filtros.turma;
	}
	get search() {
		return this._filtros.search;
	}
};

//#endregion
//#region src/application/use-cases/gerar-relatorio.use-case.ts
var GerarRelatorioUseCase = class {
	constructor(relatorioRepository, pdfGenerator, csvGenerator) {
		this.relatorioRepository = relatorioRepository;
		this.pdfGenerator = pdfGenerator;
		this.csvGenerator = csvGenerator;
	}
	async execute(request, usuarioId) {
		try {
			const filtrosVO = new RelatorioFiltrosValueObject({
				periodo: request.periodo,
				dataInicio: request.dataInicio,
				dataFim: request.dataFim,
				campoData: request.campoData,
				status: request.status,
				etapa: request.etapa,
				turma: request.turma,
				search: request.search
			});
			const data = await this.relatorioRepository.getReportData(request.tipo, filtrosVO.filtros);
			if (data.length > 1e3) throw new AppError(400, "Relatório muito grande. Máximo de 1000 registros permitido. Use filtros mais específicos.");
			const nomeArquivo = this.generateFileName(request.tipo, request.formato);
			let buffer;
			let contentType;
			if (request.formato === "pdf") {
				buffer = await this.pdfGenerator.generateReport(request.tipo, data, filtrosVO.filtros);
				contentType = "application/pdf";
			} else {
				buffer = await this.csvGenerator.generateReport(request.tipo, data, filtrosVO.filtros);
				contentType = "text/csv";
			}
			const relatorioId = (0, crypto.randomUUID)();
			const relatorioEntity = RelatorioEntity.create(relatorioId, request.tipo, request.formato, filtrosVO.filtros, usuarioId, nomeArquivo, buffer.length.toString());
			await this.relatorioRepository.saveMetadata(relatorioEntity);
			return {
				buffer,
				nomeArquivo,
				contentType,
				tamanhoArquivo: buffer.length
			};
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new AppError(500, "Erro interno ao gerar relatório", error instanceof Error ? error.message : "Erro desconhecido");
		}
	}
	generateFileName(tipo, formato) {
		const timestamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[:-]/g, "");
		return `relatorio_${this.getTipoNome(tipo)}_${timestamp}.${formato}`;
	}
	getTipoNome(tipo) {
		return {
			matriculas: "matriculas",
			pre_matriculas: "pre_matriculas",
			turmas: "turmas",
			documentos: "documentos",
			pendencias: "pendencias",
			geral: "geral"
		}[tipo] || tipo;
	}
};

//#endregion
//#region src/application/use-cases/listar-relatorios-gerados.use-case.ts
var ListarRelatoriosGeradosUseCase = class {
	constructor(relatorioRepository) {
		this.relatorioRepository = relatorioRepository;
	}
	async execute(request, usuarioId) {
		try {
			const [relatorios, total] = await Promise.all([this.relatorioRepository.findRecentReports(usuarioId, request.limit, request.offset), this.relatorioRepository.countReports(usuarioId)]);
			return {
				data: relatorios,
				total,
				limit: request.limit,
				offset: request.offset
			};
		} catch (error) {
			throw new AppError(500, "Erro interno ao listar relatórios", error instanceof Error ? error.message : "Erro desconhecido");
		}
	}
};

//#endregion
//#region src/adapters/web/matricula.controller.ts
var MatriculaController = class {
	constructor(createPreMatriculaUseCase, convertToMatriculaCompletaUseCase, getMatriculasUseCase, approveMatriculaUseCase) {
		this.createPreMatriculaUseCase = createPreMatriculaUseCase;
		this.convertToMatriculaCompletaUseCase = convertToMatriculaCompletaUseCase;
		this.getMatriculasUseCase = getMatriculasUseCase;
		this.approveMatriculaUseCase = approveMatriculaUseCase;
	}
	async createPreMatricula(req, res) {
		try {
			const data = {
				...req.body,
				aluno: {
					...req.body.aluno,
					dataNascimento: req.body.aluno?.dataNascimento ? new Date(req.body.aluno.dataNascimento) : void 0
				}
			};
			const result = await this.createPreMatriculaUseCase.execute(data);
			res.status(201).json({
				success: true,
				data: result.matricula,
				message: "Pré-matrícula criada com sucesso"
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Erro ao criar pré-matrícula",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
	async convertToMatriculaCompleta(req, res) {
		try {
			const { id } = req.params;
			const { turmaId, dataMatricula, documentosIniciais } = req.body;
			const result = await this.convertToMatriculaCompletaUseCase.execute({
				matriculaId: id,
				turmaId,
				dataMatricula: dataMatricula ? new Date(dataMatricula) : void 0
			});
			res.json({
				success: true,
				data: result.matricula,
				message: "Pré-matrícula convertida para matrícula completa com sucesso"
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Erro ao converter pré-matrícula",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
	async getMatriculas(req, res) {
		try {
			const { status, etapa, search, limit, offset } = req.query;
			const result = await this.getMatriculasUseCase.execute({
				status,
				etapa,
				search,
				limit: limit ? parseInt(limit) : void 0,
				offset: offset ? parseInt(offset) : void 0
			});
			res.json({
				success: true,
				data: result.matriculas,
				total: result.total
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Erro ao buscar matrículas",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
	async approveMatricula(req, res) {
		try {
			const { id } = req.params;
			const result = await this.approveMatriculaUseCase.execute({ matriculaId: id });
			res.json({
				success: true,
				data: result.matricula,
				message: "Matrícula aprovada com sucesso"
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Erro ao aprovar matrícula",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
};

//#endregion
//#region src/adapters/web/dashboard.controller.ts
var DashboardController = class {
	async getStats(req, res) {
		try {
			const stats = await container.get("getDashboardStatsUseCase").execute();
			res.json({
				success: true,
				data: stats,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
		} catch (error) {
			console.error("Erro ao buscar estatísticas do dashboard:", error);
			res.status(500).json({
				success: false,
				message: "Erro interno do servidor",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
};
const dashboardController$1 = new DashboardController();

//#endregion
//#region src/application/dto/relatorio.dto.ts
const GerarRelatorioRequestSchema = zod.z.object({
	tipo: zod.z.enum([
		"matriculas",
		"pre_matriculas",
		"turmas",
		"documentos",
		"pendencias",
		"geral"
	]),
	formato: zod.z.enum(["pdf", "csv"]),
	periodo: zod.z.enum([
		"hoje",
		"semana_atual",
		"mes_atual",
		"ano_atual",
		"personalizado"
	]),
	dataInicio: zod.z.coerce.date().optional(),
	dataFim: zod.z.coerce.date().optional(),
	campoData: zod.z.enum(["createdAt", "dataMatricula"]),
	status: zod.z.string().optional(),
	etapa: zod.z.string().optional(),
	turma: zod.z.string().optional(),
	search: zod.z.string().optional()
});
const RelatorioMetadataSchema = zod.z.object({
	id: zod.z.string(),
	tipo: zod.z.enum([
		"matriculas",
		"pre_matriculas",
		"turmas",
		"documentos",
		"pendencias",
		"geral"
	]),
	formato: zod.z.enum(["pdf", "csv"]),
	filtros: zod.z.object({
		periodo: zod.z.enum([
			"hoje",
			"semana_atual",
			"mes_atual",
			"ano_atual",
			"personalizado"
		]),
		dataInicio: zod.z.date().optional(),
		dataFim: zod.z.date().optional(),
		campoData: zod.z.enum(["createdAt", "dataMatricula"]),
		status: zod.z.string().optional(),
		etapa: zod.z.string().optional(),
		turma: zod.z.string().optional(),
		search: zod.z.string().optional()
	}),
	usuarioId: zod.z.string(),
	nomeArquivo: zod.z.string(),
	tamanhoArquivo: zod.z.string().optional(),
	createdAt: zod.z.date()
});
const FiltrosRelatorioSchema = zod.z.object({
	periodo: zod.z.enum([
		"hoje",
		"semana_atual",
		"mes_atual",
		"ano_atual",
		"personalizado"
	]),
	dataInicio: zod.z.date().optional(),
	dataFim: zod.z.date().optional(),
	campoData: zod.z.enum(["createdAt", "dataMatricula"]),
	status: zod.z.string().optional(),
	etapa: zod.z.string().optional(),
	turma: zod.z.string().optional(),
	search: zod.z.string().optional()
});
const ListarRelatoriosRequestSchema = zod.z.object({
	limit: zod.z.number().min(1).max(100).default(10),
	offset: zod.z.number().min(0).default(0)
});
const ListarRelatoriosResponseSchema = zod.z.object({
	data: zod.z.array(RelatorioMetadataSchema),
	total: zod.z.number(),
	limit: zod.z.number(),
	offset: zod.z.number()
});

//#endregion
//#region src/adapters/web/relatorio.controller.ts
var RelatorioController = class {
	constructor(gerarRelatorioUseCase, listarRelatoriosUseCase) {
		this.gerarRelatorioUseCase = gerarRelatorioUseCase;
		this.listarRelatoriosUseCase = listarRelatoriosUseCase;
	}
	async gerarRelatorio(req, res) {
		try {
			const validatedData = GerarRelatorioRequestSchema.parse(req.body);
			const usuarioId = req.user?.id;
			if (!usuarioId) throw new AppError(401, "Usuário não autenticado");
			const result = await this.gerarRelatorioUseCase.execute(validatedData, usuarioId);
			res.setHeader("Content-Type", result.contentType);
			res.setHeader("Content-Disposition", `attachment; filename="${result.nomeArquivo}"`);
			res.setHeader("Content-Length", result.tamanhoArquivo.toString());
			res.send(result.buffer);
		} catch (error) {
			if (error instanceof AppError) res.status(error.statusCode).json({
				success: false,
				message: error.message
			});
			else if (error instanceof Error && error.name === "ZodError") res.status(400).json({
				success: false,
				message: "Dados inválidos",
				errors: error.message
			});
			else res.status(500).json({
				success: false,
				message: "Erro interno do servidor",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
	async listarRelatorios(req, res) {
		try {
			const validatedData = ListarRelatoriosRequestSchema.parse({
				limit: req.query.limit ? parseInt(req.query.limit) : 10,
				offset: req.query.offset ? parseInt(req.query.offset) : 0
			});
			const usuarioId = req.user?.id;
			if (!usuarioId) throw new AppError(401, "Usuário não autenticado");
			const result = await this.listarRelatoriosUseCase.execute(validatedData, usuarioId);
			res.json({
				success: true,
				data: result
			});
		} catch (error) {
			if (error instanceof AppError) res.status(error.statusCode).json({
				success: false,
				message: error.message
			});
			else if (error instanceof Error && error.name === "ZodError") res.status(400).json({
				success: false,
				message: "Parâmetros inválidos",
				errors: error.message
			});
			else res.status(500).json({
				success: false,
				message: "Erro interno do servidor",
				error: error instanceof Error ? error.message : "Erro desconhecido"
			});
		}
	}
};

//#endregion
//#region src/infrastructure/services/pdf-generator.service.ts
var PdfGeneratorServiceImpl = class {
	async generateReport(tipo, data, filtros) {
		const doc = new pdfkit.default({
			size: "A4",
			margin: 50
		});
		const buffers = [];
		doc.on("data", buffers.push.bind(buffers));
		return new Promise((resolve, reject) => {
			doc.on("end", () => {
				resolve(Buffer.concat(buffers));
			});
			doc.on("error", reject);
			try {
				this.addHeader(doc, tipo, filtros);
				this.addContent(doc, tipo, data);
				this.addFooter(doc);
				doc.end();
			} catch (error) {
				reject(error);
			}
		});
	}
	addHeader(doc, tipo, filtros) {
		doc.fontSize(20).font("Helvetica-Bold");
		doc.text("MatriFácil", 50, 50);
		doc.fontSize(16).font("Helvetica");
		doc.text("Relatório de " + this.getTipoNome(tipo), 50, 80);
		doc.fontSize(10).font("Helvetica");
		doc.text(`Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`, 50, 100);
		if (filtros) {
			doc.text("Filtros aplicados:", 50, 120);
			let y = 140;
			if (filtros.periodo) {
				doc.text(`• Período: ${filtros.periodo}`, 70, y);
				y += 20;
			}
			if (filtros.dataInicio && filtros.dataFim) {
				doc.text(`• Data: ${filtros.dataInicio.toLocaleDateString("pt-BR")} a ${filtros.dataFim.toLocaleDateString("pt-BR")}`, 70, y);
				y += 20;
			}
			if (filtros.status && filtros.status !== "todos") {
				doc.text(`• Status: ${filtros.status}`, 70, y);
				y += 20;
			}
			if (filtros.etapa && filtros.etapa !== "todos") {
				doc.text(`• Etapa: ${filtros.etapa}`, 70, y);
				y += 20;
			}
		}
		doc.moveTo(50, 200).lineTo(550, 200).stroke();
	}
	addContent(doc, tipo, data) {
		let y = 220;
		switch (tipo) {
			case "matriculas":
				this.addMatriculasTable(doc, data, y);
				break;
			case "pre_matriculas":
				this.addMatriculasTable(doc, data, y);
				break;
			case "turmas":
				this.addTurmasTable(doc, data, y);
				break;
			case "documentos":
				this.addDocumentosTable(doc, data, y);
				break;
			case "pendencias":
				this.addPendenciasTable(doc, data, y);
				break;
			case "geral":
				this.addGeralContent(doc, data, y);
				break;
		}
	}
	addMatriculasTable(doc, data, startY) {
		if (data.length === 0) {
			doc.fontSize(12).text("Nenhuma matrícula encontrada.", 50, startY);
			return;
		}
		doc.fontSize(12).font("Helvetica-Bold");
		doc.text(`Total de registros: ${data.length}`, 50, startY);
		let y = startY + 30;
		doc.fontSize(8).font("Helvetica-Bold");
		doc.text("Protocolo", 50, y);
		doc.text("Aluno", 110, y);
		doc.text("Dt. Nasc", 180, y);
		doc.text("Etapa", 240, y);
		doc.text("Resp", 290, y);
		doc.text("CPF Resp", 350, y);
		doc.text("Status", 420, y);
		doc.text("Dt. Matr", 460, y);
		doc.text("Turma", 500, y);
		y += 12;
		doc.moveTo(50, y).lineTo(540, y).stroke();
		y += 5;
		doc.fontSize(8).font("Helvetica");
		data.forEach((item, index) => {
			if (y > 700) {
				doc.addPage();
				y = 50;
			}
			doc.text(item.protocoloLocal || "", 50, y);
			doc.text(item.aluno?.nome.substring(0, 15) || "", 110, y);
			doc.text(item.aluno?.dataNascimento ? new Date(item.aluno.dataNascimento).toLocaleDateString("pt-BR") : "", 180, y);
			doc.text(item.aluno?.etapa || "", 240, y);
			doc.text(item.responsavel?.nome.substring(0, 10) || "", 290, y);
			doc.text(item.responsavel?.cpf || "", 350, y);
			doc.text(item.status || "", 420, y);
			doc.text(item.dataMatricula ? new Date(item.dataMatricula).toLocaleDateString("pt-BR") : "", 460, y);
			doc.text(item.turma?.nome.substring(0, 8) || "", 500, y);
			y += 12;
			if (index < data.length - 1) {
				doc.moveTo(50, y).lineTo(540, y).stroke();
				y += 3;
			}
		});
	}
	addTurmasTable(doc, data, startY) {
		if (data.length === 0) {
			doc.fontSize(12).text("Nenhuma turma encontrada.", 50, startY);
			return;
		}
		doc.fontSize(12).font("Helvetica-Bold");
		doc.text(`Total de turmas: ${data.length}`, 50, startY);
		let y = startY + 30;
		doc.fontSize(8).font("Helvetica-Bold");
		doc.text("Nome", 50, y);
		doc.text("Etapa", 150, y);
		doc.text("Turno", 220, y);
		doc.text("Capacidade", 270, y);
		doc.text("Vagas Disp", 340, y);
		doc.text("Ano Letivo", 410, y);
		doc.text("Status", 480, y);
		doc.text("Alunos", 530, y);
		y += 12;
		doc.moveTo(50, y).lineTo(560, y).stroke();
		y += 5;
		doc.fontSize(8).font("Helvetica");
		data.forEach((item, index) => {
			if (y > 700) {
				doc.addPage();
				y = 50;
			}
			doc.text(item.nome || "", 50, y);
			doc.text(item.etapa || "", 150, y);
			doc.text(item.turno || "", 220, y);
			doc.text(item.capacidade?.toString() || "", 270, y);
			doc.text(item.vagasDisponiveis?.toString() || "", 340, y);
			doc.text(item.anoLetivo?.toString() || "", 410, y);
			doc.text(item.ativa ? "Ativa" : "Inativa", 480, y);
			doc.text(item.alunosCount?.toString() || "0", 530, y);
			y += 12;
			if (index < data.length - 1) {
				doc.moveTo(50, y).lineTo(560, y).stroke();
				y += 3;
			}
		});
	}
	addDocumentosTable(doc, data, startY) {
		if (data.length === 0) {
			doc.fontSize(12).text("Nenhum documento encontrado.", 50, startY);
			return;
		}
		doc.fontSize(12).font("Helvetica-Bold");
		doc.text(`Total de documentos: ${data.length}`, 50, startY);
		let y = startY + 30;
		doc.fontSize(8).font("Helvetica-Bold");
		doc.text("Tipo", 50, y);
		doc.text("Status", 120, y);
		doc.text("Aluno", 180, y);
		doc.text("Resp", 270, y);
		doc.text("Protocolo", 340, y);
		doc.text("Tamanho", 420, y);
		doc.text("Dt. Upload", 480, y);
		doc.text("Nome Arq", 520, y);
		y += 12;
		doc.moveTo(50, y).lineTo(560, y).stroke();
		y += 5;
		doc.fontSize(8).font("Helvetica");
		data.forEach((item, index) => {
			if (y > 700) {
				doc.addPage();
				y = 50;
			}
			doc.text(item.tipo || "", 50, y);
			doc.text(item.status || "", 120, y);
			doc.text(item.matricula?.aluno?.nome.substring(0, 12) || "", 180, y);
			doc.text(item.matricula?.responsavel?.nome.substring(0, 8) || "", 270, y);
			doc.text(item.matricula?.protocoloLocal || "", 340, y);
			doc.text(item.tamanhoArquivo ? `${item.tamanhoArquivo} bytes` : "", 420, y);
			doc.text(item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "", 480, y);
			doc.text(item.nomeArquivo.substring(0, 10) || "", 520, y);
			y += 12;
			if (index < data.length - 1) {
				doc.moveTo(50, y).lineTo(560, y).stroke();
				y += 3;
			}
		});
	}
	addPendenciasTable(doc, data, startY) {
		if (data.length === 0) {
			doc.fontSize(12).text("Nenhuma pendência encontrada.", 50, startY);
			return;
		}
		doc.fontSize(12).font("Helvetica-Bold");
		doc.text(`Total de pendências: ${data.length}`, 50, startY);
		let y = startY + 30;
		doc.fontSize(8).font("Helvetica-Bold");
		doc.text("Descrição", 50, y);
		doc.text("Status", 230, y);
		doc.text("Dt. Criação", 280, y);
		doc.text("Dt. Resol", 340, y);
		doc.text("Prazo", 400, y);
		doc.text("Aluno", 450, y);
		doc.text("Resp", 520, y);
		y += 12;
		doc.moveTo(50, y).lineTo(560, y).stroke();
		y += 5;
		doc.fontSize(8).font("Helvetica");
		data.forEach((item, index) => {
			if (y > 700) {
				doc.addPage();
				y = 50;
			}
			doc.text(item.descricao.substring(0, 30) || "", 50, y);
			doc.text(item.resolvido ? "Resolvido" : "Pendente", 230, y);
			doc.text(item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "", 280, y);
			doc.text(item.dataResolucao ? new Date(item.dataResolucao).toLocaleDateString("pt-BR") : "", 340, y);
			doc.text(item.prazo ? new Date(item.prazo).toLocaleDateString("pt-BR") : "", 400, y);
			doc.text(item.matricula?.aluno?.nome.substring(0, 10) || "", 450, y);
			doc.text(item.matricula?.responsavel?.nome.substring(0, 8) || "", 520, y);
			y += 12;
			if (index < data.length - 1) {
				doc.moveTo(50, y).lineTo(560, y).stroke();
				y += 3;
			}
		});
	}
	addGeralContent(doc, data, startY) {
		let y = startY;
		doc.fontSize(14).font("Helvetica-Bold");
		doc.text("Resumo Geral", 50, y);
		y += 30;
		doc.fontSize(12).font("Helvetica");
		doc.text(`• Total de Matrículas: ${data.resumo?.totalMatriculas || 0}`, 70, y);
		y += 20;
		doc.text(`• Total de Turmas: ${data.resumo?.totalTurmas || 0}`, 70, y);
		y += 20;
		doc.text(`• Total de Documentos: ${data.resumo?.totalDocumentos || 0}`, 70, y);
		y += 20;
		doc.text(`• Total de Pendências: ${data.resumo?.totalPendencias || 0}`, 70, y);
		y += 20;
		doc.text(`• Pendências Resolvidas: ${data.resumo?.pendenciasResolvidas || 0}`, 70, y);
		y += 20;
		doc.text(`• Pendências Pendentes: ${data.resumo?.pendenciasPendentes || 0}`, 70, y);
	}
	addFooter(doc) {
		const pageHeight = doc.page.height;
		doc.fontSize(8).font("Helvetica");
		doc.text("MatriFácil - Sistema de Gestão de Matrículas", 50, pageHeight - 30);
		doc.text(`Página ${doc.pageNumber || 1}`, 500, pageHeight - 30);
	}
	getTipoNome(tipo) {
		return {
			matriculas: "Matrículas",
			pre_matriculas: "Pré-Matrículas",
			turmas: "Turmas",
			documentos: "Documentos",
			pendencias: "Pendências",
			geral: "Geral"
		}[tipo] || tipo;
	}
};

//#endregion
//#region src/infrastructure/services/csv-generator.service.ts
var CsvGeneratorServiceImpl = class {
	async generateReport(tipo, data, filtros) {
		return new Promise((resolve, reject) => {
			const csvData = [];
			csvData.push(["Relatório de " + this.getTipoNome(tipo)]);
			csvData.push(["Gerado em: " + (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")]);
			csvData.push([]);
			if (filtros) {
				csvData.push(["Filtros aplicados:"]);
				if (filtros.periodo) csvData.push(["Período", filtros.periodo]);
				if (filtros.dataInicio && filtros.dataFim) csvData.push(["Data", `${filtros.dataInicio.toLocaleDateString("pt-BR")} a ${filtros.dataFim.toLocaleDateString("pt-BR")}`]);
				if (filtros.status && filtros.status !== "todos") csvData.push(["Status", filtros.status]);
				if (filtros.etapa && filtros.etapa !== "todos") csvData.push(["Etapa", filtros.etapa]);
				csvData.push([]);
			}
			const dataRows = this.formatDataForCsv(tipo, data);
			csvData.push(...dataRows);
			(0, csv_stringify.stringify)(csvData, {
				delimiter: ";",
				quoted: true,
				encoding: "utf8"
			}, (err, output) => {
				if (err) reject(err);
				else resolve(Buffer.from(output, "utf8"));
			});
		});
	}
	formatDataForCsv(tipo, data) {
		switch (tipo) {
			case "matriculas": return this.formatMatriculasData(data);
			case "pre_matriculas": return this.formatMatriculasData(data);
			case "turmas": return this.formatTurmasData(data);
			case "documentos": return this.formatDocumentosData(data);
			case "pendencias": return this.formatPendenciasData(data);
			case "geral": return this.formatGeralData(data);
			default: return [["Tipo de relatório não suportado"]];
		}
	}
	formatMatriculasData(data) {
		if (data.length === 0) return [["Nenhuma matrícula encontrada."]];
		const rows = [];
		rows.push([
			"Protocolo",
			"Nome do Aluno",
			"Data de Nascimento",
			"Etapa",
			"Nome do Responsável",
			"CPF",
			"Telefone",
			"Email",
			"Endereço",
			"Bairro",
			"Parentesco",
			"Autorizado Retirada",
			"Status",
			"Data da Matrícula",
			"Turma",
			"Necessidades Especiais",
			"Observações da Matrícula",
			"Data de Criação",
			"Data de Atualização"
		]);
		data.forEach((item) => {
			rows.push([
				item.protocoloLocal || "",
				item.aluno?.nome || "",
				item.aluno?.dataNascimento ? new Date(item.aluno.dataNascimento).toLocaleDateString("pt-BR") : "",
				item.aluno?.etapa || "",
				item.responsavel?.nome || "",
				item.responsavel?.cpf || "",
				item.responsavel?.telefone || "",
				item.responsavel?.email || "",
				item.responsavel?.endereco || "",
				item.responsavel?.bairro || "",
				item.responsavel?.parentesco || "",
				item.responsavel?.autorizadoRetirada ? "Sim" : "Não",
				item.status || "",
				item.dataMatricula ? new Date(item.dataMatricula).toLocaleDateString("pt-BR") : "",
				item.turma?.nome || "",
				item.aluno?.necessidadesEspeciais ? "Sim" : "Não",
				item.observacoes || "",
				item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "",
				item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : ""
			]);
		});
		return rows;
	}
	formatTurmasData(data) {
		if (data.length === 0) return [["Nenhuma turma encontrada."]];
		const rows = [];
		rows.push([
			"ID",
			"Nome",
			"Etapa",
			"Turno",
			"Capacidade",
			"Vagas Disponíveis",
			"Alunos Matriculados",
			"Ano Letivo",
			"Status",
			"Data de Criação",
			"Data de Atualização"
		]);
		data.forEach((item) => {
			rows.push([
				item.id || "",
				item.nome || "",
				item.etapa || "",
				item.turno || "",
				item.capacidade || "",
				item.vagasDisponiveis || "",
				item.alunosCount || "0",
				item.anoLetivo || "",
				item.ativa ? "Ativa" : "Inativa",
				item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "",
				item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : ""
			]);
		});
		return rows;
	}
	formatDocumentosData(data) {
		if (data.length === 0) return [["Nenhum documento encontrado."]];
		const rows = [];
		rows.push([
			"ID",
			"Tipo",
			"Status",
			"Nome do Arquivo",
			"Tamanho (bytes)",
			"Aluno",
			"Responsável",
			"Protocolo",
			"Data de Upload",
			"Data de Atualização",
			"Observações"
		]);
		data.forEach((item) => {
			rows.push([
				item.id || "",
				item.tipo || "",
				item.status || "",
				item.nomeArquivo || "",
				item.tamanhoArquivo || "",
				item.matricula?.aluno?.nome || "",
				item.matricula?.responsavel?.nome || "",
				item.matricula?.protocoloLocal || "",
				item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "",
				item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : "",
				item.observacoes || ""
			]);
		});
		return rows;
	}
	formatPendenciasData(data) {
		if (data.length === 0) return [["Nenhuma pendência encontrada."]];
		const rows = [];
		rows.push([
			"ID",
			"Descrição",
			"Status",
			"Prazo",
			"Data de Resolução",
			"Aluno",
			"Responsável",
			"Protocolo",
			"Data de Criação",
			"Data de Atualização",
			"Observações"
		]);
		data.forEach((item) => {
			rows.push([
				item.id || "",
				item.descricao || "",
				item.resolvido ? "Resolvido" : "Pendente",
				item.prazo ? new Date(item.prazo).toLocaleDateString("pt-BR") : "",
				item.dataResolucao ? new Date(item.dataResolucao).toLocaleDateString("pt-BR") : "",
				item.matricula?.aluno?.nome || "",
				item.matricula?.responsavel?.nome || "",
				item.matricula?.protocoloLocal || "",
				item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "",
				item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : "",
				item.observacoes || ""
			]);
		});
		return rows;
	}
	formatGeralData(data) {
		const rows = [];
		rows.push(["RESUMO GERAL"]);
		rows.push([]);
		rows.push(["Total de Matrículas", data.resumo?.totalMatriculas || 0]);
		rows.push(["Total de Turmas", data.resumo?.totalTurmas || 0]);
		rows.push(["Total de Documentos", data.resumo?.totalDocumentos || 0]);
		rows.push(["Total de Pendências", data.resumo?.totalPendencias || 0]);
		rows.push(["Pendências Resolvidas", data.resumo?.pendenciasResolvidas || 0]);
		rows.push(["Pendências Pendentes", data.resumo?.pendenciasPendentes || 0]);
		rows.push([]);
		if (data.matriculas?.length > 0) {
			rows.push(["MATRÍCULAS"]);
			rows.push(...this.formatMatriculasData(data.matriculas));
			rows.push([]);
		}
		if (data.turmas?.length > 0) {
			rows.push(["TURMAS"]);
			rows.push(...this.formatTurmasData(data.turmas));
			rows.push([]);
		}
		if (data.documentos?.length > 0) {
			rows.push(["DOCUMENTOS"]);
			rows.push(...this.formatDocumentosData(data.documentos));
			rows.push([]);
		}
		if (data.pendencias?.length > 0) {
			rows.push(["PENDÊNCIAS"]);
			rows.push(...this.formatPendenciasData(data.pendencias));
		}
		return rows;
	}
	getTipoNome(tipo) {
		return {
			matriculas: "Matrículas",
			pre_matriculas: "Pré-Matrículas",
			turmas: "Turmas",
			documentos: "Documentos",
			pendencias: "Pendências",
			geral: "Geral"
		}[tipo] || tipo;
	}
};

//#endregion
//#region src/infrastructure/config/container.config.ts
var Container = class Container {
	static instance;
	dependencies = /* @__PURE__ */ new Map();
	constructor() {
		this.registerDependencies();
	}
	static getInstance() {
		if (!Container.instance) Container.instance = new Container();
		return Container.instance;
	}
	registerDependencies() {
		this.dependencies.set("alunoRepository", new DrizzleAlunoRepository());
		this.dependencies.set("matriculaRepository", new DrizzleMatriculaRepository());
		this.dependencies.set("responsavelRepository", new DrizzleResponsavelRepository());
		this.dependencies.set("turmaRepository", new DrizzleTurmaRepository());
		this.dependencies.set("relatorioRepository", new DrizzleRelatorioRepository());
		this.dependencies.set("domainService", new MatriculaDomainService());
		this.dependencies.set("pdfGenerator", new PdfGeneratorServiceImpl());
		this.dependencies.set("csvGenerator", new CsvGeneratorServiceImpl());
		this.dependencies.set("createPreMatriculaUseCase", new CreatePreMatriculaUseCase(this.get("alunoRepository"), this.get("matriculaRepository"), this.get("responsavelRepository"), this.get("turmaRepository"), this.get("domainService")));
		this.dependencies.set("convertToMatriculaCompletaUseCase", new ConvertToMatriculaCompletaUseCase(this.get("matriculaRepository"), this.get("turmaRepository"), this.get("domainService")));
		this.dependencies.set("getMatriculasUseCase", new GetMatriculasUseCase(this.get("matriculaRepository"), this.get("domainService")));
		this.dependencies.set("approveMatriculaUseCase", new ApproveMatriculaUseCase(this.get("matriculaRepository"), this.get("domainService")));
		this.dependencies.set("getDashboardStatsUseCase", new GetDashboardStatsUseCase(this.get("matriculaRepository"), this.get("turmaRepository")));
		this.dependencies.set("gerarRelatorioUseCase", new GerarRelatorioUseCase(this.get("relatorioRepository"), this.get("pdfGenerator"), this.get("csvGenerator")));
		this.dependencies.set("listarRelatoriosUseCase", new ListarRelatoriosGeradosUseCase(this.get("relatorioRepository")));
		this.dependencies.set("matriculaController", new MatriculaController(this.get("createPreMatriculaUseCase"), this.get("convertToMatriculaCompletaUseCase"), this.get("getMatriculasUseCase"), this.get("approveMatriculaUseCase")));
		this.dependencies.set("dashboardController", new DashboardController());
		this.dependencies.set("relatorioController", new RelatorioController(this.get("gerarRelatorioUseCase"), this.get("listarRelatoriosUseCase")));
	}
	get(key) {
		const dependency = this.dependencies.get(key);
		if (!dependency) throw new Error(`Dependency ${key} not found`);
		return dependency;
	}
};
const container = Container.getInstance();

//#endregion
//#region src/services/pre-matricula.service.ts
var PreMatriculaService = class {
	validateCPF(cpf) {
		const cleanCPF = cpf.replace(/\D/g, "");
		if (cleanCPF.length !== 11) return false;
		if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
		let sum = 0;
		for (let i = 0; i < 9; i++) sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
		let remainder = sum * 10 % 11;
		if (remainder === 10 || remainder === 11) remainder = 0;
		if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
		sum = 0;
		for (let i = 0; i < 10; i++) sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
		remainder = sum * 10 % 11;
		if (remainder === 10 || remainder === 11) remainder = 0;
		if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
		return true;
	}
	validatePhone(phone) {
		const cleanPhone = phone.replace(/\D/g, "");
		return cleanPhone.length >= 10 && cleanPhone.length <= 11;
	}
	validateEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
	validateCreateData(data) {
		if (!data.aluno.nome || data.aluno.nome.trim().length < 2) throw new AppError(400, "Nome do aluno é obrigatório e deve ter pelo menos 2 caracteres");
		if (!data.aluno.dataNascimento) throw new AppError(400, "Data de nascimento do aluno é obrigatória");
		const age = (/* @__PURE__ */ new Date()).getFullYear() - new Date(data.aluno.dataNascimento).getFullYear();
		if (age < 0 || age > 18) throw new AppError(400, "Idade do aluno deve estar entre 0 e 18 anos");
		if (!data.aluno.etapa) throw new AppError(400, "Etapa educacional é obrigatória");
		if (!data.responsavel.nome || data.responsavel.nome.trim().length < 2) throw new AppError(400, "Nome do responsável é obrigatório e deve ter pelo menos 2 caracteres");
		if (!data.responsavel.cpf || !this.validateCPF(data.responsavel.cpf)) throw new AppError(400, "CPF do responsável é obrigatório e deve ser válido");
		if (!data.responsavel.telefone || !this.validatePhone(data.responsavel.telefone)) throw new AppError(400, "Telefone do responsável é obrigatório e deve ser válido");
		if (!data.responsavel.endereco || data.responsavel.endereco.trim().length < 5) throw new AppError(400, "Endereço do responsável é obrigatório e deve ter pelo menos 5 caracteres");
		if (!data.responsavel.bairro || data.responsavel.bairro.trim().length < 2) throw new AppError(400, "Bairro do responsável é obrigatório e deve ter pelo menos 2 caracteres");
		if (data.responsavel.email && !this.validateEmail(data.responsavel.email)) throw new AppError(400, "Email do responsável deve ser válido");
	}
	validateUpdateData(data) {
		if (data.aluno) {
			if (data.aluno.nome && data.aluno.nome.trim().length < 2) throw new AppError(400, "Nome do aluno deve ter pelo menos 2 caracteres");
			if (data.aluno.dataNascimento) {
				const age = (/* @__PURE__ */ new Date()).getFullYear() - new Date(data.aluno.dataNascimento).getFullYear();
				if (age < 0 || age > 18) throw new AppError(400, "Idade do aluno deve estar entre 0 e 18 anos");
			}
		}
		if (data.responsavel) {
			if (data.responsavel.nome && data.responsavel.nome.trim().length < 2) throw new AppError(400, "Nome do responsável deve ter pelo menos 2 caracteres");
			if (data.responsavel.cpf && !this.validateCPF(data.responsavel.cpf)) throw new AppError(400, "CPF do responsável deve ser válido");
			if (data.responsavel.telefone && !this.validatePhone(data.responsavel.telefone)) throw new AppError(400, "Telefone do responsável deve ser válido");
			if (data.responsavel.endereco && data.responsavel.endereco.trim().length < 5) throw new AppError(400, "Endereço do responsável deve ter pelo menos 5 caracteres");
			if (data.responsavel.bairro && data.responsavel.bairro.trim().length < 2) throw new AppError(400, "Bairro do responsável deve ter pelo menos 2 caracteres");
			if (data.responsavel.email && !this.validateEmail(data.responsavel.email)) throw new AppError(400, "Email do responsável deve ser válido");
		}
	}
	async createPreMatricula(data) {
		this.validateCreateData(data);
		return preMatriculaRepository.createPreMatricula(data);
	}
	async getPreMatriculas(filters = {}) {
		return {
			data: await preMatriculaRepository.findAll(filters),
			total: await preMatriculaRepository.count(filters)
		};
	}
	async getPreMatriculaById(id) {
		if (!id) throw new AppError(400, "ID da pré-matrícula é obrigatório");
		const preMatricula = await preMatriculaRepository.findById(id);
		if (!preMatricula) throw new AppError(404, "Pré-matrícula não encontrada");
		return preMatricula;
	}
	async updatePreMatricula(id, data) {
		if (!id) throw new AppError(400, "ID da pré-matrícula é obrigatório");
		this.validateUpdateData(data);
		const existing = await preMatriculaRepository.findById(id);
		if (!existing) throw new AppError(404, "Pré-matrícula não encontrada");
		if (data.responsavel?.cpf && data.responsavel.cpf !== existing.responsavel.cpf) {
			if ((await preMatriculaRepository.findAll({ search: data.responsavel.cpf })).length > 0) throw new AppError(400, "Já existe uma pré-matrícula com este CPF");
		}
		const updated = await preMatriculaRepository.updatePreMatricula(id, data);
		if (!updated) throw new AppError(404, "Pré-matrícula não encontrada");
		return updated;
	}
	async deletePreMatricula(id) {
		if (!id) throw new AppError(400, "ID da pré-matrícula é obrigatório");
		if (!await preMatriculaRepository.deletePreMatricula(id)) throw new AppError(404, "Pré-matrícula não encontrada");
	}
	async convertToMatriculaCompleta(id, turmaId, dataMatriculaOverride, documentosIniciais) {
		if (!id) throw new AppError(400, "ID da pré-matrícula é obrigatório");
		const existing = await preMatriculaRepository.findById(id);
		if (!existing) throw new AppError(404, "Pré-matrícula não encontrada");
		if (existing.status !== "pre") throw new AppError(400, "Apenas pré-matrículas podem ser convertidas");
		const converted = await preMatriculaRepository.convertToMatriculaCompleta(id, turmaId, dataMatriculaOverride, documentosIniciais);
		if (!converted) throw new AppError(404, "Pré-matrícula não encontrada");
		return converted;
	}
	async getPreMatriculasStats() {
		const allPreMatriculas = await preMatriculaRepository.findAll();
		const recentes = await preMatriculaRepository.findAll({ limit: 5 });
		const porEtapa = allPreMatriculas.reduce((acc, preMatricula) => {
			const etapa = preMatricula.aluno.etapa;
			acc[etapa] = (acc[etapa] || 0) + 1;
			return acc;
		}, {});
		return {
			total: allPreMatriculas.length,
			porEtapa,
			recentes: recentes.length
		};
	}
	async getMatriculas(filters = {}) {
		const data = await preMatriculaRepository.findAllMatriculas(filters);
		return {
			data,
			total: data.length
		};
	}
	async updateMatriculasWithTurmas() {
		await preMatriculaRepository.updateMatriculasWithTurmas();
	}
	async updateMatricula(id, data) {
		if (!id) throw new AppError(400, "ID da matrícula é obrigatório");
		if (data.alunoNome && data.alunoNome.trim().length < 2) throw new AppError(400, "Nome do aluno deve ter pelo menos 2 caracteres");
		if (data.responsavelNome && data.responsavelNome.trim().length < 2) throw new AppError(400, "Nome do responsável deve ter pelo menos 2 caracteres");
		const result = await preMatriculaRepository.updateMatricula(id, data);
		if (!result) throw new AppError(404, "Matrícula não encontrada");
		return result;
	}
	async deleteMatricula(id) {
		if (!id) throw new AppError(400, "ID da matrícula é obrigatório");
		if (!await preMatriculaRepository.deleteMatricula(id)) throw new AppError(404, "Matrícula não encontrada");
	}
	async approveMatricula(id) {
		if (!id) throw new AppError(400, "ID da matrícula é obrigatório");
		const result = await preMatriculaRepository.approveMatricula(id);
		if (!result) throw new AppError(404, "Matrícula não encontrada");
		return result;
	}
	async buscarAlunos(filters) {
		const { search, limit = 20 } = filters;
		const matriculas = await preMatriculaRepository.findAllMatriculas({
			search,
			limit
		});
		const alunosMap = /* @__PURE__ */ new Map();
		matriculas.forEach((matricula$1) => {
			if (matricula$1.aluno) {
				const alunoId = matricula$1.aluno.id;
				if (!alunosMap.has(alunoId)) alunosMap.set(alunoId, {
					id: matricula$1.aluno.id,
					nome: matricula$1.aluno.nome,
					responsavel: matricula$1.responsavel?.nome,
					protocolo: matricula$1.protocoloLocal
				});
			}
		});
		return Array.from(alunosMap.values()).slice(0, limit);
	}
};
const preMatriculaService = new PreMatriculaService();

//#endregion
//#region src/controllers/dashboard.controller.ts
const deleteMatricula = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) return res.status(400).json({
			success: false,
			message: "ID é obrigatório"
		});
		await preMatriculaService.deleteMatricula(id);
		res.json({
			success: true,
			message: "Matrícula deletada com sucesso"
		});
	} catch (error) {
		console.error("Erro ao deletar matrícula:", error);
		if (error instanceof AppError) res.status(error.statusCode).json({
			success: false,
			message: error.message
		});
		else res.status(500).json({
			success: false,
			message: "Erro ao deletar matrícula",
			error: error instanceof Error ? error.message : "Erro desconhecido"
		});
	}
};
const buscarAlunos = async (req, res) => {
	try {
		const { search, limit = 20 } = req.query;
		const result = await preMatriculaService.buscarAlunos({
			search,
			limit: parseInt(limit)
		});
		res.json({
			success: true,
			data: result,
			total: result.length
		});
	} catch (error) {
		if (error instanceof AppError) res.status(error.statusCode).json({
			success: false,
			message: error.message
		});
		else res.status(500).json({
			success: false,
			message: "Erro ao buscar alunos",
			error: error instanceof Error ? error.message : "Erro desconhecido"
		});
	}
};

//#endregion
//#region src/routes/dashboard.routes.ts
const router$3 = (0, express.Router)();
const matriculaController = container.get("matriculaController");
const dashboardController = container.get("dashboardController");
router$3.get("/api/dashboard/stats", dashboardController.getStats.bind(dashboardController));
router$3.get("/api/matriculas", matriculaController.getMatriculas.bind(matriculaController));
router$3.get("/api/pre-matriculas", matriculaController.getMatriculas.bind(matriculaController));
router$3.post("/api/pre-matriculas", matriculaController.createPreMatricula.bind(matriculaController));
router$3.post("/api/pre-matriculas/:id/converter", matriculaController.convertToMatriculaCompleta.bind(matriculaController));
router$3.post("/api/matriculas/:id/approve", matriculaController.approveMatricula.bind(matriculaController));
router$3.delete("/api/matriculas/:id", deleteMatricula);
router$3.get("/api/matriculas/buscar-alunos", buscarAlunos);
var dashboard_routes_default = router$3;

//#endregion
//#region src/routes/relatorio.routes.ts
const router$2 = (0, express.Router)();
router$2.use(authenticateToken);
const relatorioController = container.get("relatorioController");
router$2.post("/gerar", async (req, res) => {
	await relatorioController.gerarRelatorio(req, res);
});
router$2.get("/historico", async (req, res) => {
	await relatorioController.listarRelatorios(req, res);
});
var relatorio_routes_default = router$2;

//#endregion
//#region src/routes/test.routes.ts
const router$1 = (0, express.Router)();
router$1.post("/test-simple-insert", async (req, res) => {
	try {
		console.log("🧪 Testando inserção simples com SQL raw...");
		const responsavelId = v4_default();
		const idGlobal = v4_default();
		const result = await require_dist.db.execute(drizzle_orm.sql`
      INSERT INTO responsavel (
        id, id_global, nome, cpf, telefone, endereco, bairro, email
      ) VALUES (
        ${responsavelId}, ${idGlobal}, 'Teste Simples', '11122233344', '11999887766', 
        'Rua Teste Simples, 123', 'Bairro Teste Simples', 'teste@email.com'
      ) RETURNING id, nome, cpf
    `);
		console.log("✅ Inserção simples bem-sucedida:", result);
		res.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error("❌ Erro na inserção simples:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/clear-database", async (req, res) => {
	try {
		console.log("🧹 Limpando banco de dados completamente...");
		await require_dist.db.execute(drizzle_orm.sql`DELETE FROM documento`);
		await require_dist.db.execute(drizzle_orm.sql`DELETE FROM matricula`);
		await require_dist.db.execute(drizzle_orm.sql`DELETE FROM aluno`);
		await require_dist.db.execute(drizzle_orm.sql`DELETE FROM responsavel`);
		await require_dist.db.execute(drizzle_orm.sql`DELETE FROM turma`);
		console.log("✅ Banco de dados limpo com sucesso!");
		res.json({
			success: true,
			message: "Banco de dados limpo completamente"
		});
	} catch (error) {
		console.error("❌ Erro ao limpar banco:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.get("/check-cpf/:cpf", async (req, res) => {
	try {
		const { cpf } = req.params;
		console.log(`🔍 Verificando CPF: ${cpf}`);
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT id, nome, cpf, created_at 
      FROM responsavel 
      WHERE cpf = ${cpf}
    `);
		console.log(`📋 CPF ${cpf} encontrado:`, result.rows);
		res.json({
			success: true,
			cpf,
			exists: result.rows.length > 0,
			data: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao verificar CPF:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.get("/check-matricula/:id", async (req, res) => {
	try {
		const { id } = req.params;
		console.log(`🔍 Verificando matrícula: ${id}`);
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT m.id, m.status, m.data_matricula, m.created_at, m.updated_at,
             a.id as aluno_id, a.status as aluno_status,
             r.id as responsavel_id, r.nome as responsavel_nome
      FROM matricula m
      LEFT JOIN aluno a ON m.aluno_id = a.id
      LEFT JOIN responsavel r ON m.responsavel_id = r.id
      WHERE m.id = ${id}
    `);
		console.log(`📋 Matrícula ${id} encontrada:`, result.rows);
		res.json({
			success: true,
			matricula: result.rows[0] || null
		});
	} catch (error) {
		console.error("❌ Erro ao verificar matrícula:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.get("/table-structure", async (req, res) => {
	try {
		console.log("🔍 Verificando estrutura da tabela responsavel...");
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'responsavel' 
      ORDER BY ordinal_position
    `);
		console.log("📋 Estrutura da tabela responsavel:", result.rows);
		res.json({
			success: true,
			structure: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao verificar estrutura:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/test-raw-insert", async (req, res) => {
	try {
		console.log("🧪 Testando inserção com SQL raw...");
		const responsavelId = v4_default();
		const idGlobal = v4_default();
		const result = await require_dist.db.execute(drizzle_orm.sql`
      INSERT INTO responsavel (
        id, id_global, nome, cpf, telefone, endereco, bairro, email, parentesco, autorizado_retirada
      ) VALUES (
        ${responsavelId}, ${idGlobal}, 'Teste Raw', '98765432100', '11999887766', 
        'Rua Teste Raw, 123', 'Bairro Teste Raw', 'teste@email.com', 'pai', true
      ) RETURNING id, nome, cpf
    `);
		console.log("✅ Inserção raw bem-sucedida:", result);
		res.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error("❌ Erro na inserção raw:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/apply-migration", async (req, res) => {
	try {
		console.log("🔄 Aplicando migração...");
		await require_dist.db.execute(drizzle_orm.sql`ALTER TABLE "aluno" ALTER COLUMN "nacionalidade" DROP DEFAULT`);
		await require_dist.db.execute(drizzle_orm.sql`ALTER TABLE "responsavel" ALTER COLUMN "nacionalidade" DROP DEFAULT`);
		console.log("✅ Migração aplicada com sucesso!");
		res.json({
			success: true,
			message: "Migração aplicada"
		});
	} catch (error) {
		console.error("❌ Erro na migração:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/test-insert", async (req, res) => {
	try {
		console.log("🧪 Testando inserção simples...");
		const [result] = await require_dist.db.insert(require_dist.responsavel).values({
			id: v4_default(),
			idGlobal: v4_default(),
			nome: "Teste",
			cpf: "11144477735",
			telefone: "11988776655",
			endereco: "Rua Teste, 123",
			bairro: "Bairro Teste",
			email: "teste@email.com",
			parentesco: "pai",
			autorizadoRetirada: true
		}).returning();
		console.log("✅ Inserção bem-sucedida:", result);
		res.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error("❌ Erro na inserção:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.get("/check-turmas", async (req, res) => {
	try {
		console.log("🔍 Verificando turmas...");
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT id, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa
      FROM turma
      ORDER BY nome
    `);
		console.log(`📋 Turmas encontradas:`, result.rows);
		res.json({
			success: true,
			turmas: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao verificar turmas:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/create-turmas", async (req, res) => {
	try {
		console.log("🏫 Criando turmas de exemplo...");
		const turmas = [
			{
				id: v4_default(),
				idGlobal: v4_default(),
				nome: "Berçário A - Manhã",
				etapa: "bercario",
				turno: "manha",
				capacidade: 15,
				vagasDisponiveis: 15,
				anoLetivo: "2025",
				ativa: true
			},
			{
				id: v4_default(),
				idGlobal: v4_default(),
				nome: "Berçário B - Tarde",
				etapa: "bercario",
				turno: "tarde",
				capacidade: 15,
				vagasDisponiveis: 15,
				anoLetivo: "2025",
				ativa: true
			},
			{
				id: v4_default(),
				idGlobal: v4_default(),
				nome: "Maternal A - Manhã",
				etapa: "maternal",
				turno: "manha",
				capacidade: 20,
				vagasDisponiveis: 20,
				anoLetivo: "2025",
				ativa: true
			},
			{
				id: v4_default(),
				idGlobal: v4_default(),
				nome: "Maternal B - Tarde",
				etapa: "maternal",
				turno: "tarde",
				capacidade: 20,
				vagasDisponiveis: 20,
				anoLetivo: "2025",
				ativa: true
			},
			{
				id: v4_default(),
				idGlobal: v4_default(),
				nome: "Pré-Escola A - Manhã",
				etapa: "pre_escola",
				turno: "manha",
				capacidade: 25,
				vagasDisponiveis: 25,
				anoLetivo: "2025",
				ativa: true
			},
			{
				id: v4_default(),
				idGlobal: v4_default(),
				nome: "Pré-Escola B - Tarde",
				etapa: "pre_escola",
				turno: "tarde",
				capacidade: 25,
				vagasDisponiveis: 25,
				anoLetivo: "2025",
				ativa: true
			}
		];
		for (const turmaData of turmas) await require_dist.db.insert(require_dist.turma).values(turmaData);
		console.log("✅ Turmas criadas com sucesso!");
		res.json({
			success: true,
			message: "Turmas criadas com sucesso",
			turmas
		});
	} catch (error) {
		console.error("❌ Erro ao criar turmas:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/assign-turmas-to-matriculas", async (req, res) => {
	try {
		console.log("🔗 Associando turmas às matrículas existentes...");
		const matriculasSemTurma = await require_dist.db.execute(drizzle_orm.sql`
      SELECT m.id, m.aluno_id, a.etapa
      FROM matricula m
      JOIN aluno a ON m.aluno_id = a.id
      WHERE m.turma_id IS NULL
    `);
		console.log(`📋 Encontradas ${matriculasSemTurma.rows.length} matrículas sem turma`);
		const turmas = await require_dist.db.execute(drizzle_orm.sql`
      SELECT id, etapa, nome, vagas_disponiveis
      FROM turma
      WHERE ativa = true
      ORDER BY etapa, nome
    `);
		const turmasPorEtapa = {};
		turmas.rows.forEach((t) => {
			if (!turmasPorEtapa[t.etapa]) turmasPorEtapa[t.etapa] = [];
			turmasPorEtapa[t.etapa].push(t);
		});
		let atualizadas = 0;
		for (const matricula$1 of matriculasSemTurma.rows) {
			const turmasDisponiveis = turmasPorEtapa[matricula$1.etapa] || [];
			if (turmasDisponiveis.length > 0) {
				const turmaEscolhida = turmasDisponiveis[0];
				await require_dist.db.execute(drizzle_orm.sql`
          UPDATE matricula 
          SET turma_id = ${turmaEscolhida.id}
          WHERE id = ${matricula$1.id}
        `);
				await require_dist.db.execute(drizzle_orm.sql`
          UPDATE turma 
          SET vagas_disponiveis = vagas_disponiveis - 1
          WHERE id = ${turmaEscolhida.id}
        `);
				atualizadas++;
				console.log(`✅ Matrícula ${matricula$1.id} associada à turma ${turmaEscolhida.nome}`);
			}
		}
		console.log(`✅ ${atualizadas} matrículas atualizadas com turmas`);
		res.json({
			success: true,
			message: `${atualizadas} matrículas atualizadas com turmas`,
			atualizadas
		});
	} catch (error) {
		console.error("❌ Erro ao associar turmas:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.get("/test-relatorio-matriculas", async (req, res) => {
	try {
		console.log("📊 Testando relatório de matrículas...");
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT 
        m.id,
        m.protocolo_local,
        m.status,
        m.data_matricula,
        m.observacoes,
        m.created_at,
        a.nome as aluno_nome,
        a.data_nascimento,
        a.etapa,
        a.necessidades_especiais,
        r.nome as responsavel_nome,
        r.cpf,
        r.telefone,
        r.email,
        t.nome as turma_nome,
        t.etapa as turma_etapa,
        t.turno
      FROM matricula m
      INNER JOIN aluno a ON m.aluno_id = a.id
      INNER JOIN responsavel r ON m.responsavel_id = r.id
      LEFT JOIN turma t ON m.turma_id = t.id
      ORDER BY m.created_at DESC
    `);
		console.log(`📋 Encontradas ${result.rows.length} matrículas para relatório`);
		res.json({
			success: true,
			count: result.rows.length,
			matriculas: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao testar relatório:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/test-relatorio-gerar", async (req, res) => {
	try {
		console.log("📊 Testando geração de relatório sem autenticação...");
		const { tipo = "matriculas", formato = "csv" } = req.body;
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT 
        m.id,
        m.protocolo_local,
        m.status,
        m.data_matricula,
        m.observacoes,
        m.created_at,
        a.nome as aluno_nome,
        a.data_nascimento,
        a.etapa,
        a.necessidades_especiais,
        r.nome as responsavel_nome,
        r.cpf,
        r.telefone,
        r.email,
        t.nome as turma_nome,
        t.etapa as turma_etapa,
        t.turno
      FROM matricula m
      INNER JOIN aluno a ON m.aluno_id = a.id
      INNER JOIN responsavel r ON m.responsavel_id = r.id
      LEFT JOIN turma t ON m.turma_id = t.id
      ORDER BY m.created_at DESC
    `);
		console.log(`📋 Encontradas ${result.rows.length} matrículas para relatório`);
		if (formato === "csv") {
			const csvContent = [[
				"ID",
				"Protocolo",
				"Status",
				"Data Matrícula",
				"Aluno",
				"Etapa",
				"Responsável",
				"CPF",
				"Telefone",
				"Email",
				"Turma",
				"Turno"
			].join(","), ...result.rows.map((row) => [
				row.id,
				row.protocolo_local,
				row.status,
				row.data_matricula || "",
				`"${row.aluno_nome}"`,
				row.etapa,
				`"${row.responsavel_nome}"`,
				row.cpf,
				row.telefone,
				row.email || "",
				`"${row.turma_nome || ""}"`,
				row.turno || ""
			].join(","))].join("\n");
			const buffer = Buffer.from(csvContent, "utf-8");
			res.setHeader("Content-Type", "text/csv");
			res.setHeader("Content-Disposition", `attachment; filename="relatorio_matriculas_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`);
			res.send(buffer);
		} else res.json({
			success: true,
			count: result.rows.length,
			matriculas: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao gerar relatório:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.get("/test-relatorio-turmas", async (req, res) => {
	try {
		console.log("📊 Testando relatório por turmas...");
		const { search = "" } = req.query;
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT 
        t.id,
        t.nome,
        t.etapa,
        t.turno,
        t.capacidade,
        t.vagas_disponiveis,
        t.ano_letivo,
        t.ativa,
        COUNT(m.id) as total_matriculas,
        COUNT(CASE WHEN m.status = 'completo' THEN 1 END) as matriculas_completas,
        COUNT(CASE WHEN m.status = 'pre' THEN 1 END) as pre_matriculas
      FROM turma t
      LEFT JOIN matricula m ON t.id = m.turma_id
      WHERE t.ativa = true
        AND (${search} = '' OR t.nome ILIKE ${`%${search}%`})
      GROUP BY t.id, t.nome, t.etapa, t.turno, t.capacidade, t.vagas_disponiveis, t.ano_letivo, t.ativa
      ORDER BY t.nome
    `);
		console.log(`📋 Encontradas ${result.rows.length} turmas para relatório`);
		res.json({
			success: true,
			count: result.rows.length,
			turmas: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao testar relatório de turmas:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
router$1.post("/test-relatorio-turmas-gerar", async (req, res) => {
	try {
		console.log("📊 Testando geração de relatório por turmas...");
		const { formato = "csv", search = "" } = req.body;
		const result = await require_dist.db.execute(drizzle_orm.sql`
      SELECT 
        t.id,
        t.nome,
        t.etapa,
        t.turno,
        t.capacidade,
        t.vagas_disponiveis,
        t.ano_letivo,
        t.ativa,
        COUNT(m.id) as total_matriculas,
        COUNT(CASE WHEN m.status = 'completo' THEN 1 END) as matriculas_completas,
        COUNT(CASE WHEN m.status = 'pre' THEN 1 END) as pre_matriculas
      FROM turma t
      LEFT JOIN matricula m ON t.id = m.turma_id
      WHERE t.ativa = true
      GROUP BY t.id, t.nome, t.etapa, t.turno, t.capacidade, t.vagas_disponiveis, t.ano_letivo, t.ativa
      ORDER BY t.nome
    `);
		console.log(`📋 Encontradas ${result.rows.length} turmas para relatório`);
		if (formato === "csv") {
			const csvContent = [[
				"Nome da Turma",
				"Etapa",
				"Turno",
				"Capacidade",
				"Vagas Disponíveis",
				"Total Matrículas",
				"Matrículas Completas",
				"Pré-Matrículas",
				"Percentual Ocupação",
				"Ano Letivo",
				"Status"
			].join(","), ...result.rows.map((row) => {
				const percentualOcupacao = row.capacidade > 0 ? Math.round(row.matriculas_completas / row.capacidade * 100 * 100) / 100 : 0;
				return [
					`"${row.nome}"`,
					row.etapa,
					row.turno,
					row.capacidade,
					row.vagas_disponiveis,
					row.total_matriculas,
					row.matriculas_completas,
					row.pre_matriculas,
					`${percentualOcupacao}%`,
					row.ano_letivo,
					row.ativa ? "Ativa" : "Inativa"
				].join(",");
			})].join("\n");
			const buffer = Buffer.from(csvContent, "utf-8");
			res.setHeader("Content-Type", "text/csv");
			res.setHeader("Content-Disposition", `attachment; filename="relatorio_turmas_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`);
			res.send(buffer);
		} else res.json({
			success: true,
			count: result.rows.length,
			turmas: result.rows
		});
	} catch (error) {
		console.error("❌ Erro ao gerar relatório de turmas:", error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});
var test_routes_default = router$1;

//#endregion
//#region src/routes/index.ts
const router = (0, express.Router)();
router.use("/health", health_routes_default);
router.use("/api/auth", auth_routes_default);
router.use("/", dashboard_routes_default);
router.use("/api/relatorios", relatorio_routes_default);
router.use("/api/test", test_routes_default);
var routes_default = router;

//#endregion
//#region src/app.ts
function createApp() {
	const app = (0, express.default)();
	app.use(corsMiddleware);
	app.use(express.default.json());
	app.use(express.default.urlencoded({ extended: true }));
	app.use((0, cookie_parser.default)());
	if (process.env.NODE_ENV === "development") app.use((req, _res, next) => {
		console.log(`${req.method} ${req.path}`);
		next();
	});
	app.use(routes_default);
	app.use(notFoundHandler);
	app.use(errorHandler);
	return app;
}

//#endregion
//#region src/index.ts
async function startServer() {
	try {
		console.log("🚀 Iniciando servidor MatriFácil...\n");
		await (0, import_db.initializeDatabase)();
		const app = createApp();
		const port = parseInt(env.PORT);
		app.listen(port, () => {
			console.log(`\n✅ Servidor rodando com sucesso!`);
			console.log(`📍 URL: http://localhost:${port}`);
			console.log(`🏥 Health check: http://localhost:${port}/health`);
			console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
			console.log(`\nPressione CTRL+C para parar o servidor\n`);
		});
	} catch (error) {
		console.error("❌ Erro ao iniciar o servidor:", error);
		process.exit(1);
	}
}
process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	process.exit(1);
});
process.on("uncaughtException", (error) => {
	console.error("❌ Uncaught Exception:", error);
	process.exit(1);
});
process.on("SIGTERM", () => {
	console.log("\n🛑 SIGTERM recebido. Encerrando servidor graciosamente...");
	process.exit(0);
});
process.on("SIGINT", () => {
	console.log("\n\n🛑 SIGINT recebido. Encerrando servidor...");
	process.exit(0);
});
startServer();

//#endregion