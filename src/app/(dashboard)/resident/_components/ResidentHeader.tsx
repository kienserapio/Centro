export function ResidentHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">Welcome Back, Juan</h1>
        <p className="text-[#6B7280] mt-1">
          Here&apos;s what&apos;s happening in your community today.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-[#6B7280] hover:bg-[#F8F9FA] rounded-full transition-all border border-transparent hover:border-[#E5E7EB]">
          <span className="material-icons-round">notifications</span>
        </button>
        <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all text-[#111827]">
          <span className="material-icons-round text-sm text-[#6B7280]">calendar_today</span>
          <span className="text-sm font-medium">{today}</span>
        </button>
      </div>
    </header>
  );
}
