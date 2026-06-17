"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Home", href: "/admin", icon: "dashboard" },
  { label: "Residents", href: "/admin/residents", icon: "people" },
  { label: "Post", href: "/admin/posts", icon: "add_circle" },
  { label: "Billing", href: "/admin/dues", icon: "payments" },
  { label: "Incidents", href: "/admin/incident-reports", icon: "report" },
  { label: "Help", href: "/admin/help", icon: "help_outline" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-6 py-3 flex justify-around items-center z-40">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 ${
            pathname === item.href ? "text-secondary" : "text-[#6B7280]"
          }`}
        >
          <span className="material-icons-round">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
