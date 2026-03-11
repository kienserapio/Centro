"use client";

import { useState, useEffect, useCallback } from "react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

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
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvp, setRsvp] = useState<Record<string, "going" | "not_going">>({});

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("[CommunityFeed] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-semibold text-[#111827]">Community Wall</h2>
        </div>
        <div className="flex items-center justify-center py-16 text-[#6B7280]">
          <span className="material-icons-round animate-spin mr-2">refresh</span>
          Loading posts…
        </div>
      </div>
    );
  }

  // Show all pinned posts + the first non-pinned post
  const pinned = posts.filter((p) => p.is_pinned);
  const nonPinned = posts.filter((p) => !p.is_pinned);
  const visiblePosts = [...pinned, ...nonPinned.slice(0, 1)];
  const hasMore = posts.length > visiblePosts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-semibold text-[#111827]">Community Wall</h2>
        <a href="/resident/announcements" className="text-sm text-secondary font-semibold hover:underline">
          View All Posts
        </a>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
          <span className="material-icons-round text-5xl mb-3">campaign</span>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Check back later for community updates.</p>
        </div>
      ) : (
        <>
        {visiblePosts.map((post) => {
          const cfg = CATEGORY_CONFIG[post.category] ?? CATEGORY_CONFIG.general;
          const myRsvp = rsvp[post.id];
          const isMeeting = post.category === "meeting";

          return (
            <article
              key={post.id}
              className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-secondary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}
                >
                  <span className={`material-icons-round ${cfg.iconColor}`}>
                    {cfg.icon}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${cfg.badgeClass}`}
                    >
                      {post.category}
                    </span>
                    {post.is_pinned && (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700">
                        📌 Pinned
                      </span>
                    )}
                    <span className="text-xs text-slate-400">• {timeAgo(post.created_at)}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{post.body}</p>

                  {isMeeting && (
                    <div className="flex gap-2 pt-3 border-t border-[#E5E7EB]">
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
        {hasMore && (
          <a
            href="/resident/announcements"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280] hover:border-secondary/40 hover:text-secondary transition-colors"
          >
            <span className="material-icons-round text-[18px]">expand_more</span>
            {posts.length - visiblePosts.length} more post{posts.length - visiblePosts.length !== 1 ? "s" : ""} — View all
          </a>
        )}
        </>
      )}
    </div>
  );
}
