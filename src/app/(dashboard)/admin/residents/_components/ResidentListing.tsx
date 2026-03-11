import { DuesStatusBadge } from "./DuesStatusBadge";

type DuesStatus = "paid" | "unpaid" | "pending";

export interface Resident {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string;
  duesStatus: DuesStatus;
  phone: string;
  avatar: string;
}

interface ResidentListingProps {
  residents: Resident[];
  onEdit?: (resident: Resident) => void;
  onRemove?: (id: string) => void;
}

function ResidentRow({
  resident,
  onEdit,
  onRemove,
}: {
  resident: Resident;
  onEdit?: (resident: Resident) => void;
  onRemove?: (id: string) => void;
}) {
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
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#6B7280]">
        {resident.phone}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEdit?.(resident)}
            className="p-1.5 text-[#6B7280] hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
            aria-label={`Edit ${resident.name}`}
          >
            <span className="material-icons-round text-[18px]">edit</span>
          </button>
          <button
            onClick={() => onRemove?.(resident.id)}
            className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Remove ${resident.name}`}
          >
            <span className="material-icons-round text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ResidentListing({ residents, onEdit, onRemove }: ResidentListingProps) {
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
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {residents.map((resident) => (
              <ResidentRow
                key={resident.id}
                resident={resident}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between">
        <p className="text-xs text-[#6B7280] font-medium">
          Showing {residents.length} resident{residents.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
