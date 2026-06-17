"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Home", href: "/security", icon: "dashboard" },
  { label: "Visitors", href: "/security/visitors", icon: "group" },
  { label: "Units", href: "/security/units", icon: "domain" },
  { label: "Incidents", href: "/security/incidents", icon: "report" },
  { label: "Help", href: "/security/help", icon: "help_outline" },
];

export function SecurityMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-3 flex justify-around items-center z-40">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 ${
            pathname === item.href ? "text-secondary" : "text-[#6B7280]"
          }`}
        >
          <span className="material-icons-round text-[22px]">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
