import Link from "next/link";
import { Network } from "lucide-react";

const companyLinks = [
  { label: "Our Mission", href: "#" },
  { label: "How it Works", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Careers", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

const socialLinks = [
  { label: "Twitter", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-white py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Network className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-secondary tracking-tight">Centro</span>
            </div>
            <p className="text-slate-500 max-w-sm text-lg">
              Built for the Filipino Community. Elevating the standard of living through digital connectivity.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-secondary mb-6">Company</h4>
            <ul className="space-y-4 text-slate-600 font-medium">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-secondary mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-600 font-medium">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
          <p>© 2026 Centro Platform. All rights reserved.</p>
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-secondary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
