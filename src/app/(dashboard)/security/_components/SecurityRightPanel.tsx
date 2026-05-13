"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const QUICK_CONTACTS = [
  {
    label: "Police Emergency",
    icon: "local_police",
    bg: "bg-secondary/5 hover:bg-secondary/10",
    color: "text-secondary",
  },
  {
    label: "Medical Services",
    icon: "medical_information",
    bg: "bg-primary/5 hover:bg-primary/10",
    color: "text-primary",
  },
  {
    label: "Property Manager",
    icon: "apartment",
    bg: "bg-[#F8F9FA] hover:bg-[#E5E7EB]",
    color: "text-[#374151]",
  },
];

export function SecurityRightPanel() {
  const [activeGuard, setActiveGuard] = useState<{
    profile?: { id: string; full_name?: string; phone?: string };
    post_assignment?: string;
    endsInMs?: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchActive() {
      try {
        const res = await fetch("/api/security/guard-schedules");
        if (!res.ok) return;
        const payload = await res.json();
        const schedules = Array.isArray(payload?.schedules) ? payload.schedules : [];

        const nowUtc = Date.now();

        const toUtcMs = (dateStr: string, timeStr: string) => {
          const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
          const [hh, mm] = (timeStr || "00:00").split(":").map((v) => parseInt(v, 10));
          // Manila is UTC+8. Convert Manila local time to UTC by subtracting 8 hours.
          return Date.UTC(y, m - 1, d, hh - 8, mm || 0, 0);
        };

        const match = schedules.find((s: any) => {
          if (!s || !s.shift_date || !s.shift_start_time || !s.shift_end_time) return false;
          if (!s.is_active) return false;
          const start = toUtcMs(s.shift_date, s.shift_start_time);
          const end = toUtcMs(s.shift_date, s.shift_end_time);
          return nowUtc >= start && nowUtc <= end;
        });

        if (mounted && match) {
          const end = toUtcMs(match.shift_date, match.shift_end_time);
          setActiveGuard({
            profile: match.profiles,
            post_assignment: match.post_assignment,
            endsInMs: Math.max(0, end - nowUtc),
          });
        } else if (mounted) {
          setActiveGuard(null);
        }
      } catch (err) {
        console.error("Failed to fetch guard schedules for active guard", err);
      }
    }

    fetchActive();
    const iv = setInterval(fetchActive, 30_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  const formatRemaining = (ms?: number) => {
    if (!ms || ms <= 0) return "0m";
    const hrs = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  return (
    <aside className="w-72 bg-white border-l border-[#E5E7EB] p-6 flex-col gap-8 shrink-0 hidden lg:flex sticky top-0 h-screen overflow-y-auto">
      {/* Quick Contact */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">
          Quick Contact
        </p>
        <div className="space-y-2">
          {QUICK_CONTACTS.map((c) => (
            <button
              key={c.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${c.bg} ${c.color} transition-colors text-sm font-semibold`}
            >
              <span className="material-icons-round text-xl">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guard on Duty */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">
          Guard on Duty
        </p>
        <Link href="/security/guard-schedule" className="block hover:opacity-80 transition-opacity">
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#E5E7EB] flex items-center justify-center shrink-0">
                <span className="material-icons-round text-[#6B7280] text-2xl">account_circle</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">
                  {activeGuard?.profile?.full_name ?? "No guard on duty"}
                </p>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                  Post: {activeGuard?.post_assignment ?? "—"}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280]">
                Shift ends in: {" "}
                <span className="font-bold text-[#111827]">{formatRemaining(activeGuard?.endsInMs)}</span>
              </p>
            </div>
            <p className="text-[10px] text-secondary font-semibold mt-3">Click to manage schedules →</p>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">
          System Status
        </p>
        <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2.5">
          {[
            { label: "Gate Sensors", status: "Online" },
            { label: "CCTV Feed", status: "Online" },
            { label: "Panic Button", status: "Active" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">{s.label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs font-semibold text-green-600">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Reminder */}
      <div className="mt-auto">
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
          <p className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span className="material-icons-round text-base">info</span>
            Safety Reminder
          </p>
          <p className="text-[11px] text-primary/80 mt-2 leading-relaxed">
            Always confirm resident ID before allowing manual override entry for visitors.
          </p>
        </div>
      </div>
    </aside>
  );
}
