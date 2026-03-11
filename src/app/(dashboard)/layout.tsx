"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Resident, admin, and security have their own full-page layouts with their own sidebars
  if (
    pathname?.startsWith("/resident") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/security")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
