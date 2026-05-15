import { BillingStatusBadge, BillingStatus } from "./BillingStatusBadge";

export interface Transaction {
  id: string;
  initials: string;
  resident: string;
  description: string;
  billingPeriod: string;
  amount: string;
  status: BillingStatus;
  date: string;
}

interface TransactionsListingProps {
  transactions: Transaction[];
  onApprove?: (id: string) => void;
  approvingId?: string | null;
}

export function TransactionsListing({ transactions, onApprove, approvingId }: TransactionsListingProps) {
  const showActions = !!onApprove;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 className="text-base font-bold text-[#111827]">Recent Transactions</h2>
        <button className="text-secondary text-sm font-semibold hover:underline">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Resident
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Description
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Billing Period
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Date
              </th>
              {showActions && (
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280] text-center">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                  No recent transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#6B7280] shrink-0">
                      {tx.initials}
                    </div>
                    <span className="text-sm font-medium text-[#111827]">{tx.resident}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">
                  {tx.description}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827] whitespace-nowrap">
                  {tx.billingPeriod}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#111827] whitespace-nowrap">
                  {tx.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BillingStatusBadge status={tx.status} />
                </td>
                <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">
                  {tx.date}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {tx.status === "pending" ? (
                      <button
                        onClick={() => onApprove?.(tx.id)}
                        disabled={approvingId === tx.id}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 disabled:opacity-60"
                      >
                        {approvingId === tx.id ? "Approving..." : "Approve"}
                      </button>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    )}
                  </td>
                )}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
