"use client";

import { useAuth } from "./useAuth";

export type UserRole = "ADMIN" | "COORDENACAO" | "RECEPCAO";

export interface Permissions {
  canAccessTurmas: boolean;
  canAccessRelatorios: boolean;
  canAccessConfiguracoes: boolean;
  canCreateTurma: boolean;
  canDeleteMatricula: boolean;
  canEditMatricula: boolean;
  canViewAllMatriculas: boolean;
  canManageUsers: boolean;
}

/**
 * Hook para verificação de permissões baseado no perfil do usuário
 */
export function usePermissions(): Permissions {
  const { user } = useAuth();

  const role = user?.role as UserRole;

  return {
    // Turmas - COORDENACAO e ADMIN
    canAccessTurmas: role === "ADMIN" || role === "COORDENACAO",

    // Relatórios - COORDENACAO e ADMIN
    canAccessRelatorios: role === "ADMIN" || role === "COORDENACAO",

    // Configurações - apenas ADMIN
    canAccessConfiguracoes: role === "ADMIN",

    // Criar turma - apenas ADMIN
    canCreateTurma: role === "ADMIN",

    // Deletar matrícula - apenas ADMIN
    canDeleteMatricula: role === "ADMIN",

    // Editar matrícula - todos os perfis
    canEditMatricula: true,

    // Ver todas as matrículas - todos os perfis
    canViewAllMatriculas: true,

    // Gerenciar usuários - apenas ADMIN
    canManageUsers: role === "ADMIN",
  };
}

/**
 * Hook para verificar se o usuário tem uma permissão específica
 */
export function useHasPermission(permission: keyof Permissions): boolean {
  const permissions = usePermissions();
  return permissions[permission];
}
