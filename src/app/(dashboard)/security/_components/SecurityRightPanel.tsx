"use client";

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
        <div className="bg-[#F8F9FA] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E5E7EB] flex items-center justify-center shrink-0">
              <span className="material-icons-round text-[#6B7280] text-2xl">
                account_circle
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">Sgt. David Miller</p>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                Post: Main Gate A
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280]">
              Shift ends in:{" "}
              <span className="font-bold text-[#111827]">03h 12m</span>
            </p>
          </div>
        </div>
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
