"use client";

import { useState, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

export function UpcomingEvents() {
  const [meetings, setMeetings] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Announcement[]) =>
        setMeetings(data.filter((a) => a.category === "meeting"))
      )
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-[18px] font-semibold text-[#111827] mb-4">
        Upcoming Community Events
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-[#6B7280]">
          <span className="material-icons-round animate-spin mr-2 text-sm">refresh</span>
          <span className="text-sm">Loading…</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-[#6B7280]">
          <span className="material-icons-round text-3xl mb-1">event_busy</span>
          <p className="text-sm font-medium">No meetings posted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((ev, idx) => {
            const date = new Date(ev.created_at);
            const month = date.toLocaleString("en-PH", { month: "short" });
            const day = date.getDate().toString();
            const isFirst = idx === 0;

            return (
              <div key={ev.id} className="flex gap-4">
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                    isFirst
                      ? "bg-secondary/10 text-secondary"
                      : "bg-[#F8F9FA] text-[#6B7280]"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase leading-none">{month}</span>
                  <span className="text-lg font-bold leading-tight">{day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#111827] truncate">{ev.title}</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{ev.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <a
        href="/admin/posts"
        className="w-full mt-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-xl hover:bg-[#F8F9FA] transition-colors flex items-center justify-center gap-1"
      >
        <span className="material-icons-round text-[16px]">open_in_new</span>
        Manage All Posts
      </a>
    </div>
  );
}
