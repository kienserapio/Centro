"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <span className="material-icons-round text-white text-xl">location_city</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-[#111827]">Centro</span>
        </div>
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

      {/* User profile */}
      <div className="p-4 mt-auto">
        <div className="bg-[#F8F9FA] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
            <span className="material-icons-round text-[#6B7280]">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-[#111827]">Juan Dela Cruz</p>
            <p className="text-xs text-[#6B7280] truncate">Phase 2, Block 4</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
