"use client";

import { useEffect, useState } from "react";

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
  onUpdate?: (schedule: GuardSchedule) => void;
}

export function GuardScheduleTable({ schedules, onDelete, onUpdate }: Props) {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, any>>({});

  useEffect(() => {
    let mounted = true;
    async function fetchGuards() {
      try {
        const res = await fetch("/api/security/guards");
        if (!res.ok) return;
        const payload = await res.json();
        if (mounted) setGuards(Array.isArray(payload?.guards) ? payload.guards : []);
      } catch (err) {
        console.error("Failed to fetch guards", err);
      }
    }
    fetchGuards();
    return () => {
      mounted = false;
    };
  }, []);

  const toManilaNow = () => {
    const now = new Date();
    const manilaMs = now.getTime() + (now.getTimezoneOffset() + 8 * 60) * 60_000;
    return new Date(manilaMs);
  };

  const manilaDateStr = (d: Date) => d.toISOString().split("T")[0];
  const manilaTimeStr = (d: Date) => d.toTimeString().slice(0,5);

  const startShift = async (schedule: GuardSchedule) => {
    try {
      const m = toManilaNow();
      const body = {
        is_active: true,
        shift_date: manilaDateStr(m),
        shift_start_time: manilaTimeStr(m),
      };
      const res = await fetch(`/api/security/guard-schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to start shift");
      const data = await res.json();
      if (data?.schedule && onUpdate) onUpdate(data.schedule);
    } catch (err) {
      console.error(err);
    }
  };

  const endShift = async (schedule: GuardSchedule) => {
    try {
      const m = toManilaNow();
      const body = {
        is_active: false,
        shift_end_time: manilaTimeStr(m),
      };
      const res = await fetch(`/api/security/guard-schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to end shift");
      const data = await res.json();
      if (data?.schedule && onUpdate) onUpdate(data.schedule);
    } catch (err) {
      console.error(err);
    }
  };

  const saveEdits = async (schedule: GuardSchedule) => {
    const edits = localEdits[schedule.id] || {};
    try {
      const res = await fetch(`/api/security/guard-schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edits),
      });
      if (!res.ok) throw new Error("Failed to save edits");
      const data = await res.json();
      if (data?.schedule && onUpdate) onUpdate(data.schedule);
      setEditingId(null);
      setLocalEdits((s) => {
        const copy = { ...s };
        delete copy[schedule.id];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (schedule: GuardSchedule) => {
    setEditingId(schedule.id);
    setLocalEdits((s) => ({
      ...s,
      [schedule.id]: {
        guard_id: schedule.guard_id,
        shift_date: schedule.shift_date,
        shift_start_time: schedule.shift_start_time,
        shift_end_time: schedule.shift_end_time,
        post_assignment: schedule.post_assignment,
        notes: schedule.notes,
      },
    }));
  };

  const cancelEditing = (id: string) => {
    setEditingId(null);
    setLocalEdits((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
  };
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
                    {editingId === schedule.id ? (
                      <select
                        value={localEdits[schedule.id]?.guard_id}
                        onChange={(e) => setLocalEdits((s) => ({ ...s, [schedule.id]: { ...s[schedule.id], guard_id: e.target.value } }))}
                        className="bg-white border border-[#E5E7EB] text-sm rounded-xl px-2 py-1"
                      >
                        {guards.map((g) => (
                          <option key={g.id} value={g.id}>{g.full_name}</option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-[#111827]">
                          {schedule.profiles?.full_name || "Unknown Guard"}
                        </p>
                        <p className="text-xs text-[#6B7280]">{schedule.profiles?.phone}</p>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingId === schedule.id ? (
                    <input
                      type="date"
                      value={localEdits[schedule.id]?.shift_date}
                      onChange={(e) => setLocalEdits((s) => ({ ...s, [schedule.id]: { ...s[schedule.id], shift_date: e.target.value } }))}
                      className="bg-white border border-[#E5E7EB] text-sm rounded-xl px-2 py-1"
                    />
                  ) : (
                    <p className="text-sm text-[#374151]">{formatDate(schedule.shift_date)}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === schedule.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={localEdits[schedule.id]?.shift_start_time}
                        onChange={(e) => setLocalEdits((s) => ({ ...s, [schedule.id]: { ...s[schedule.id], shift_start_time: e.target.value } }))}
                        className="bg-white border border-[#E5E7EB] text-sm rounded-xl px-2 py-1"
                      />
                      <span className="text-sm text-[#6B7280]">—</span>
                      <input
                        type="time"
                        value={localEdits[schedule.id]?.shift_end_time}
                        onChange={(e) => setLocalEdits((s) => ({ ...s, [schedule.id]: { ...s[schedule.id], shift_end_time: e.target.value } }))}
                        className="bg-white border border-[#E5E7EB] text-sm rounded-xl px-2 py-1"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-[#374151]">
                      {formatTime(schedule.shift_start_time)} -{" "}
                      {formatTime(schedule.shift_end_time)}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === schedule.id ? (
                    <input
                      type="text"
                      value={localEdits[schedule.id]?.post_assignment}
                      onChange={(e) => setLocalEdits((s) => ({ ...s, [schedule.id]: { ...s[schedule.id], post_assignment: e.target.value } }))}
                      className="bg-white border border-[#E5E7EB] text-sm rounded-xl px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-sm text-[#374151]">{schedule.post_assignment || "-"}</p>
                  )}
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
                  <div className="flex items-center gap-2">
                    {editingId === schedule.id ? (
                      <>
                        <button
                          onClick={() => saveEdits(schedule)}
                          className="px-2.5 py-1.5 rounded-lg bg-secondary text-white transition-colors text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEditing(schedule.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] text-[#374151] transition-colors text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(schedule)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F9FA] transition-colors text-xs font-semibold"
                        >
                          Edit
                        </button>
                        {schedule.is_active ? (
                          <button
                            onClick={() => endShift(schedule)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            End Shift
                          </button>
                        ) : (
                          <button
                            onClick={() => startShift(schedule)}
                            className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-semibold"
                          >
                            Start Shift
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(schedule.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                        >
                          <span className="material-icons-round text-sm">delete</span>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
