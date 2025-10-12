"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import SyncIndicator from "@/components/sync-indicator";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";

function getBreadcrumbItems(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const items = [];

  items.push({
    label: "Dashboard",
    href: "/dashboard",
    isLast: segments.length === 1,
  });

  if (segments.length > 1) {
    const page = segments[1];
    const pageLabels: Record<string, string> = {
      "pre-matriculas": "Pré-Matrículas",
      matriculas: "Matrículas",
      turmas: "Turmas",
      relatorios: "Relatórios",
      configuracoes: "Configurações",
    };

    if (pageLabels[page]) {
      items.push({
        label: pageLabels[page],
        href: `/dashboard/${page}`,
        isLast: true,
      });
    }
  }

  return items;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumbItems(pathname);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sync Indicator */}
        <div className="px-4">
          <SyncIndicator />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 rounded-xl bg-background">{children}</div>
      </div>
    </SidebarInset>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
