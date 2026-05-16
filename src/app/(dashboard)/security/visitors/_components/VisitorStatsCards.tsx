"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StatCard {
  label: string;
  value: number;
  valueClass?: string;
  trend: string;
  trendClass: string;
  trendIcon: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export function VisitorStatsCards() {
  const [stats, setStats] = useState<StatCard[]>([
    { label: "Expected Today", value: 0, trend: "Loading...", trendClass: "text-[#6B7280]", trendIcon: "refresh", icon: "event_upcoming", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Currently Inside", value: 0, trend: "", trendClass: "text-[#6B7280]", trendIcon: "horizontal_rule", icon: "sensor_occupied", iconBg: "bg-blue-100", iconColor: "text-blue-500" },
    { label: "Total Today", value: 0, trend: "", trendClass: "text-[#6B7280]", trendIcon: "horizontal_rule", icon: "badge", iconBg: "bg-secondary/10", iconColor: "text-secondary" },
  ]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data } = await supabase
        .from("visitors")
        .select("time_in, time_out, created_at")
        .is("deleted_at", null)
        .gte("created_at", todayISO);

      const visitors = data ?? [];
      const totalToday = visitors.length;
      const inside = visitors.filter((v) => !v.time_out).length;
      const exited = totalToday - inside;

      setStats([
        { label: "Pre-registered", value: visitors.filter((v) => {
          const t = new Date(v.time_in).getTime();
          const c = new Date(v.created_at).getTime();
          return Math.abs(t - c) < 30_000;
        }).length, trend: `${exited} already exited`, trendClass: "text-green-600", trendIcon: "check_circle", icon: "event_upcoming", iconBg: "bg-primary/10", iconColor: "text-primary" },
        { label: "Currently Inside", value: inside, trend: inside > 0 ? "Active visitors on site" : "No visitors inside", trendClass: inside > 0 ? "text-[#6B7280]" : "text-[#6B7280]", trendIcon: inside > 0 ? "people" : "horizontal_rule", icon: "sensor_occupied", iconBg: "bg-blue-100", iconColor: "text-blue-500" },
        { label: "Total Today", value: totalToday, trend: `${exited} checked out`, trendClass: "text-[#6B7280]", trendIcon: "history", icon: "badge", iconBg: "bg-secondary/10", iconColor: "text-secondary" },
      ]);
    }

    void load();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-[#6B7280] font-medium">{stat.label}</p>
            <h3 className={`text-3xl font-bold mt-1 ${stat.valueClass ?? "text-[#111827]"}`}>
              {stat.value}
            </h3>
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${stat.trendClass}`}>
              <span className="material-icons-round text-sm">{stat.trendIcon}</span>
              {stat.trend}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.iconColor}`}>
            <span className="material-icons-round text-2xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
