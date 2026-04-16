"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { TransactionsListing, Transaction } from "./_components/TransactionsListing";
import { AddBillModal, NewBillPayload } from "./_components/AddBillModal";
import { DUE_BILLING_FEATURE_OPTIONS, DueBillingFeature } from "@/lib/types";

const SEED_TRANSACTIONS: Transaction[] = [
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

const FEATURE_NAMES = Object.fromEntries(
  DUE_BILLING_FEATURE_OPTIONS.map((feature) => [feature.value, feature.label]),
) as Record<DueBillingFeature, string>;

function toPhp(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parsePhp(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

export default function DuesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [isRevenueFilterOpen, setIsRevenueFilterOpen] = useState(false);
  const [selectedRevenueFeatures, setSelectedRevenueFeatures] = useState<DueBillingFeature[]>(
    DUE_BILLING_FEATURE_OPTIONS.map((feature) => feature.value),
  );
  const [subdivisionRevenueByFeature, setSubdivisionRevenueByFeature] = useState<
    Record<DueBillingFeature, number>
  >({
    facilities: 0,
    rentable_items: 0,
    parks: 0,
    clubhouse: 0,
    guest_parking: 0,
  });

  const baseCollection = useMemo(
    () => transactions.reduce((sum, tx) => sum + parsePhp(tx.amount), 0),
    [transactions],
  );

  const filteredFeatureRevenue = useMemo(
    () =>
      selectedRevenueFeatures.reduce(
        (sum, feature) => sum + subdivisionRevenueByFeature[feature],
        0,
      ),
    [selectedRevenueFeatures, subdivisionRevenueByFeature],
  );

  const subdivisionRevenueTotal = baseCollection + filteredFeatureRevenue;

  function toggleRevenueFeature(feature: DueBillingFeature) {
    setSelectedRevenueFeatures((current) =>
      current.includes(feature)
        ? current.filter((selected) => selected !== feature)
        : [...current, feature],
    );
  }

  function handleCreateBill(newBill: NewBillPayload) {
    const billTotal = newBill.amount * newBill.residentCount;
    const perFeatureShare = billTotal / newBill.billingFeatures.length;

    setSubdivisionRevenueByFeature((current) => {
      const next = { ...current };

      newBill.billingFeatures.forEach((feature) => {
        next[feature] += perFeatureShare;
      });

      return next;
    });

    const featureLabel = newBill.billingFeatures
      .map((feature) => FEATURE_NAMES[feature])
      .join(", ");

    const nextTransaction: Transaction = {
      id: transactions.length + 1,
      initials: "SB",
      resident: `${newBill.residentCount} Residents`,
      description: `${newBill.description} • ${featureLabel}`,
      billingPeriod: newBill.billingPeriod,
      amount: toPhp(billTotal),
      status: "pending",
      date: new Date(newBill.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setTransactions((current) => [nextTransaction, ...current]);
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Subdivision Revenue */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium">Subdivision Revenue (This Month)</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">{toPhp(subdivisionRevenueTotal)}</h3>
                <p className="text-emerald-600 text-xs font-semibold mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">trending_up</span>
                  +{toPhp(filteredFeatureRevenue)} from feature billings
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">account_balance_wallet</span>
              </div>
            </div>

            {/* Feature Billing Filter */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[#6B7280] text-sm font-medium">Feature Billings Included</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#111827]">{selectedRevenueFeatures.length}</h3>
                  <p className="text-[#6B7280] text-xs mt-2">Facilities, rentable items, parks, and more</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRevenueFilterOpen((open) => !open)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] hover:bg-[#F8F9FA]"
                >
                  Select
                  <span className="material-icons-round text-base text-[#6B7280]">
                    {isRevenueFilterOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              {isRevenueFilterOpen && (
                <div className="absolute z-20 top-21 right-6 w-65 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden divide-y divide-[#F3F4F6]">
                  {DUE_BILLING_FEATURE_OPTIONS.map((feature) => {
                    const checked = selectedRevenueFeatures.includes(feature.value);

                    return (
                      <label
                        key={feature.value}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          checked ? "bg-secondary/5" : "hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRevenueFeature(feature.value)}
                          className="w-4 h-4 rounded accent-secondary"
                        />
                        <span className="text-sm font-medium text-[#111827]">{feature.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
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

          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm font-bold text-[#111827]">Subdivision Revenue Breakdown by Feature</h2>
              <p className="text-xs text-[#6B7280]">
                Included: {selectedRevenueFeatures.length} feature
                {selectedRevenueFeatures.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {DUE_BILLING_FEATURE_OPTIONS.map((feature) => {
                const amount = subdivisionRevenueByFeature[feature.value];
                const enabled = selectedRevenueFeatures.includes(feature.value);

                return (
                  <div
                    key={feature.value}
                    className={`rounded-lg border px-4 py-3 ${
                      enabled
                        ? "border-[#E5E7EB] bg-white"
                        : "border-[#E5E7EB] bg-[#F3F4F6] opacity-60"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      {feature.label}
                    </p>
                    <p className="text-lg font-bold text-[#111827] mt-1">{toPhp(amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions Table — full width */}
          <TransactionsListing transactions={transactions} />
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && (
        <AddBillModal
          onClose={() => setIsModalOpen(false)}
          onCreateBill={handleCreateBill}
        />
      )}
    </div>
  );
}
