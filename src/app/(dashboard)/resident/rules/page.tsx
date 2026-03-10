import { ResidentSidebar } from "../_components/ResidentSidebar";
import { MobileNav } from "../_components/MobileNav";
import { RulesAccordion } from "./_components/RulesAccordion";

export default function RulesPage() {
  return (
    <div className="flex min-h-screen relative bg-white">
      <ResidentSidebar />

      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
                  Subdivision Policies &amp; Guidelines
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Essential information for a harmonious community living.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-secondary/90 transition-all shrink-0">
                <span className="material-icons-round text-xl">download</span>
                Download PDF
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons-round text-[#6B7280]">search</span>
              </div>
              <input
                type="text"
                placeholder="Search for specific rules (e.g., parking, pets)..."
                className="w-full bg-white border border-[#E5E7EB] rounded-xl py-3.5 pl-12 pr-4 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all shadow-sm"
              />
            </div>

            {/* Accordion */}
            <RulesAccordion />

            {/* Contact footer */}
            <div className="mt-10 p-6 bg-secondary/5 border border-secondary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-white">help</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827]">Have a question?</h4>
                  <p className="text-sm text-[#6B7280]">
                    Our management team is here to assist you.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="mailto:help@centrosubdivision.com"
                  className="px-5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#111827] hover:shadow-sm transition-all"
                >
                  Contact Support
                </a>
                <a
                  href="#"
                  className="px-5 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-all"
                >
                  Emergency Hotlines
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
