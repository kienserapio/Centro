"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { EmergencyAlertWithDetails } from "@/lib/incidents/types";
import { dbValueToUiLabel, formatDuration } from "@/lib/incidents/constants";

const CARD_WIDTH = 380;
const CARD_GAP = 16;

/** Live counting-up timer from created_at. */
function WaitTimer({ from }: { from: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = now - new Date(from).getTime();
  const totalSeconds = Math.floor(Math.max(0, elapsed) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return (
    <span className="text-xl font-mono text-primary font-bold">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

/** Icon for incident type. */
function getIncidentIcon(type: string): string {
  switch (type) {
    case "medical": return "local_hospital";
    case "fire": return "fire_extinguisher";
    case "intrusion": return "shield";
    case "suspicious": return "visibility";
    default: return "emergency_home";
  }
}

export function ActiveEmergencies() {
  const [alerts, setAlerts] = useState<EmergencyAlertWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch open alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/incidents");
      if (!res.ok) return;
      const data: EmergencyAlertWithDetails[] = await res.json();
      // Only show open (pending) alerts
      setAlerts(data.filter((a) => a.status === "open"));
    } catch {
      // Silently fail — dashboard still works
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Poll every 10 seconds for new alerts
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  async function acknowledge(alertId: string) {
    setAcknowledgingId(alertId);
    try {
      const res = await fetch(`/api/incidents/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "responding" }),
      });
      if (res.ok) {
        // Immediately remove from the list
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch {
      // Silently fail
    } finally {
      setAcknowledgingId(null);
    }
  }

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [alerts, updateArrows]);

  function scrollBy(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "right" ? CARD_WIDTH + CARD_GAP : -(CARD_WIDTH + CARD_GAP),
      behavior: "smooth",
    });
  }

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <span className="material-icons-round text-primary">warning</span>
            Active Emergencies
          </h3>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <span className="material-icons-round animate-spin text-[#6B7280] text-2xl">refresh</span>
          <p className="text-sm text-[#6B7280] mt-2">Loading alerts…</p>
        </div>
      </section>
    );
  }

  if (alerts.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <span className="material-icons-round text-primary">warning</span>
            Active Emergencies
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              All Clear
            </span>
          </h3>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <span className="material-icons-round text-green-500 text-4xl">check_circle</span>
          <p className="text-sm text-[#6B7280] mt-2">No active emergencies</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <span className="material-icons-round text-primary">warning</span>
          Active Emergencies
          <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            {alerts.length} Alert{alerts.length !== 1 ? "s" : ""}
          </span>
        </h3>
      </div>

      {/* Carousel wrapper */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scrollBy("left")}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#E5E7EB] shadow-md flex items-center justify-center transition-opacity ${
            canScrollLeft ? "opacity-100 hover:bg-[#F8F9FA]" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="material-icons-round text-[#374151] text-base">chevron_left</span>
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden pb-2 scroll-smooth"
        >
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`min-w-95 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] border-l-4 border-l-primary p-5 flex flex-col justify-between h-60 transition-opacity ${
              index > 0 ? "opacity-90" : ""
            }`}
          >
            {/* Top row: type icon + location + timer */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-primary text-2xl">
                    {getIncidentIcon(alert.incident_type)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">
                    {dbValueToUiLabel(alert.incident_type)}
                  </p>
                  <h4 className="text-2xl font-black text-[#111827] mt-0.5">
                    {alert.reporter_unit_label.replace("Block ", "B").replace(", Lot ", "/L")}
                  </h4>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <WaitTimer from={alert.created_at} />
                <span className="text-[10px] text-[#6B7280] uppercase tracking-tight">
                  Response Timer
                </span>
              </div>
            </div>

            {/* Resident info */}
            <div className="flex items-center gap-3 py-3 border-y border-[#E5E7EB]">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                <span className="material-icons-round text-[#6B7280] text-base">person</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">{alert.reporter_name}</p>
                <p className="text-xs text-[#6B7280]">{alert.reporter_unit_label}</p>
              </div>
            </div>

            {/* Acknowledge button */}
            <button
              onClick={() => acknowledge(alert.id)}
              disabled={acknowledgingId === alert.id}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-60"
            >
              <span className="material-icons-round text-base">check_circle</span>
              {acknowledgingId === alert.id ? "ACKNOWLEDGING…" : "ACKNOWLEDGE RESPONSE"}
            </button>
          </div>
        ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollBy("right")}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#E5E7EB] shadow-md flex items-center justify-center transition-opacity ${
            canScrollRight ? "opacity-100 hover:bg-[#F8F9FA]" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="material-icons-round text-[#374151] text-base">chevron_right</span>
        </button>
      </div>

      {/* Dot indicators */}
      {alerts.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {alerts.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (el) el.scrollTo({ left: i * (CARD_WIDTH + CARD_GAP), behavior: "smooth" });
              }}
              className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB] hover:bg-primary/60 transition-colors"
            />
          ))}
        </div>
      )}
    </section>
  );
}
