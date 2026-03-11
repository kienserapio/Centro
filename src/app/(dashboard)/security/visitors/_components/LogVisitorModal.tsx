"use client";

import { useState } from "react";
import type { Visitor } from "./VisitorLogTable";

interface Props {
  onClose: () => void;
  onAdd: (visitor: Visitor) => void;
}

export function LogVisitorModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    name: "",
    host: "",
    plate: "",
    expectedTime: "",
  });
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim()) {
      setError("Visitor name and host address are required.");
      return;
    }
    const initials = form.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    onAdd({
      id: crypto.randomUUID(),
      status: "pending",
      host: form.host.trim(),
      name: form.name.trim(),
      initials,
      plate: form.plate.trim() || "—",
      expectedTime: form.expectedTime || "Walk-in",
    });
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-secondary text-xl">
                  person_add
                </span>
              </div>
              <h2 className="text-base font-bold text-[#111827]">
                Quick Log Walk-in
              </h2>
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
              <label className="text-xs font-semibold text-[#374151]">
                Visitor Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Juan dela Cruz"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#374151]">
                Host Address <span className="text-rose-500">*</span>
              </label>
              <input
                name="host"
                value={form.host}
                onChange={handleChange}
                placeholder="e.g. B-204"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#374151]">
                  Vehicle Plate
                </label>
                <input
                  name="plate"
                  value={form.plate}
                  onChange={handleChange}
                  placeholder="e.g. ABC-1234"
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#374151]">
                  Expected Time
                </label>
                <input
                  type="time"
                  name="expectedTime"
                  value={form.expectedTime}
                  onChange={handleChange}
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F8F9FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:brightness-105 transition-all"
              >
                Log Visitor
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
