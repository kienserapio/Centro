import { RoleBadge, StaffRole } from "./RoleBadge";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: "Active" | "Inactive";
  avatar: string;
}

interface RolesListingProps {
  members: StaffMember[];
  onEdit?: (member: StaffMember) => void;
  onRemove?: (id: string) => void;
}

function StatusIndicator({ status }: { status: StaffMember["status"] }) {
  const isActive = status === "Active";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      <span
        className={`text-sm font-medium ${isActive ? "text-[#111827]" : "text-[#6B7280]"}`}
      >
        {status}
      </span>
    </div>
  );
}

export function RolesListing({ members, onEdit, onRemove }: RolesListingProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Contact
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6B7280] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-[#F8F9FA] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-[#E5E7EB] bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${member.avatar}')` }}
                      aria-label={member.name}
                    />
                    <span className="text-sm font-semibold text-[#111827]">
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[#111827]">{member.email}</p>
                  <p className="text-xs text-[#6B7280]">{member.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusIndicator status={member.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit?.(member)}
                      className="p-1.5 text-[#6B7280] hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                      aria-label={`Edit ${member.name}`}
                    >
                      <span className="material-icons-round text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => onRemove?.(member.id)}
                      className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Remove ${member.name}`}
                    >
                      <span className="material-icons-round text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
