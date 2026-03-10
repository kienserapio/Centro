type Stat = {
  label: string;
  value: string;
  icon?: string;
  extra: React.ReactNode;
  cardClass: string;
  iconBg?: string;
  iconColor?: string;
};

const STATS: Stat[] = [
  {
    label: "Dues Collection",
    value: "₱142.5k",
    cardClass: "bg-white border border-[#E5E7EB]",
    extra: (
      <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
        <span className="material-icons-round text-sm">trending_up</span>
        12% from last month
      </div>
    ),
  },
  {
    label: "Active Residents",
    value: "1,248",
    icon: "people_alt",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    cardClass: "bg-white border border-[#E5E7EB]",
    extra: (
      <div className="flex items-center gap-1 mt-2">
        {["bg-secondary", "bg-secondary/70", "bg-secondary/50"].map((c, i) => (
          <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
        ))}
        <div className="w-7 h-7 rounded-full border-2 border-white bg-[#F8F9FA] flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
          +24
        </div>
      </div>
    ),
  },
  {
    label: "Pending Approvals",
    value: "14",
    icon: "pending_actions",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    cardClass: "bg-white border border-[#E5E7EB]",
    extra: (
      <p className="text-xs text-[#6B7280] mt-2 italic">Requiring your attention</p>
    ),
  },
  {
    label: "YTD Revenue",
    value: "₱1.2M",
    icon: "account_balance_wallet",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    cardClass: "bg-secondary border border-secondary",
    extra: (
      <p className="text-xs text-white/60 mt-2">Fiscal year 2025</p>
    ),
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {STATS.map((stat, i) => {
        const isGreen = i === 3;
        return (
          <div
            key={stat.label}
            className={`${stat.cardClass} p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3
                  className={`text-sm font-medium ${
                    isGreen ? "text-white/80" : "text-[#6B7280]"
                  }`}
                >
                  {stat.label}
                </h3>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    isGreen ? "text-white" : "text-[#111827]"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              {stat.icon && (
                <div className={`p-2 ${stat.iconBg} rounded-lg`}>
                  <span className={`material-icons-round text-lg ${stat.iconColor}`}>
                    {stat.icon}
                  </span>
                </div>
              )}
              {i === 0 && (
                /* Donut ring for dues collection */
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background:
                        "conic-gradient(#2D5A27 0% 85%, #E5E7EB 85% 100%)",
                    }}
                  />
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-[#111827]">
                    85%
                  </div>
                </div>
              )}
            </div>
            {stat.extra}
          </div>
        );
      })}
    </div>
  );
}
