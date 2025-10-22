export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "MatriFácil API",
    version: "1.0.0",
    description: "API completa para gerenciamento de matrículas escolares",
    contact: {
      name: "MatriFácil Team",
      email: "support@matrifacil.com"
    }
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Servidor de desenvolvimento"
    },
    {
      url: "https://api.matrifacil.com",
      description: "Servidor de produção"
    }
  ],
  tags: [
    { name: "Health", description: "Endpoints de verificação de saúde do serviço" },
    { name: "Auth", description: "Autenticação e gerenciamento de sessões" },
    { name: "Dashboard", description: "Estatísticas e dados do painel" },
    { name: "Matrículas", description: "Gerenciamento de matrículas" },
    { name: "Relatórios", description: "Geração e listagem de relatórios" },
    { name: "Test", description: "Endpoints de teste (apenas desenvolvimento)" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verificação completa de saúde",
        description: "Retorna o status completo do serviço incluindo conexão com banco de dados",
        responses: {
          "200": {
            description: "Serviço operacional",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    timestamp: { type: "string", format: "date-time" },
                    database: { type: "string", example: "connected" },
                    uptime: { type: "number", example: 12345 }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/health/readiness": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe",
        description: "Verifica se o serviço está pronto para receber tráfego",
        responses: {
          "200": {
            description: "Serviço pronto",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ready: { type: "boolean", example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/health/liveness": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        description: "Verifica se o serviço está vivo",
        responses: {
          "200": {
            description: "Serviço vivo",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    alive: { type: "boolean", example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Registrar novo usuário",
        description: "Cria uma nova conta de usuário no sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2, example: "João Silva" },
                  email: { type: "string", format: "email", example: "joao@example.com" },
                  password: { type: "string", minLength: 8, example: "senha@123" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Usuário criado com sucesso" },
                    data: {
                      type: "object",
                      properties: {
                        user: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            name: { type: "string" },
                            email: { type: "string" }
                          }
                        },
                        token: { type: "string" },
                        expiresAt: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autenticar usuário",
        description: "Realiza login e retorna token de autenticação",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "joao@example.com" },
                  password: { type: "string", example: "senha@123" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Login realizado com sucesso" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string" },
                        expiresAt: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Desautenticar usuário",
        description: "Realiza logout e invalida o token atual",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Logout realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Logout realizado com sucesso" }
                  }
                }
              }
            }
          },
          "401": {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Obter sessão atual",
        description: "Retorna informações da sessão ativa",
        responses: {
          "200": {
            description: "Sessão obtida com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        expiresAt: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Token não fornecido ou inválido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obter usuário autenticado",
        description: "Retorna informações do usuário logado",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Usuário obtido com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Estatísticas do dashboard",
        description: "Retorna estatísticas gerais de matrículas e alunos",
        responses: {
          "200": {
            description: "Estatísticas obtidas com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        totalMatriculas: { type: "number", example: 150 },
                        matriculasAtivas: { type: "number", example: 120 },
                        preMatriculas: { type: "number", example: 30 },
                        totalAlunos: { type: "number", example: 145 },
                        totalTurmas: { type: "number", example: 8 }
                      }
                    },
                    timestamp: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/matriculas": {
      get: {
        tags: ["Matrículas"],
        summary: "Listar matrículas",
        description: "Retorna lista de matrículas com filtros opcionais",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["pendente", "aprovada", "cancelada"] },
            description: "Filtrar por status"
          },
          {
            name: "etapa",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por etapa escolar"
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Buscar por nome do aluno"
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Limite de resultados"
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", default: 0 },
            description: "Offset para paginação"
          }
        ],
        responses: {
          "200": {
            description: "Lista de matrículas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Matricula" }
                    },
                    total: { type: "number", example: 150 }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/matriculas/{id}": {
      delete: {
        tags: ["Matrículas"],
        summary: "Deletar matrícula",
        description: "Remove uma matrícula do sistema",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "ID da matrícula"
          }
        ],
        responses: {
          "200": {
            description: "Matrícula deletada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Matrícula deletada com sucesso" }
                  }
                }
              }
            }
          },
          "404": {
            description: "Matrícula não encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/matriculas/{id}/approve": {
      post: {
        tags: ["Matrículas"],
        summary: "Aprovar matrícula",
        description: "Aprova uma matrícula e associa a uma turma",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "ID da matrícula"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["turmaId"],
                properties: {
                  turmaId: { type: "string", format: "uuid", description: "ID da turma" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Matrícula aprovada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Matrícula aprovada com sucesso" },
                    data: { $ref: "#/components/schemas/Matricula" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Erro ao aprovar matrícula",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          "404": {
            description: "Matrícula não encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/matriculas/buscar-alunos": {
      get: {
        tags: ["Matrículas"],
        summary: "Buscar alunos",
        description: "Busca alunos por nome ou CPF",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Termo de busca"
          }
        ],
        responses: {
          "200": {
            description: "Alunos encontrados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Aluno" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/turmas": {
      get: {
        tags: ["Matrículas"],
        summary: "Listar turmas",
        description: "Retorna lista de todas as turmas disponíveis",
        responses: {
          "200": {
            description: "Lista de turmas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Turma" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/pre-matriculas": {
      get: {
        tags: ["Matrículas"],
        summary: "Listar pré-matrículas",
        description: "Retorna lista de pré-matrículas",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por status"
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Limite de resultados"
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", default: 0 },
            description: "Offset para paginação"
          }
        ],
        responses: {
          "200": {
            description: "Lista de pré-matrículas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Matricula" }
                    },
                    total: { type: "number" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Matrículas"],
        summary: "Criar pré-matrícula",
        description: "Cria uma nova pré-matrícula no sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePreMatricula" }
            }
          }
        },
        responses: {
          "201": {
            description: "Pré-matrícula criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Pré-matrícula criada com sucesso" },
                    data: { $ref: "#/components/schemas/Matricula" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/pre-matriculas/{id}/converter": {
      post: {
        tags: ["Matrículas"],
        summary: "Converter pré-matrícula",
        description: "Converte uma pré-matrícula em matrícula completa",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "ID da pré-matrícula"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["turmaId"],
                properties: {
                  turmaId: { type: "string", format: "uuid" },
                  dataMatricula: { type: "string", format: "date" },
                  documentosIniciais: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Pré-matrícula convertida com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Pré-matrícula convertida para matrícula completa com sucesso" },
                    data: { $ref: "#/components/schemas/Matricula" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Erro ao converter pré-matrícula",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          "404": {
            description: "Pré-matrícula não encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/relatorios/gerar": {
      post: {
        tags: ["Relatórios"],
        summary: "Gerar relatório",
        description: "Gera um novo relatório em PDF ou CSV",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tipo", "formato"],
                properties: {
                  tipo: {
                    type: "string",
                    enum: ["matriculas", "turmas", "alunos"],
                    description: "Tipo de relatório"
                  },
                  formato: {
                    type: "string",
                    enum: ["pdf", "csv"],
                    description: "Formato do arquivo"
                  },
                  filtros: {
                    type: "object",
                    properties: {
                      dataInicio: { type: "string", format: "date" },
                      dataFim: { type: "string", format: "date" },
                      status: { type: "string" },
                      turmaId: { type: "string", format: "uuid" }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Relatório gerado com sucesso",
            content: {
              "application/pdf": {
                schema: { type: "string", format: "binary" }
              },
              "text/csv": {
                schema: { type: "string", format: "binary" }
              }
            }
          },
          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          "401": {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/api/relatorios/historico": {
      get: {
        tags: ["Relatórios"],
        summary: "Listar histórico de relatórios",
        description: "Retorna lista de relatórios gerados anteriormente",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Limite de resultados"
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", default: 0 },
            description: "Offset para paginação"
          }
        ],
        responses: {
          "200": {
            description: "Lista de relatórios",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        relatorios: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string", format: "uuid" },
                              tipo: { type: "string" },
                              formato: { type: "string" },
                              nomeArquivo: { type: "string" },
                              tamanhoArquivo: { type: "number" },
                              criadoEm: { type: "string", format: "date-time" }
                            }
                          }
                        },
                        total: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Não autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT obtido através do endpoint de login"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Erro ao processar requisição" },
          error: { type: "string" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@example.com" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Aluno: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "Maria Silva" },
          dataNascimento: { type: "string", format: "date" },
          cpf: { type: "string", example: "12345678900" },
          rg: { type: "string" },
          etapaEnsino: { type: "string", example: "Fundamental I" },
          anoLetivo: { type: "number", example: 2024 },
          status: { type: "string", enum: ["ativo", "inativo", "transferido"] }
        }
      },
      Responsavel: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "João Silva" },
          cpf: { type: "string", example: "12345678900" },
          telefone: { type: "string", example: "11999887766" },
          email: { type: "string", format: "email" },
          endereco: { type: "string" },
          bairro: { type: "string" }
        }
      },
      Turma: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "1º Ano A" },
          etapa: { type: "string", example: "Fundamental I" },
          turno: { type: "string", enum: ["matutino", "vespertino", "noturno"] },
          vagas: { type: "number", example: 30 },
          vagasOcupadas: { type: "number", example: 25 },
          anoLetivo: { type: "number", example: 2024 },
          status: { type: "string", enum: ["ativa", "inativa"] }
        }
      },
      Matricula: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          aluno: { $ref: "#/components/schemas/Aluno" },
          responsavel: { $ref: "#/components/schemas/Responsavel" },
          turma: { $ref: "#/components/schemas/Turma" },
          status: {
            type: "string",
            enum: ["pre_matricula", "pendente", "aprovada", "cancelada"]
          },
          dataMatricula: { type: "string", format: "date" },
          documentosRecebidos: {
            type: "array",
            items: { type: "string" }
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      CreatePreMatricula: {
        type: "object",
        required: ["aluno", "responsavel"],
        properties: {
          aluno: {
            type: "object",
            required: ["nome", "dataNascimento", "etapaEnsino", "anoLetivo"],
            properties: {
              nome: { type: "string", example: "Maria Silva" },
              dataNascimento: { type: "string", format: "date" },
              cpf: { type: "string", example: "12345678900" },
              rg: { type: "string" },
              etapaEnsino: { type: "string", example: "Fundamental I" },
              anoLetivo: { type: "number", example: 2024 }
            }
          },
          responsavel: {
            type: "object",
            required: ["nome", "cpf", "telefone"],
            properties: {
              nome: { type: "string", example: "João Silva" },
              cpf: { type: "string", example: "12345678900" },
              telefone: { type: "string", example: "11999887766" },
              email: { type: "string", format: "email" },
              endereco: { type: "string" },
              bairro: { type: "string" }
            }
          }
        }
      }
    }
  }
};