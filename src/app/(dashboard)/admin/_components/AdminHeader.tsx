export function AdminHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
          Admin Dashboard
        </h1>
        <p className="text-[#6B7280] mt-1">
          Welcome back, Community Admin. Here&apos;s what&apos;s happening today.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8F9FA] transition-colors">
          <span className="material-icons-round">search</span>
        </button>
        <button className="relative p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8F9FA] transition-colors">
          <span className="material-icons-round">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
