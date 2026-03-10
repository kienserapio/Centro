import { DuesStatusBadge } from "./DuesStatusBadge";

type DuesStatus = "paid" | "unpaid" | "pending";

interface Resident {
  id: number;
  name: string;
  email: string;
  role: string;
  address: string;
  duesStatus: DuesStatus;
  phone: string;
  avatar: string;
}

const RESIDENTS: Resident[] = [
  {
    id: 1,
    name: "Johnathan Doe",
    email: "j.doe@example.com",
    role: "Resident",
    address: "Phase 1, Block 4, Lot 12",
    duesStatus: "paid",
    phone: "+63 912 345 6789",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwUIJgdkXQagQvYeLhY4Pdh7_9F5dJL2gxRfpO_vqZURX2OlhTqRAiluaKgGNL8icpybNBnv042Q--s9jBNOW73xRntej1ymjm2xVYTYwPLnqR2mnBDSqdagXu0wVueFvYrtCG8yTA7EVt-rYZqZstn4_FqEjqwofXY7ufSeHycSNd2UTXXVBkCOxRQbZMfJ95-YB6bcMcovJ7nvWEkeHtr5szuy4o7tiXC6pdJlTJx-LBIVYmR60MCbscPNmvRIta7MbldXxSrs4",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.s@webmail.com",
    role: "Resident",
    address: "Phase 2, Block 1, Lot 5",
    duesStatus: "unpaid",
    phone: "+63 923 456 7890",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzM-VkvxiWqFkz5i53tg8PHTidDU-nGwFFIQFdtD7RXdAUARNczkVnuCerH6KxDBKd-8PFV44ZkjdfL04pMQXyZ-3ZHIQjav5n8AaTPDBlSyYBCWwwM1BzVcMcTPyOgLXWdGua6JHK6eyy5f8nDUZeYSAsfTr3oG70Nn8SoO7oV2STvY7qd0xuJCQN3V5zIJjtr4GldekmSn362wRui80WWalY3bbWx0RJzrvrqHLyC0aUBXquRUWYImd-8vGTlpP1CSTpHqoBroc",
  },
  {
    id: 3,
    name: "Robert Brown",
    email: "rbrown@domain.org",
    role: "Resident",
    address: "Phase 1, Block 10, Lot 2",
    duesStatus: "pending",
    phone: "+63 934 567 8901",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_y4-kpi6methBk2D9wFFZuXYhgER_9Bpcb9IxsZawerXA6ieMWEFxV8bzoPwzCKPYSjQj0BgMW6NNA58e4q038ZQVmolpMHAj8dJ24scvjW0ceHkQRza3ti_bjHouCkq-44VsQfdQFr80G-lfcCJeN7ZII0vZhcOjXrE_oWMyU3iQoFgfCG2X8dZrT7LhR9JNP8MwaXNpGCgFTNPOby3c1RCqXksBCo4-s4YEj3pEqEjJuluudwBUvURLmE8jDQ8iXceppc_pPiQ",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@service.com",
    role: "Resident",
    address: "Phase 3, Block 2, Lot 8",
    duesStatus: "paid",
    phone: "+63 945 678 9012",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6QxV4OPqVjo_qzlOvm0UYQQbByo9FlJZdmfBx-9fQScPthRQE8g10oRcYyJzsK_xz1vc1oBS8xmflzUtC6fS9esw0p0LFquFQuvADj1pw8tZlAu6nmIvozmU5cCa3u3haSA2QeWAykGapWNUXCvq3K-uRd8gvISPHO_2TBcOwgbLAD_aB4adoa0z9dpOnJuCbUdpVRSSwFfSXOszrb0v7OJNJRqg7wKaxaKsOsVhqeuUUZ1mbH3xndfxlx01v0XALl_-u8BbO7soA",
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "m.wilson@corp.com",
    role: "Resident",
    address: "Phase 2, Block 5, Lot 15",
    duesStatus: "unpaid",
    phone: "+63 956 789 0123",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJv54qNXQAJujJu0y8VWZfYjwO1qOtbzNuLyAeJSA3T_kzb_4yDpb8xuBhRx0jDaqu5qIec6sEK5cNKnF7z0o4DFe5L-BC5RIW5KVOKdDYBNl_SGHCLHSaPMQ5JPKoS6ickOTP0cJG0_xPAQseoKW06PU0Ce2ZoBkv2mSS3JxiMbbLH5vi-zegrbxCpgdP3Y9frd-A7eZeJCxEyYHhN8kafUXB67svlyT6kaLZ59NO9AI7VySZQSwkHP56PyGZsOpR259_tIV1Dak",
  },
];

function ResidentRow({ resident }: { resident: Resident }) {
  return (
    <tr className="hover:bg-[#F8F9FA] transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className="w-10 h-10 rounded-full bg-[#E5E7EB] bg-cover bg-center border border-[#E5E7EB]"
          style={{ backgroundImage: `url('${resident.avatar}')` }}
          aria-label={resident.name}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-[#111827]">{resident.name}</div>
        <div className="text-xs text-[#6B7280]">{resident.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">{resident.role}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">{resident.address}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <DuesStatusBadge status={resident.duesStatus} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#6B7280] text-right">
        {resident.phone}
      </td>
    </tr>
  );
}

export function ResidentListing() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Dues Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">
                Phone Number
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {RESIDENTS.map((resident) => (
              <ResidentRow key={resident.id} resident={resident} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between">
        <p className="text-xs text-[#6B7280] font-medium">Showing 1 to 5 of 150 residents</p>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-white transition-colors">
            <span className="material-icons-round text-sm">chevron_left</span>
          </button>
          <button className="w-9 h-9 rounded-lg bg-secondary text-white flex items-center justify-center text-xs font-bold shadow-sm">
            1
          </button>
          <button className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-xs font-medium text-[#6B7280] hover:bg-white transition-colors">
            2
          </button>
          <button className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-xs font-medium text-[#6B7280] hover:bg-white transition-colors">
            3
          </button>
          <button className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-white transition-colors">
            <span className="material-icons-round text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
