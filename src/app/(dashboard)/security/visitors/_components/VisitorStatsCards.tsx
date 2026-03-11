"use client";

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

const STATS: StatCard[] = [
  {
    label: "Expected Today",
    value: 42,
    trend: "+5% from yesterday",
    trendClass: "text-green-600",
    trendIcon: "trending_up",
    icon: "event_upcoming",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    label: "Currently Inside",
    value: 18,
    trend: "Steady pace",
    trendClass: "text-[#6B7280]",
    trendIcon: "horizontal_rule",
    icon: "sensor_occupied",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    label: "Overdue Exit",
    value: 3,
    valueClass: "text-primary",
    trend: "Immediate check required",
    trendClass: "text-rose-600",
    trendIcon: "warning",
    icon: "timer_off",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
  },
];

export function VisitorStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-[#6B7280] font-medium">{stat.label}</p>
            <h3
              className={`text-3xl font-bold mt-1 ${stat.valueClass ?? "text-[#111827]"}`}
            >
              {stat.value}
            </h3>
            <p
              className={`text-xs font-semibold mt-2 flex items-center gap-1 ${stat.trendClass}`}
            >
              <span className="material-icons-round text-sm">{stat.trendIcon}</span>
              {stat.trend}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.iconColor}`}
          >
            <span className="material-icons-round text-2xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
