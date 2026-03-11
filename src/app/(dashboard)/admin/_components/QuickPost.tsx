"use client";

import { useState } from "react";

const EMPTY = { title: "", body: "", category: "general", priority: "low" };

export function QuickPost() {
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_pinned: false }),
      });

      if (res.ok) {
        setForm({ ...EMPTY });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to publish.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-[#F8F9FA] border border-transparent rounded-xl text-sm px-3 py-2.5 text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all";

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-[18px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
        <span className="material-icons-round text-secondary">campaign</span>
        Quick Post
      </h2>

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl mb-4">
          <span className="material-icons-round text-[18px]">check_circle</span>
          Post published successfully!
        </div>
      )}
      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl mb-4">
          {error}
        </p>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Scheduled Water Interruption"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wider">
            Message
          </label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows={3}
            placeholder="Write your community update here..."
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wider">
              Category
            </label>
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
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wider">
              Priority
            </label>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-secondary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? "Publishing…" : "Publish Post"}
          {!submitting && <span className="material-icons-round text-sm">send</span>}
        </button>
      </form>
    </div>
  );
}
