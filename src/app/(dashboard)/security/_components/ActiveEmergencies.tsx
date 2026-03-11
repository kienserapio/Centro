"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface EmergencyAlert {
  id: string;
  type: string;
  icon: string;
  location: string;
  residentName: string;
  unit: string;
  contact: string;
  timer: string;
  avatarUrl?: string;
}

const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: "1",
    type: "Resident Panic Alarm",
    icon: "emergency_home",
    location: "B/L/P 24",
    residentName: "John Doe",
    unit: "Unit 12-A",
    contact: "+63 917 555 0123",
    timer: "02:45",
  },
  {
    id: "2",
    type: "Smoke Detected",
    icon: "fire_extinguisher",
    location: "B/L/P 12",
    residentName: "Jane Smith",
    unit: "Unit 04-F",
    contact: "+63 917 555 0987",
    timer: "01:20",
  },
];

const CARD_WIDTH = 380;
const CARD_GAP = 16;

export function ActiveEmergencies() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function acknowledge(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
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

        {/* Scrollable track — clipped so cards don't bleed past panel edges */}
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
                  <span className="material-icons-round text-primary text-2xl">{alert.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">
                    {alert.type}
                  </p>
                  <h4 className="text-2xl font-black text-[#111827] mt-0.5">{alert.location}</h4>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xl font-mono text-primary font-bold">{alert.timer}</span>
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
                <p className="text-sm font-bold text-[#111827]">{alert.residentName}</p>
                <p className="text-xs text-[#6B7280]">
                  {alert.unit} · {alert.contact}
                </p>
              </div>
            </div>

            {/* Acknowledge button */}
            <button
              onClick={() => acknowledge(alert.id)}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <span className="material-icons-round text-base">check_circle</span>
              ACKNOWLEDGE RESPONSE
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
