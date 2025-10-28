import multer from "multer";
import type { Request } from "express";
import { AppError } from "./error.middleware.js";

// Configuração do multer para usar buffer em memória
const storage = multer.memoryStorage();

// Configuração de limites
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
};

// Filtro de tipos de arquivo permitidos
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        400,
        "Tipo de arquivo não permitido. Tipos permitidos: PDF, JPG, PNG, WEBP"
      )
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  limits,
  fileFilter,
});

// Middleware específico para upload de documentos
export const uploadDocumentMiddleware = uploadMiddleware.single("documento");

// Middleware para múltiplos documentos
export const uploadMultipleDocumentsMiddleware = uploadMiddleware.array(
  "documentos",
  10
); // Máximo 10 arquivos

// Middleware para campos específicos
export const uploadMultipleFieldsMiddleware = uploadMiddleware.fields([
  { name: "certidao", maxCount: 1 },
  { name: "rg_cpf_resp", maxCount: 1 },
  { name: "vacina", maxCount: 1 },
  { name: "residencia", maxCount: 1 },
  { name: "historico", maxCount: 1 },
  { name: "foto3x4", maxCount: 1 },
]);
