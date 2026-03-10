"use client";

import { useState } from "react";

type RuleItem = {
  icon: string;
  title: string;
  intro: string;
  bullets: string[];
};

const RULES: RuleItem[] = [
  {
    icon: "delete",
    title: "Waste Management",
    intro:
      "Trash collection occurs every Tuesday and Friday. Recycling is picked up on Wednesdays.",
    bullets: [
      "Please ensure all waste is in sealed bins to prevent pest issues.",
      "Bins should be placed at the curb no earlier than 6:00 PM the night before collection.",
      "Empty bins must be returned to your garage or backyard by 8:00 PM on collection day.",
      "Large appliance disposal requires a 48-hour notice to the management office.",
    ],
  },
  {
    icon: "volume_off",
    title: "Noise Ordinances",
    intro:
      "Quiet hours are strictly enforced to ensure the peace and comfort of all residents.",
    bullets: [
      "Quiet Hours: 10:00 PM to 7:00 AM daily.",
      "Parties involving music or high-volume activities must end by 11:00 PM on weekends with prior neighbor notification.",
      "Construction noise is only permitted between 8:00 AM and 5:00 PM, Monday through Saturday.",
    ],
  },
  {
    icon: "group",
    title: "Guest Protocols",
    intro:
      "For safety and security, all visitors must be registered at the main gate.",
    bullets: [
      "Residents must use the mobile app to pre-register guests for faster entry.",
      "Unregistered guests will be held at the gate until verbal confirmation is received from the host resident.",
      "Overnight guests staying longer than 72 hours must be reported to the HOA office.",
    ],
  },
  {
    icon: "architecture",
    title: "Construction Guidelines",
    intro:
      "Any external modifications to your property require approval from the Architectural Review Committee (ARC).",
    bullets: [
      "Permits must be displayed in a visible location on the property.",
      "Contractor vehicles must be parked within the property driveway and not block street access.",
      "Debris must be contained in a dumpster and removed weekly.",
    ],
  },
  {
    icon: "park",
    title: "Common Area Usage",
    intro:
      "Parks, pools, and clubhouses are shared spaces for the enjoyment of all residents.",
    bullets: [
      "Clubhouse reservations must be made at least 14 days in advance.",
      "Pool hours: 6:00 AM to 9:00 PM daily. No glass containers allowed in the pool area.",
      "Pet owners must clean up after their pets immediately in all common areas.",
      "Vandalism or misuse of facilities will result in immediate suspension of amenity privileges.",
    ],
  },
];

export function RulesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {RULES.map((rule, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={rule.title}
            className={`bg-white rounded-xl border transition-all ${
              isOpen
                ? "border-secondary/30 shadow-md"
                : "border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            }`}
          >
            <button
              className="w-full flex items-center justify-between p-5 text-left"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-secondary text-2xl">
                    {rule.icon}
                  </span>
                </div>
                <h3 className="text-[18px] font-semibold text-[#111827]">
                  {rule.title}
                </h3>
              </div>
              <span
                className={`material-icons-round text-[#6B7280] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-0">
                <div className="pl-15">
                  <p className="text-[#6B7280] mb-3 leading-relaxed">
                    {rule.intro}
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#6B7280]">
                    {rule.bullets.map((b) => (
                      <li key={b} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
