"use client";

interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  titleHighlight: string;
  meta: string;
  metaIcon: string;
  time: string;
  badge?: { label: string; color: string };
}

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "1",
    icon: "person_add",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Visitor Registered:",
    titleHighlight: "Sarah Jenkins",
    meta: "Unit 12-A · Expected arrival 14:30",
    metaIcon: "meeting_room",
    time: "2 mins ago",
    badge: { label: "PRE-AUTHORIZED", color: "bg-blue-50 text-blue-600" },
  },
  {
    id: "2",
    icon: "directions_car",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    title: "Gate Entry:",
    titleHighlight: "Toyota Fortuner (ABC-1234)",
    meta: "Main Entrance · RFID Authorized",
    metaIcon: "location_on",
    time: "12 mins ago",
    badge: { label: "RESIDENT", color: "bg-green-50 text-secondary" },
  },
  {
    id: "3",
    icon: "campaign",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Admin Announcement:",
    titleHighlight: "Water maintenance scheduled",
    meta: "Broadcast to all residents",
    metaIcon: "info",
    time: "45 mins ago",
  },
  {
    id: "4",
    icon: "description",
    iconBg: "bg-[#F8F9FA]",
    iconColor: "text-[#6B7280]",
    title: "Incident Logged:",
    titleHighlight: "Incorrect parking at Slot #402",
    meta: "Logged by Guard Garcia",
    metaIcon: "person",
    time: "1 hour ago",
    badge: { label: "PENDING REVIEW", color: "bg-[#F8F9FA] text-[#6B7280]" },
  },
];

export function ActivityStream() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <span className="material-icons-round text-[#6B7280]">history</span>
          Activity Stream
        </h3>
        <button className="text-sm font-semibold text-secondary hover:underline">
          View All History
        </button>
      </div>

      <div className="space-y-3">
        {ACTIVITY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
              >
                <span className="material-icons-round text-xl">{item.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {item.title}{" "}
                  <span className="font-normal text-[#6B7280]">{item.titleHighlight}</span>
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1.5">
                  <span className="material-icons-round text-[13px]">{item.metaIcon}</span>
                  {item.meta}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-xs font-medium text-[#6B7280]">{item.time}</p>
              {item.badge && (
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 ${item.badge.color}`}
                >
                  {item.badge.label}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
