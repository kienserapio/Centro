"use client";

import { useState, useEffect } from "react";
import { GuardScheduleTable } from "./_components/GuardScheduleTable";
import { SecuritySidebar } from "../_components/SecuritySidebar";
import { SecurityMobileNav } from "../_components/SecurityMobileNav";

interface Guard {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
}

interface GuardSchedule {
  id: string;
  guard_id: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  post_assignment: string;
  notes: string;
  is_active: boolean;
  profiles: Guard;
}

export default function GuardSchedulePage() {
  const [schedules, setSchedules] = useState<GuardSchedule[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [postAssignment, setPostAssignment] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch schedules and guards
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [schedulesRes, guardsRes] = await Promise.all([
          fetch("/api/security/guard-schedules"),
          fetch("/api/security/guards"),
        ]);

        if (!schedulesRes.ok || !guardsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const schedulesData = await schedulesRes.json();
        const guardsData = await guardsRes.json();

        setSchedules(schedulesData.schedules || []);
        setGuards(guardsData.guards || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuard || !shiftDate || !startTime || !endTime) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/security/guard-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guard_id: selectedGuard,
          shift_date: shiftDate,
          shift_start_time: startTime,
          shift_end_time: endTime,
          post_assignment: postAssignment,
          notes: notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to create schedule");

      const data = await response.json();

      // Add the new schedule to the list
      if (data.schedule) {
        const selectedGuardObj = guards.find((g) => g.id === selectedGuard);
        setSchedules([
          {
            ...data.schedule,
            profiles: selectedGuardObj || {},
          },
          ...schedules,
        ]);
      }

      // Reset form
      setSelectedGuard("");
      setShiftDate(new Date().toISOString().split("T")[0]);
      setStartTime("08:00");
      setEndTime("16:00");
      setPostAssignment("");
      setNotes("");
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("Error creating schedule:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/security/guard-schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete schedule");

      setSchedules(schedules.filter((s) => s.id !== scheduleId));
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleUpdate = async (updatedSchedule: any) => {
    setSchedules((prev) => prev.map((s) => (s.id === updatedSchedule.id ? { ...s, ...updatedSchedule } : s)));
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <SecuritySidebar />

      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#111827]">Guard Schedule Manager</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors font-semibold text-sm"
          >
            <span className="material-icons-round text-lg">add</span>
            New Schedule
          </button>
        </header>

        {/* Page body */}
        <main className="flex-1 p-6 pb-24 lg:pb-8">
          <div className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Create New Schedule</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Guard selection */}
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        Guard <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedGuard}
                        onChange={(e) => setSelectedGuard(e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                        required
                      >
                        <option value="">Select a guard...</option>
                        {guards.map((guard) => (
                          <option key={guard.id} value={guard.id}>
                            {guard.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shift date */}
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        Shift Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={shiftDate}
                        onChange={(e) => setShiftDate(e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                        required
                      />
                    </div>

                    {/* Start time */}
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                        required
                      />
                    </div>

                    {/* End time */}
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                        required
                      />
                    </div>

                    {/* Post assignment */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        Post Assignment
                      </label>
                      <input
                        type="text"
                        value={postAssignment}
                        onChange={(e) => setPostAssignment(e.target.value)}
                        placeholder="e.g., Main Gate A"
                        className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#374151] mb-2">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={3}
                        className="w-full bg-white border border-[#E5E7EB] text-[#111827] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
                      />
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors font-semibold text-sm disabled:opacity-50"
                    >
                      {submitting ? "Creating..." : "Create Schedule"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-[#F8F9FA] text-[#374151] rounded-xl hover:bg-[#E5E7EB] transition-colors font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Schedules table */}
            {loading ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-secondary rounded-full animate-spin" />
                </div>
                <p className="text-sm text-[#6B7280] mt-3">Loading schedules...</p>
              </div>
            ) : schedules.length > 0 ? (
              <GuardScheduleTable schedules={schedules} onDelete={handleDelete} onUpdate={handleUpdate} />
            ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
                <span className="material-icons-round text-[#9CA3AF] text-4xl">
                  calendar_today
                </span>
                <p className="text-sm text-[#6B7280] mt-2">No guard schedules yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors font-semibold text-sm"
                >
                  Create First Schedule
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <SecurityMobileNav />
    </div>
  );
}
