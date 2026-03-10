import { ResidentSidebar } from "../_components/ResidentSidebar";
import { MobileNav } from "../_components/MobileNav";
import { DuesSummary } from "./_components/DuesSummary";
import { PendingPayments } from "./_components/PendingPayments";
import { PaymentHistory } from "./_components/PaymentHistory";

export default function DuesPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <ResidentSidebar />

      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
              My Dues
            </h1>
            <p className="text-[#6B7280] mt-1">
              Manage your subdivision assessments and active payments
            </p>
          </header>

          <DuesSummary />
          <PendingPayments />
          <PaymentHistory />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
