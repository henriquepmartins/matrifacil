"use client";

import React from "react";
import {
  Home,
  FileText,
  GraduationCap,
  Users,
  BarChart,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof ReturnType<typeof usePermissions>;
}

const navItems: NavItem[] = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Visão Geral",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Pré-Matrículas",
    href: "/dashboard/pre-matriculas",
    icon: FileText,
  },
  {
    title: "Matrículas",
    href: "/dashboard/matriculas",
    icon: GraduationCap,
  },
  {
    title: "Turmas",
    href: "/dashboard/turmas",
    icon: Users,
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart,
    permission: "canAccessRelatorios",
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    permission: "canAccessConfiguracoes",
  },
];

export default function AppSidebarAceternity() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const permissions = usePermissions();
  const { open } = useSidebar();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  const links = filteredNavItems.map((item) => ({
    label: item.title,
    href: item.href,
    icon: <item.icon className="h-4 w-4" />,
  }));

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
        </div>
        <div
          className={`flex flex-col transition-all duration-300 ${
            open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          <span className="text-sm font-semibold whitespace-nowrap">
            MatriFácil
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Sistema de Matrículas
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <div className="space-y-6">
          <div>
            <h3
              className={`text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 px-2 transition-all duration-300 ${
                open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Navegação
            </h3>
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                    pathname === link.href
                      ? "bg-neutral-100 dark:bg-neutral-700"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3
              className={`text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 px-2 transition-all duration-300 ${
                open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Conta
            </h3>
            <div className="space-y-1">
              <a
                href="/dashboard/perfil"
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span
                  className={`transition-all duration-300 ${
                    open
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden whitespace-nowrap"
                  }`}
                >
                  Perfil
                </span>
              </a>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors w-full text-left"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span
                  className={`transition-all duration-300 ${
                    open
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden whitespace-nowrap"
                  }`}
                >
                  {theme === "dark" ? "Claro" : "Escuro"}
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span
                  className={`transition-all duration-300 ${
                    open
                      ? "opacity-100"
                      : "opacity-0 w-0 overflow-hidden whitespace-nowrap"
                  }`}
                >
                  Sair
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-neutral-200 dark:border-neutral-700">
        <div
          className={`text-xs text-neutral-500 dark:text-neutral-400 transition-all duration-300 ${
            open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          <p className="whitespace-nowrap">Versão 1.0.0</p>
          <p className="whitespace-nowrap">Offline-First</p>
        </div>
      </div>
    </div>
  );
}
