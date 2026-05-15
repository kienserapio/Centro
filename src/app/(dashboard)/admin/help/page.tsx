"use client";

import { useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";

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
    icon: "payments",
    title: "Dues & Financial Ledger Management",
    items: [
      {
        question: "How are monthly dues calculated and assigned?",
        answer:
          "The system automatically generates standard assessment charges for all registered properties on the 1st day of every month. You do not need to manually create monthly invoices.",
      },
      {
        question: "How do I record a resident's payment?",
        answer:
          "Navigate to the Ledger Management tab. Search for the unit using the Block, Lot, and Phase filter. Click Record Payment, enter the exact amount received in Philippine Pesos (₱), select the payment date, and enter the reference number or physical receipt ID. Click Confirm. The resident's balance will update in real-time.",
      },
      {
        question: "What happens if a resident pays late?",
        answer:
          "A penalty fee is automatically applied to accounts that remain unpaid 5 days past the official due date. This grace period is system-enforced to prevent manual errors or bias.",
      },
      {
        question: "Can I edit or delete a past payment record if I made a mistake?",
        answer:
          "No. To maintain complete transparency and eliminate disputes, payment records are immutable. You cannot hard-delete financial data. If an error occurs, you must issue a formal credit or debit Adjustment Entry with accompanying documentation to correct the running balance.",
      },
    ],
  },
  {
    icon: "campaign",
    title: "Announcements & Notifications",
    items: [
      {
        question: "How do I make sure residents see an urgent notification?",
        answer:
          "When creating an announcement, set the Priority level to Emergency. This pins the notice to the absolute top of every resident's mobile and web feed, bypassing chronological order.",
      },
      {
        question: "Can I see who has read an announcement?",
        answer:
          "Yes. Every announcement features a Read Receipt Counter visible only to Admins. Clicking this counter displays a list of units that have successfully loaded the notice on their screens.",
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

export default function AdminHelpPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          <header className="mb-8">
            <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
              Help Desk
            </h1>
            <p className="text-[#6B7280] mt-1">
              Frequently asked questions for managing the subdivision portal.
            </p>
          </header>

          <div className="space-y-6">
            {FAQ_DATA.map((section, idx) => (
              <FAQAccordion key={idx} section={section} />
            ))}
          </div>
        </div>
      </div>

      <AdminMobileNav />
    </div>
  );
}
