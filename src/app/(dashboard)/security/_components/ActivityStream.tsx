"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

function timeAgo(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

async function fetchProfileName(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    return data?.full_name ?? null;
  } catch {
    return null;
  }
}

export function ActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const supabase = createClient();
      const events: Array<{ ts: string; item: ActivityItem }> = [];

      // Latest visitor registered/entered/exited
      const { data: visitors } = await supabase
        .from("visitors")
        .select("id, visitor_name, host_label, vehicle_plate, time_in, time_out, created_at, pre_registered_by, logged_by")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      for (const v of visitors ?? []) {
        const preRegName = v.pre_registered_by ? await fetchProfileName(v.pre_registered_by) : null;
        const loggedByName = v.logged_by ? await fetchProfileName(v.logged_by) : null;

        const created = new Date(v.created_at).getTime();
        const timeIn = new Date(v.time_in).getTime();
        const isWalkIn = Math.abs(timeIn - created) < 30_000;

        if (v.time_out) {
          events.push({
            ts: v.time_out,
            item: {
              id: `v-exit-${v.id}`,
              icon: "logout",
              iconBg: "bg-[#F3F4F6]",
              iconColor: "text-[#6B7280]",
              title: "Visitor Exited:",
              titleHighlight: v.visitor_name,
              meta: v.host_label ?? "Unknown host",
              metaIcon: "meeting_room",
              time: timeAgo(v.time_out),
              badge: { label: "CHECKED OUT", color: "bg-[#F3F4F6] text-[#6B7280]" },
            },
          });
        } else if (!isWalkIn) {
          events.push({
            ts: v.time_in,
            item: {
              id: `v-enter-${v.id}`,
              icon: "login",
              iconBg: "bg-green-50",
              iconColor: "text-green-600",
              title: "Visitor Entered:",
              titleHighlight: v.visitor_name,
              meta: loggedByName ?? "Checked in by guard",
              metaIcon: "badge",
              time: timeAgo(v.time_in),
              badge: { label: "CHECKED IN", color: "bg-green-50 text-green-600" },
            },
          });
        } else {
          events.push({
            ts: v.created_at,
            item: {
              id: `v-reg-${v.id}`,
              icon: "person_add",
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
              title: "Visitor Registered:",
              titleHighlight: v.visitor_name,
              meta: v.host_label ?? "Unknown host",
              metaIcon: "meeting_room",
              time: timeAgo(v.created_at),
              badge: preRegName
                ? { label: "PRE-AUTHORIZED", color: "bg-blue-50 text-blue-600" }
                : { label: "WALK-IN", color: "bg-amber-50 text-amber-600" },
            },
          });
        }
      }

      // Latest announcement
      const { data: announcements } = await supabase
        .from("announcements")
        .select("id, title, author_id, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(2);

      for (const a of announcements ?? []) {
        const authorName = a.author_id ? await fetchProfileName(a.author_id) : null;
        events.push({
          ts: a.created_at,
          item: {
            id: `ann-${a.id}`,
            icon: "campaign",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            title: "Admin Announcement:",
            titleHighlight: a.title ?? "Untitled",
            meta: authorName ?? "By admin",
            metaIcon: "person",
            time: timeAgo(a.created_at),
          },
        });
      }

      // Latest incident
      const { data: incidents } = await supabase
        .from("emergency_alerts")
        .select("id, description, status, reporter_id, created_at, updated_at")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(3);

      for (const inc of incidents ?? []) {
        const reporterName = inc.reporter_id ? await fetchProfileName(inc.reporter_id) : null;
        const isResolved = inc.status === "resolved" || inc.status === "closed";
        events.push({
          ts: inc.updated_at,
          item: {
            id: `inc-${inc.id}`,
            icon: isResolved ? "check_circle" : "report",
            iconBg: isResolved ? "bg-green-50" : "bg-red-50",
            iconColor: isResolved ? "text-green-600" : "text-red-500",
            title: isResolved ? "Incident Resolved:" : "Incident Logged:",
            titleHighlight: inc.description?.slice(0, 60) ?? "Unknown incident",
            meta: reporterName ?? "Reported by resident",
            metaIcon: "person",
            time: timeAgo(inc.updated_at),
            badge: isResolved
              ? { label: "RESOLVED", color: "bg-green-50 text-green-600" }
              : { label: inc.status?.toUpperCase() ?? "OPEN", color: "bg-red-50 text-red-500" },
          },
        });
      }

      events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

      setActivities(events.slice(0, 8).map((e) => e.item));
      setIsLoading(false);
    }

    void load();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <span className="material-icons-round text-[#6B7280]">history</span>
          Activity Stream
        </h3>
      </div>

      {isLoading ? (
        <div className="text-sm text-[#6B7280] text-center py-8">
          <span className="material-icons-round animate-spin inline-block mr-2 align-middle">refresh</span>
          Loading activity...
        </div>
      ) : activities.length === 0 ? (
        <div className="text-sm text-[#6B7280] text-center py-8">No recent activity.</div>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => (
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
      )}
    </section>
  );
}
