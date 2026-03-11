"use client";

import { useState } from "react";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

interface EditAnnouncementModalProps {
  item: AnnouncementItem;
  onClose: () => void;
  onSaved: (updated: AnnouncementItem) => void;
}

export function EditAnnouncementModal({
  item,
  onClose,
  onSaved,
}: EditAnnouncementModalProps) {
  const [form, setForm] = useState({
    title: item.title,
    body: item.body,
    category: item.category,
    priority: item.priority,
    is_pinned: item.is_pinned,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save changes.");
        return;
      }

      onSaved(data);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const inputClass =
    "w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition";
  const labelClass = "text-xs font-bold text-[#6B7280] uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <span className="material-icons-round">edit</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#111827]">Edit Announcement</h3>
              <p className="text-xs text-[#6B7280]">Update the post details below.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5 overflow-y-auto">
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Post title"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className={labelClass}>Message *</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Write your announcement…"
              rows={4}
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
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
                onChange={handleChange}
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Pinned toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative shrink-0">
              <input
                type="checkbox"
                name="is_pinned"
                checked={form.is_pinned}
                onChange={handleChange}
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

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-secondary hover:bg-secondary/90 disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-[18px]">save</span>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-[#6B7280] text-sm font-medium hover:text-[#111827] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
