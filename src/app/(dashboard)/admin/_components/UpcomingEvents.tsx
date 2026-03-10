type Event = {
  month: string;
  day: string;
  title: string;
  time: string;
  location: string;
  isUpcoming: boolean;
};

const EVENTS: Event[] = [
  {
    month: "Mar",
    day: "28",
    title: "General Assembly Meeting",
    time: "5:00 PM",
    location: "Clubhouse",
    isUpcoming: true,
  },
  {
    month: "Apr",
    day: "02",
    title: "Summer Kick-off Event",
    time: "4:00 PM",
    location: "Main Gate",
    isUpcoming: false,
  },
];

export function UpcomingEvents() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-[18px] font-semibold text-[#111827] mb-4">
        Upcoming Community Events
      </h2>
      <div className="space-y-4">
        {EVENTS.map((ev) => (
          <div key={ev.title} className="flex gap-4">
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                ev.isUpcoming
                  ? "bg-secondary/10 text-secondary"
                  : "bg-[#F8F9FA] text-[#6B7280]"
              }`}
            >
              <span className="text-[10px] font-bold uppercase leading-none">
                {ev.month}
              </span>
              <span className="text-lg font-bold leading-tight">{ev.day}</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#111827]">{ev.title}</h4>
              <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                <span className="material-icons-round text-xs">schedule</span>
                {ev.time} • {ev.location}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-xl hover:bg-[#F8F9FA] transition-colors">
        View Community Calendar
      </button>
    </div>
  );
}
