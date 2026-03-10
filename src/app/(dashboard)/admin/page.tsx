import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";
import { StatsCards } from "./_components/StatsCards";
import { RecentIncidents } from "./_components/RecentIncidents";
import { QuickPost } from "./_components/QuickPost";
import { UpcomingEvents } from "./_components/UpcomingEvents";
import { AdminMobileNav } from "./_components/AdminMobileNav";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          <AdminHeader />
          <StatsCards />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main table — 2/3 width */}
            <div className="xl:col-span-2">
              <RecentIncidents />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <QuickPost />
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </div>

      <AdminMobileNav />
    </div>
  );
}
