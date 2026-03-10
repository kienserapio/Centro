import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { ResidentListing } from "./_components/ResidentListing";

export default function ResidentsPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
                Resident Directory
              </h1>
              <p className="text-[#6B7280] mt-1">
                Manage and view all registered residents within the community.
              </p>
            </div>
          </header>

          {/* Resident Table */}
          <ResidentListing />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                  <span className="material-icons-round">group</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +4%
                </span>
              </div>
              <h3 className="text-[#6B7280] text-sm font-medium">Total Residents</h3>
              <p className="text-2xl font-bold mt-1 text-[#111827]">1,248</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-icons-round">verified</span>
                </div>
                <span className="text-xs font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-lg">
                  88%
                </span>
              </div>
              <h3 className="text-[#6B7280] text-sm font-medium">Dues Collection Rate</h3>
              <p className="text-2xl font-bold mt-1 text-[#111827]">924 Paid</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <span className="material-icons-round">warning</span>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                  High Priority
                </span>
              </div>
              <h3 className="text-[#6B7280] text-sm font-medium">Outstanding Dues</h3>
              <p className="text-2xl font-bold mt-1 text-[#111827]">42 Unpaid</p>
            </div>
          </div>
        </div>
      </div>

      <AdminMobileNav />
    </div>
  );
}
