"use client";

import { useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { TransactionsListing, Transaction } from "./_components/TransactionsListing";
import { AddBillModal } from "./_components/AddBillModal";

const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    initials: "JD",
    resident: "John Doe (A-102)",
    description: "Maintenance Fee",
    billingPeriod: "Oct 2023",
    amount: "₱250.00",
    status: "paid",
    date: "Oct 12, 2023",
  },
  {
    id: 2,
    initials: "SS",
    resident: "Sarah Smith (B-405)",
    description: "Utility Charges",
    billingPeriod: "Oct 2023",
    amount: "₱115.50",
    status: "pending",
    date: "Oct 10, 2023",
  },
  {
    id: 3,
    initials: "MW",
    resident: "Michael Wong (C-001)",
    description: "Clubhouse Deposit",
    billingPeriod: "One-time",
    amount: "₱500.00",
    status: "overdue",
    date: "Oct 05, 2023",
  },
  {
    id: 4,
    initials: "EL",
    resident: "Elena Lopez (A-302)",
    description: "Maintenance Fee",
    billingPeriod: "Oct 2023",
    amount: "₱250.00",
    status: "paid",
    date: "Oct 04, 2023",
  },
];

export default function DuesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
                Dues &amp; Billing
              </h1>
              <p className="text-[#6B7280] mt-1">
                Track payments, manage billing periods, and monitor collection rates.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
            >
              <span className="material-icons-round text-[18px]">add</span>
              Add New Bill
            </button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Collection */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium">Total Collection (This Month)</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">₱45,250</h3>
                <p className="text-emerald-600 text-xs font-semibold mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">trending_up</span>
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">account_balance_wallet</span>
              </div>
            </div>

            {/* Pending Dues */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium">Pending Dues</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">₱12,400</h3>
                <p className="text-red-500 text-xs font-semibold mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">priority_high</span>
                  14 residents overdue
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">error</span>
              </div>
            </div>

            {/* Collection Rate */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[#6B7280] text-sm font-medium">Collection Rate</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">78.4%</h3>
                <div className="w-full bg-[#F3F4F6] h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "78.4%" }} />
                </div>
              </div>
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#F3F4F6" strokeWidth="4" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="transparent"
                    stroke="#FF8C42"
                    strokeWidth="4"
                    strokeDasharray="175.9"
                    strokeDashoffset="38"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-[#111827]">78%</span>
              </div>
            </div>
          </div>

          {/* Transactions Table — full width */}
          <TransactionsListing transactions={TRANSACTIONS} />
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && <AddBillModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
