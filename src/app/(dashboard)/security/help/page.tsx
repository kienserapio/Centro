"use client";

import { useState } from "react";
import { SecuritySidebar } from "../_components/SecuritySidebar";
import { SecurityMobileNav } from "../_components/SecurityMobileNav";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQSection = {
  icon: string;
  title: string;
  items: FAQItem[];
};

const FAQ_DATA: FAQSection[] = [
  {
    icon: "emergency",
    title: "Real-Time Emergency Alerts",
    items: [
      {
        question: "How will I know if a resident triggers an emergency alert?",
        answer:
          "The Guard Console utilizes a high-priority, real-time connection. If a resident signals for help, your dashboard will immediately flash a red visual warning and play a continuous audio alarm sound, even if you are on another tab.",
      },
      {
        question: "What are the different alert statuses, and how do I update them?",
        answer:
          "OPEN: A resident has just sent an alert. The system is waiting for security to acknowledge it.\n\nRESPONDING: Click Acknowledge & Respond as soon as you dispatch a guard team to the location. This silences the alarm and alerts the resident that help is on the way.\n\nRESOLVED / FALSE ALARM: Once the situation is handled, click Mark as Resolved or Mark as False Alarm.",
      },
      {
        question: "Does the system automatically close alerts after a certain period?",
        answer:
          "No. An emergency alert will stay active indefinitely until a human security officer explicitly verifies the situation and clicks the final resolution status on the console.",
      },
    ],
  },
  {
    icon: "badge",
    title: "Visitor & Gate Management",
    items: [
      {
        question: "How do I process a resident's pre-registered guest?",
        answer:
          "Look up the visitor's name or vehicle plate number in the Pre-Registrations list on your dashboard. Once identity/authorization is confirmed, click Log Entry. The system records the precise arrival timestamp automatically.",
      },
      {
        question: "What should I do for unexpected walk-in visitors or delivery riders?",
        answer:
          "Click the Log Walk-In button at the top of your console. Manually input the guest's full name, vehicle plate or identification type, and the destination Block/Lot. Click Save Entry before granting access past the gate.",
      },
    ],
  },
  {
    icon: "settings",
    title: "System Configuration & Account Settings",
    items: [
      {
        question: "Can a Resident or Guard access the Admin Portal features?",
        answer:
          "No. Role-Based Access Control (RBAC) prevents this. Security features, ledger management settings, and user promotion options are completely hidden from non-admin accounts.",
      },
      {
        question: "How do I promote a new volunteer to an Admin or Guard account?",
        answer:
          "All self-signups default strictly to the Resident role. To upgrade an account, an existing Admin must navigate to the User Profiles directory, locate the verified name, and select the appropriate role from the secure drop-down action menu.",
      },
    ],
  },
];

function FAQAccordion({ section }: { section: FAQSection }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center gap-3">
        <span className="material-icons-round text-secondary">{section.icon}</span>
        <h3 className="text-lg font-bold text-[#111827]">{section.title}</h3>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {section.items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F8F9FA] transition-colors"
              >
                <span className="text-sm font-semibold text-[#111827] pr-4">{item.question}</span>
                <span
                  className={`material-icons-round text-[#6B7280] shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-0">
                  <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SecurityHelpPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <SecuritySidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          <header className="mb-8">
            <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
              Help Center
            </h1>
            <p className="text-[#6B7280] mt-1">
              Frequently asked questions for the security guard console.
            </p>
          </header>

          <div className="space-y-6">
            {FAQ_DATA.map((section, idx) => (
              <FAQAccordion key={idx} section={section} />
            ))}
          </div>
        </div>
      </div>

      <SecurityMobileNav />
    </div>
  );
}
