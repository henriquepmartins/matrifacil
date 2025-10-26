"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {!pathname.startsWith("/dashboard") && <Header />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
