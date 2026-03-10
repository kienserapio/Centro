"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/resident", icon: "home" },
  { label: "Dues", href: "/resident/dues", icon: "receipt_long" },
  { label: "News", href: "/resident/announcements", icon: "campaign" },
  { label: "Profile", href: "/resident/profile", icon: "person" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-end py-3 px-6 z-40">
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 ${
            pathname === item.href ? "text-primary" : "text-slate-400"
          }`}
        >
          <span className="material-icons-round">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}

      {/* Emergency button — center raised */}
      <div className="relative -top-5">
        <button className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-off-white dark:border-slate-900">
          <span className="material-icons-round">emergency</span>
        </button>
      </div>

      {NAV_ITEMS.slice(2).map((item) => (
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
