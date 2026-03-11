"use client";

import { useState } from "react";
import type { Incident } from "./types";

interface Props {
  onClose: () => void;
  onAdd: (incident: Incident) => void;
}

const CATEGORIES = [
  "Noise Complaint",
  "Unauthorized Entry",
  "Suspicious Activity",
  "Medical Emergency",
  "Maintenance",
  "Theft / Vandalism",
  "Other",
];

export function ReportIncidentModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    reporter: "",
    summary: "",
  });
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reporter.trim() || !form.summary.trim()) {
      setError("Reporter and resolution summary are required.");
      return;
    }

    const now = new Date();
    onAdd({
      id: crypto.randomUUID(),
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      category: form.category,
      reporter: form.reporter.trim(),
      guardInitials: "GR",
      guardName: "Guard Ramos",
      guardColor: "bg-primary/20 text-primary",
      summary: form.summary.trim(),
      status: "pending",
    });
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-primary text-xl">report</span>
              </div>
              <h2 className="text-base font-bold text-[#111827]">Report Incident</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#374151]">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#374151]">
                Reporting Resident / Source <span className="text-rose-500">*</span>
              </label>
              <input
                name="reporter"
                value={form.reporter}
                onChange={handleChange}
                placeholder="e.g. Unit 402 — J. Dela Cruz"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#374151]">
                Resolution Summary <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the incident and actions taken…"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F8F9FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-105 transition-all"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
