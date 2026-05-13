"use client";

interface Guard {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
}

interface GuardSchedule {
  id: string;
  guard_id: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  post_assignment: string;
  notes: string;
  is_active: boolean;
  profiles: Guard;
}

interface Props {
  schedules: GuardSchedule[];
  onDelete: (id: string) => void;
}

export function GuardScheduleTable({ schedules, onDelete }: Props) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                Guard Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                Shift Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                Post
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {schedule.profiles?.full_name || "Unknown Guard"}
                    </p>
                    <p className="text-xs text-[#6B7280]">{schedule.profiles?.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#374151]">{formatDate(schedule.shift_date)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#374151]">
                    {formatTime(schedule.shift_start_time)} -{" "}
                    {formatTime(schedule.shift_end_time)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#374151]">
                    {schedule.post_assignment || "-"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      schedule.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-[#F8F9FA] text-[#6B7280]"
                    }`}
                  >
                    {schedule.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onDelete(schedule.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                  >
                    <span className="material-icons-round text-sm">delete</span>
                    Delete
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
