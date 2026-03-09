"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  roles: Array<"resident" | "admin" | "guard">;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Overview",      href: "/admin",         roles: ["admin"] },
  { label: "Dues",          href: "/admin/dues",    roles: ["admin"] },
  { label: "Announcements", href: "/admin/posts",   roles: ["admin"] },
  { label: "My Dashboard",  href: "/resident",      roles: ["resident"] },
  { label: "Security",      href: "/security",      roles: ["guard"] },
];

interface SidebarProps {
  /** The current user's role, injected from server component or context. */
  role?: "resident" | "admin" | "guard";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = role
    ? NAV_ITEMS.filter((item) => item.roles.includes(role))
    : NAV_ITEMS;

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white px-4 py-6">
      <div className="mb-8">
        <span className="text-xl font-bold tracking-tight">Centro</span>
      </div>
      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
