"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ResidentSidebar } from "../_components/ResidentSidebar";
import { MobileNav } from "../_components/MobileNav";

// ── Types ──────────────────────────────────────────────────────────────────

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

// ── Category / Priority visual config ─────────────────────────────────────

type CategoryConfig = {
  icon: string;
  iconBg: string;
  iconColor: string;
  badgeClass: string;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  meeting: {
    icon: "groups",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    badgeClass: "bg-secondary/10 text-secondary",
  },
  general: {
    icon: "campaign",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    badgeClass: "bg-slate-100 text-slate-600",
  },
  utility: {
    icon: "build",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    badgeClass: "bg-blue-50 text-blue-600",
  },
  security: {
    icon: "shield",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700",
  },
  emergency: {
    icon: "warning",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    badgeClass: "bg-red-50 text-red-600",
  },
};

const PRIORITY_CLASS: Record<string, string> = {
  low: "bg-green-50 text-green-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  emergency: "bg-red-50 text-red-700",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Filter chips helper ────────────────────────────────────────────────────

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
        active
          ? "bg-secondary text-white shadow-sm"
          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
      }`}
    >
      {label}
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvp, setRsvp] = useState<Record<string, "going" | "not_going">>({});

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [pinnedOnly, setPinnedOnly] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("[AnnouncementsPage] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Filtering ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
      if (filterPriority !== "all" && p.priority !== filterPriority) return false;
      if (pinnedOnly && !p.is_pinned) return false;
      return true;
    });
  }, [posts, filterCategory, filterPriority, pinnedOnly]);

  // ── RSVP ─────────────────────────────────────────────────────────────────

  function toggleRsvp(id: string, choice: "going" | "not_going") {
    setRsvp((prev) => {
      if (prev[id] === choice) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: choice };
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen relative bg-white">
      <ResidentSidebar />

      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-3xl">

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
              Announcements
            </h1>
            <p className="text-[#6B7280] mt-1">
              Stay up to date with the latest community posts and notices.
            </p>
          </header>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 mb-6 space-y-3">
            {/* Category row */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Category</p>
              <div className="flex flex-wrap gap-2">
                {["all", "general", "utility", "security", "meeting", "emergency"].map((c) => (
                  <FilterChip
                    key={c}
                    label={c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                    active={filterCategory === c}
                    onClick={() => setFilterCategory(c)}
                  />
                ))}
              </div>
            </div>

            {/* Priority row */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Priority</p>
              <div className="flex flex-wrap gap-2">
                {["all", "low", "medium", "high", "emergency"].map((p) => (
                  <FilterChip
                    key={p}
                    label={p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
                    active={filterPriority === p}
                    onClick={() => setFilterPriority(p)}
                  />
                ))}
              </div>
            </div>

            {/* Pinned toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-[#F3F4F6]">
              <span className="text-sm font-medium text-[#374151]">📌 Pinned posts only</span>
              <button
                onClick={() => setPinnedOnly((v) => !v)}
                className="relative shrink-0"
                aria-pressed={pinnedOnly}
              >
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    pinnedOnly ? "bg-secondary" : "bg-[#E5E7EB]"
                  }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    pinnedOnly ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ── Results count ─────────────────────────────────────────── */}
          {!loading && (
            <p className="text-sm text-[#6B7280] mb-4">
              {filtered.length === 0
                ? "No posts match your filters."
                : `Showing ${filtered.length} post${filtered.length !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* ── Post list ─────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round animate-spin mr-2">refresh</span>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round text-5xl mb-3">search_off</span>
              <p className="font-medium">No posts found</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((post) => {
                const cfg = CATEGORY_CONFIG[post.category] ?? CATEGORY_CONFIG.general;
                const myRsvp = rsvp[post.id];
                const isMeeting = post.category === "meeting";

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 hover:shadow-md hover:border-secondary/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <span className={`material-icons-round ${cfg.iconColor}`}>
                          {cfg.icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${cfg.badgeClass}`}
                          >
                            {post.category}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                              PRIORITY_CLASS[post.priority] ?? PRIORITY_CLASS.low
                            }`}
                          >
                            {post.priority}
                          </span>
                          {post.is_pinned && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700">
                              📌 Pinned
                            </span>
                          )}
                          <span className="text-xs text-slate-400">• {timeAgo(post.created_at)}</span>
                        </div>

                        <h3 className="text-lg font-bold text-[#111827] mb-2">{post.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{post.body}</p>

                        {/* Meeting RSVP */}
                        {isMeeting && (
                          <div className="flex gap-2 pt-3 mt-2 border-t border-[#E5E7EB]">
                            <button
                              onClick={() => toggleRsvp(post.id, "going")}
                              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-medium transition-all ${
                                myRsvp === "going"
                                  ? "bg-secondary text-white shadow-sm"
                                  : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                              }`}
                            >
                              <span className="material-icons-round text-[16px]">check_circle</span>
                              I&apos;m Going
                            </button>
                            <button
                              onClick={() => toggleRsvp(post.id, "not_going")}
                              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-medium transition-all ${
                                myRsvp === "not_going"
                                  ? "bg-rose-500 text-white shadow-sm"
                                  : "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FA]"
                              }`}
                            >
                              <span className="material-icons-round text-[16px]">cancel</span>
                              Not Going
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
