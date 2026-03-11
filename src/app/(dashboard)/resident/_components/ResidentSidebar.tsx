"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarUserProfile } from "@/app/(dashboard)/_components/SidebarUserProfile";

const NAV_ITEMS = [
  { label: "Home", href: "/resident", icon: "home" },
  { label: "My Dues", href: "/resident/dues", icon: "receipt_long" },
  { label: "Announcements", href: "/resident/announcements", icon: "campaign" },
  { label: "Rules & Regs", href: "/resident/rules", icon: "gavel" },
];

export function ResidentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#E5E7EB] bg-white fixed inset-y-0 left-0 hidden md:flex flex-col z-20">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <span className="material-icons-round text-white">home_work</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-secondary">Centro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "text-secondary bg-secondary/10"
                  : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]"
              }`}
            >
              <span
                className={`material-icons-round ${
                  isActive ? "text-secondary" : "text-[#6B7280]"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SidebarUserProfile variant="resident" />
    </aside>
  );
}
