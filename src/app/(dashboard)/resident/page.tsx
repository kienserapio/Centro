import { ResidentSidebar } from "./_components/ResidentSidebar";
import { ResidentHeader } from "./_components/ResidentHeader";
import { CommunityFeed } from "./_components/CommunityFeed";
import { AccountPanel } from "./_components/AccountPanel";
import { QuickActions } from "./_components/QuickActions";
import { EmergencyButton } from "./_components/EmergencyButton";
import { MobileNav } from "./_components/MobileNav";

export default function ResidentPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <ResidentSidebar />

      {/* Main content area — offset by sidebar on md+ */}
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          <ResidentHeader />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Center feed */}
            <div className="lg:col-span-8">
              <CommunityFeed />
            </div>

            {/* Right panel */}
            <div className="lg:col-span-4 space-y-6">
              <AccountPanel />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>

      <EmergencyButton />
      <MobileNav />
    </div>
  );
}

