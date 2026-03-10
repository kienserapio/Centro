type HistoryItem = {
  label: string;
  subtext: string;
  amount: string;
  date: string;
};

const HISTORY: HistoryItem[] = [
  {
    label: "September Combined Dues",
    subtext: "Paid via Credit Card • Ref: #78219",
    amount: "₱450.00",
    date: "Sep 02, 2024",
  },
  {
    label: "August Combined Dues",
    subtext: "Paid via Bank Transfer • Ref: #66102",
    amount: "₱450.00",
    date: "Aug 05, 2024",
  },
  {
    label: "July Combined Dues",
    subtext: "Paid via Credit Card • Ref: #55198",
    amount: "₱450.00",
    date: "Jul 01, 2024",
  },
];

export function PaymentHistory() {
  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <h4 className="text-[18px] font-semibold text-secondary flex items-center gap-2">
          <span className="material-icons-round text-secondary">history</span>
          Payment History
        </h4>
      </div>

      {/* Items */}
      <div className="p-6 space-y-3">
        {HISTORY.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-secondary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-secondary/10 p-2 rounded-full shrink-0">
                <span className="material-icons-round text-secondary">
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {item.label}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">{item.subtext}</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-sm font-bold text-secondary">{item.amount}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{item.date}</p>
            </div>
          </div>
        ))}

        <button className="w-full mt-3 py-3 text-sm font-semibold text-secondary border-2 border-secondary/20 rounded-xl hover:bg-secondary/5 transition-colors">
          View Full Statement History
        </button>
      </div>
    </section>
  );
}
