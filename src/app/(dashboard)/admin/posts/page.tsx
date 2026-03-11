"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import {
  EditAnnouncementModal,
  type AnnouncementItem,
} from "./_components/EditAnnouncementModal";

// ── Category / Priority visual config ────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  body: "",
  category: "general",
  priority: "low",
  is_pinned: false,
};

export default function PostsPage() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("[PostsPage] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ── Create ────────────────────────────────────────────────────────────

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create announcement.");
        return;
      }

      setForm({ ...EMPTY_FORM });
      setAnnouncements((prev) => [data, ...prev]);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Edit callback ─────────────────────────────────────────────────────

  function handleSaved(updated: AnnouncementItem) {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  }

  // ── Shared input styles ───────────────────────────────────────────────

  const inputClass =
    "w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition";
  const labelClass = "text-xs font-bold text-[#6B7280] uppercase tracking-wide";

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
              Announcements
            </h1>
            <p className="text-[#6B7280] mt-1">
              Create and manage community posts visible to all residents.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Create Form ─────────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
                    <span className="material-icons-round">campaign</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">New Post</h2>
                    <p className="text-xs text-[#6B7280]">Publish to all residents</p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  {submitError && (
                    <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
                      {submitError}
                    </p>
                  )}

                  <div className="space-y-1">
                    <label className={labelClass}>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                      className={inputClass}
                      placeholder="e.g. Water interruption this Friday"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Message *</label>
                    <textarea
                      name="body"
                      value={form.body}
                      onChange={handleFormChange}
                      required
                      className={inputClass}
                      placeholder="Write the full announcement here…"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelClass}>Category *</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleFormChange}
                        className={inputClass}
                      >
                        <option value="general">General</option>
                        <option value="utility">Utility</option>
                        <option value="security">Security</option>
                        <option value="meeting">Meeting</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Priority *</label>
                      <select
                        name="priority"
                        value={form.priority}
                        onChange={handleFormChange}
                        className={inputClass}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  {/* Pin toggle */}
                  <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        name="is_pinned"
                        id="is_pinned"
                        checked={form.is_pinned}
                        onChange={handleFormChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full transition-colors ${
                          form.is_pinned ? "bg-secondary" : "bg-[#E5E7EB]"
                        }`}
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.is_pinned ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#374151]">Pin this post</span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-secondary hover:bg-secondary/90 disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-[18px]">send</span>
                    {submitting ? "Publishing…" : "Publish Announcement"}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Announcements List ───────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111827]">All Posts</h2>
                <span className="text-sm text-[#6B7280]">
                  {loading ? "—" : `${announcements.length} post${announcements.length !== 1 ? "s" : ""}`}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-[#6B7280]">
                  <span className="material-icons-round animate-spin mr-2">refresh</span>
                  Loading…
                </div>
              ) : announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
                  <span className="material-icons-round text-5xl mb-3">campaign</span>
                  <p className="font-medium">No posts yet</p>
                  <p className="text-sm mt-1">Create your first announcement using the form.</p>
                </div>
              ) : (
                announcements.map((item) => {
                  const cfg = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.general;
                  const isDeleting = deletingId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 transition-all hover:shadow-md hover:border-secondary/30"
                    >
                      {/* Card top row */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}
                        >
                          <span className={`material-icons-round ${cfg.iconColor}`}>
                            {cfg.icon}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${cfg.badgeClass}`}
                            >
                              {item.category}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                                PRIORITY_CLASS[item.priority] ?? PRIORITY_CLASS.low
                              }`}
                            >
                              {item.priority}
                            </span>
                            {item.is_pinned && (
                              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700">
                                📌 Pinned
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-[#111827] mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2">
                            {item.body}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">{formatDate(item.created_at)}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Edit"
                            className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                          >
                            <span className="material-icons-round text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            title="Delete"
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <span className="material-icons-round text-[20px]">
                              {isDeleting ? "hourglass_empty" : "delete"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <AdminMobileNav />

      {editingItem && (
        <EditAnnouncementModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
