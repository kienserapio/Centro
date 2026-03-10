const ACTIONS = [
  { icon: "directions_car", label: "Guest Pass" },
  { icon: "event_available", label: "Book Venue" },
  { icon: "construction", label: "Job Request" },
  { icon: "description", label: "Permits" },
];

export function QuickActions() {
  return (
    <section className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
      <h2 className="font-semibold text-[18px] text-[#111827] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            className="p-4 rounded-xl border border-[#E5E7EB] hover:border-secondary/40 hover:bg-secondary/5 transition-all text-center"
          >
            <span className="material-icons-round text-secondary mb-2 block">
              {action.icon}
            </span>
            <p className="text-xs font-medium text-[#111827]">{action.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
