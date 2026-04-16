"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarUserProfile } from "@/app/(dashboard)/_components/SidebarUserProfile";

const NAV_MAIN = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Residents", href: "/admin/residents", icon: "people" },
  { label: "Dues & Billing", href: "/admin/dues", icon: "payments" },
  { label: "Incident Reports", href: "/admin/incident-reports", icon: "report" },
  { label: "Roles & Permissions", href: "/admin/roles", icon: "admin_panel_settings" },
  { label: "Announcements", href: "/admin/posts", icon: "campaign" },
];

const NAV_TOOLS = [
  { label: "Settings", href: "/admin/settings", icon: "settings" },
  { label: "Help Desk", href: "/admin/help", icon: "help_outline" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#E5E7EB] bg-white fixed inset-y-0 left-0 hidden lg:flex flex-col z-20">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <span className="material-icons-round text-white">home_work</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-secondary">Centro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Main Menu
          </p>
          <div className="space-y-0.5">
            {NAV_MAIN.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]"
                  }`}
                >
                  <span
                    className={`material-icons-round text-[20px] ${
                      isActive ? "text-secondary" : "text-[#6B7280]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Admin Tools
          </p>
          <div className="space-y-0.5">
            {NAV_TOOLS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]"
                  }`}
                >
                  <span
                    className={`material-icons-round text-[20px] ${
                      isActive ? "text-secondary" : "text-[#6B7280]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <SidebarUserProfile variant="admin" />
    </aside>
  );
}
