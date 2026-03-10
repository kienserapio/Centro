type PendingItem = {
  description: string;
  subtext: string;
  amount: string;
  dueDate: string;
};

const PENDING: PendingItem[] = [
  {
    description: "Association Fees",
    subtext: "Quarterly neighborhood maintenance",
    amount: "₱200.00",
    dueDate: "Oct 01, 2025",
  },
  {
    description: "Monthly Maintenance",
    subtext: "Shared facilities and parks",
    amount: "₱150.00",
    dueDate: "Oct 01, 2025",
  },
  {
    description: "Security Dues",
    subtext: "24/7 Gated security services",
    amount: "₱50.00",
    dueDate: "Oct 01, 2025",
  },
  {
    description: "Garbage Collection",
    subtext: "Weekly waste management",
    amount: "₱50.00",
    dueDate: "Oct 01, 2025",
  },
];

export function PendingPayments() {
  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <h4 className="text-[18px] font-semibold text-[#111827] flex items-center gap-2">
          <span className="material-icons-round text-primary">pending_actions</span>
          Pending Payments
        </h4>
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
          {PENDING.length} Items Outstanding
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA]">
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {PENDING.map((item) => (
              <tr
                key={item.description}
                className="hover:bg-[#F8F9FA] transition-colors"
              >
                <td className="px-6 py-5">
                  <p className="text-sm font-semibold text-[#111827]">
                    {item.description}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.subtext}</p>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-[#111827]">
                  {item.amount}
                </td>
                <td className="px-6 py-5 text-sm text-[#6B7280]">
                  {item.dueDate}
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="bg-primary text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm">
                    Pay Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
