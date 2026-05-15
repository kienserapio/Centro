"use client";

import { useState } from "react";
import {
  INCIDENT_TYPE_OPTIONS,
  uiLabelToDbValue,
  STATUS_CONFIG,
} from "@/lib/incidents/constants";
import type { EmergencyAlertWithDetails, IncidentStatus } from "@/lib/incidents/types";

interface Props {
  /** "report" = resident creating new; "edit" = guard updating status */
  mode: "report" | "edit";
  /** When mode="edit", the incident to update */
  incident?: EmergencyAlertWithDetails | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const CATEGORIES = INCIDENT_TYPE_OPTIONS.map((o) => o.uiLabel);

/** All status options a guard can pick when editing. */
const EDIT_STATUS_OPTIONS: { label: string; value: IncidentStatus }[] = [
  { label: "Acknowledge (Responding)", value: "responding" },
  { label: "Resolved", value: "resolved" },
  { label: "Escalated", value: "escalated" },
  { label: "Not Resolved", value: "unresolved" },
  { label: "False Incident", value: "false_alarm" },
];

export function ReportIncidentModal({ mode, incident, onClose, onSubmitSuccess }: Props) {
  // --- Report mode state ---
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    description: "",
  });

  // --- Edit mode state ---
  const [editStatus, setEditStatus] = useState<IncidentStatus>("responding");
  const [resolutionNote, setResolutionNote] = useState("");

  // --- Shared state ---
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_type: uiLabelToDbValue(form.category),
          description: form.description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit report.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSubmitSuccess();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incident) return;

    // Validate: escalated requires details
    if (editStatus === "escalated" && !resolutionNote.trim()) {
      setError("Escalation details are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          resolution_note: resolutionNote.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update status.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSubmitSuccess();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isReport = mode === "report";
  const title = isReport ? "Report Incident" : "Update Incident";
  const icon = isReport ? "emergency" : "edit_note";
  const iconBg = isReport ? "bg-red-500/10" : "bg-primary/10";
  const iconColor = isReport ? "text-red-500" : "text-primary";

  // Determine which status options are valid based on current incident status
  const availableStatusOptions = incident
    ? EDIT_STATUS_OPTIONS.filter((opt) => {
        const current = incident.status;
        if (current === "open") return opt.value === "responding" || opt.value === "false_alarm";
        if (current === "responding")
          return opt.value === "resolved" || opt.value === "escalated" || opt.value === "unresolved" || opt.value === "false_alarm";
        return false;
      })
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
                <span className={`material-icons-round ${iconColor} text-xl`}>{icon}</span>
              </div>
              <h2 className="text-base font-bold text-[#111827]">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>

          {/* Success state */}
          {success ? (
            <div className="px-6 py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="material-icons-round text-green-600 text-2xl">check_circle</span>
              </div>
              <p className="text-sm font-bold text-[#111827]">
                {isReport ? "Incident reported successfully!" : "Status updated successfully!"}
              </p>
              <p className="text-xs text-[#6B7280]">This window will close automatically.</p>
            </div>
          ) : isReport ? (
            /* Report Mode Form */
            <form onSubmit={handleReportSubmit} className="px-6 py-5 space-y-4">
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
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe what happened and any immediate concerns…"
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
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:brightness-105 transition-all disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Read-only incident info */}
              {incident && (
                <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#6B7280]">Reporter</span>
                    <span className="text-[#111827] font-medium">{incident.reporter_name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#6B7280]">Unit</span>
                    <span className="text-[#111827] font-medium">{incident.reporter_unit_label}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#6B7280]">Current Status</span>
                    <span className={`font-bold uppercase ${STATUS_CONFIG[incident.status].text}`}>
                      {STATUS_CONFIG[incident.status].uiLabel}
                    </span>
                  </div>
                  {incident.description && (
                    <div className="pt-1 border-t border-[#E5E7EB]">
                      <p className="text-xs font-semibold text-[#6B7280] mb-0.5">Description</p>
                      <p className="text-xs text-[#374151]">{incident.description}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#374151]">New Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => {
                    setEditStatus(e.target.value as IncidentStatus);
                    setError("");
                  }}
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                >
                  {availableStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Escalation details — only shown when "Escalated" is selected */}
              {editStatus === "escalated" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#374151]">
                    Escalation Details — describe how the incident escalated{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => {
                      setResolutionNote(e.target.value);
                      setError("");
                    }}
                    rows={3}
                    placeholder="Describe the escalation and actions taken…"
                    className="w-full border border-rose-300 rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-rose-300/30 transition-all resize-none bg-rose-50/30"
                  />
                </div>
              )}

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
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-105 transition-all disabled:opacity-60"
                >
                  {submitting ? "Updating…" : "Update Status"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
