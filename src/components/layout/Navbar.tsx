"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Network } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "About Us", href: "#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 border-b transition-all duration-300",
        scrolled
          ? "sticky-nav border-slate-100 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all",
            scrolled ? "bg-secondary" : "bg-white/20 border border-white/30"
          )}>
            <Network className="text-white w-5 h-5" />
          </div>
          <span className={cn(
            "text-2xl font-bold tracking-tight transition-colors",
            scrolled ? "text-secondary" : "text-white"
          )}>Centro</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[15px] font-medium transition-colors",
                scrolled ? "text-slate-600 hover:text-secondary" : "text-white/85 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            variant={scrolled ? "outline" : "glass"}
            size="md"
            className={scrolled ? "" : "text-sm py-2 px-4"}
          >
            Admin Login
          </Button>
          <Button variant="primary" size="md">
            Join My Community
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={cn("block w-6 h-0.5 transition-all", scrolled ? "bg-secondary" : "bg-white", menuOpen && "translate-y-2 rotate-45")} />
          <span className={cn("block w-6 h-0.5 transition-all", scrolled ? "bg-secondary" : "bg-white", menuOpen && "opacity-0")} />
          <span className={cn("block w-6 h-0.5 transition-all", scrolled ? "bg-secondary" : "bg-white", menuOpen && "-translate-y-2 -rotate-45")} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-slate-600 hover:text-secondary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="md" className="w-full justify-center">
              Admin Login
            </Button>
            <Button variant="primary" size="md" className="w-full justify-center">
              Join My Community
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
