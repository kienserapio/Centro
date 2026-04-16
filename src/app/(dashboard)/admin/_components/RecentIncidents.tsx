import Link from "next/link";

type IncidentType = "Security" | "Maintenance" | "Complaint";
type IncidentStatus = "In Progress" | "Resolved" | "New";

type Incident = {
  date: string;
  name: string;
  type: IncidentType;
  status: IncidentStatus;
};

const INCIDENTS: Incident[] = [
  { date: "Mar 24, 2026", name: "Ricardo Gomez", type: "Security", status: "In Progress" },
  { date: "Mar 23, 2026", name: "Elena Santos", type: "Maintenance", status: "Resolved" },
  { date: "Mar 22, 2026", name: "Antonio Luna", type: "Complaint", status: "New" },
];

const TYPE_STYLES: Record<IncidentType, string> = {
  Security: "bg-red-100 text-red-600",
  Maintenance: "bg-blue-100 text-blue-600",
  Complaint: "bg-purple-100 text-purple-600",
};

const STATUS_DOT: Record<IncidentStatus, string> = {
  "In Progress": "bg-orange-400",
  Resolved: "bg-emerald-500",
  New: "bg-slate-300",
};

export function RecentIncidents() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-[#111827]">Incident Reports</h2>
          <p className="text-xs text-[#6B7280] mt-1">Latest logged incidents in the admin directory.</p>
        </div>
        <Link href="/security/incidents" className="text-secondary text-sm font-semibold hover:underline">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA]">
              {["Date", "Resident", "Type", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {INCIDENTS.map((inc) => (
              <tr
                key={inc.name}
                className="hover:bg-[#F8F9FA] transition-colors"
              >
                <td className="px-6 py-4 text-sm whitespace-nowrap text-[#6B7280]">
                  {inc.date}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-secondary text-sm">
                        person
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#111827]">{inc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_STYLES[inc.type]}`}
                  >
                    {inc.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[inc.status]}`}
                    />
                    <span className="text-sm text-[#6B7280]">{inc.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#6B7280] hover:text-secondary transition-colors">
                    <span className="material-icons-round text-xl">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
