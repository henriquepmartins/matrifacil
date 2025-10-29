"use client";

import {
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconUsers,
  IconFileText,
  IconChartBar,
  IconChevronUp,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { usePermissions, type Permissions } from "@/lib/hooks/usePermissions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Menu items
interface MenuItem {
  title: string;
  url: string;
  icon: any;
  permission?: keyof Permissions;
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconBrandTabler,
  },
  {
    title: "Pré-Matrículas",
    url: "/dashboard/pre-matriculas",
    icon: IconFileText,
  },
  {
    title: "Matrículas",
    url: "/dashboard/matriculas",
    icon: IconUsers,
  },
  {
    title: "Turmas",
    url: "/dashboard/turmas",
    icon: IconUserBolt,
  },
  {
    title: "Relatórios",
    url: "/dashboard/relatorios",
    icon: IconChartBar,
    permission: "canAccessRelatorios",
  },
  {
    title: "Configurações",
    url: "/dashboard/configuracoes",
    icon: IconSettings,
    permission: "canAccessConfiguracoes",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const permissions = usePermissions();

  // Filtrar itens baseado em permissões
  const filteredItems = items.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  // Função para obter as iniciais do nome do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para obter o cargo do usuário em português
  const getRoleLabel = (role: string) => {
    const roleLabels = {
      ADMIN: "Administrador",
      COORDENACAO: "Coordenação",
      RECEPCAO: "Recepção",
    };
    return roleLabels[role as keyof typeof roleLabels] || "Usuário";
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/images/logo.png"
                    alt="MatriFácil Logo"
                    width={24}
                    height={24}
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MatriFácil</span>
                  <span className="truncate text-xs">
                    Sistema de Matrículas
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url as any}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {isLoading ? (
                      <div className="h-4 w-4 animate-pulse rounded bg-white/50" />
                    ) : user ? (
                      <span className="text-sm font-medium">
                        {getUserInitials(user.name)}
                      </span>
                    ) : (
                      <span className="text-sm font-medium">?</span>
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {isLoading ? (
                      <>
                        <div className="h-4 w-24 animate-pulse rounded bg-sidebar-accent/50" />
                        <div className="h-3 w-16 animate-pulse rounded bg-sidebar-accent/50" />
                      </>
                    ) : user ? (
                      <>
                        <span className="truncate font-semibold">
                          {user.name}
                        </span>
                        <span className="truncate text-xs">
                          {getRoleLabel(user.role)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="truncate font-semibold">
                          Usuário não logado
                        </span>
                        <span className="truncate text-xs">
                          Faça login para continuar
                        </span>
                      </>
                    )}
                  </div>
                  <IconChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <IconUser className="mr-2 size-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <IconSettings className="mr-2 size-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <IconLogout className="mr-2 size-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
