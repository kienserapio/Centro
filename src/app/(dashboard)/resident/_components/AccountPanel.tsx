export function AccountPanel() {
  return (
    <section className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-[18px] text-[#111827]">Account Balance</h2>
        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase tracking-wide">
          PAID
        </span>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-[#111827] mb-1">₱0.00</div>
        <p className="text-[#6B7280] text-sm">No outstanding dues</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#6B7280]">Last Payment: ₱2,450.00</span>
            <span className="font-medium text-[#111827]">100%</span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-full" />
          </div>
        </div>

        <button className="w-full py-3 bg-[#F8F9FA] hover:bg-[#E5E7EB] text-[#111827] rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
          <span className="material-icons-round text-lg text-[#6B7280]">history</span>
          View History
        </button>
      </div>
    </section>
  );
}
