export type StaffRole = "Admin" | "Security" | "Resident";

const variants: Record<StaffRole, string> = {
  Admin: "bg-primary/10 text-primary",
  Security: "bg-secondary/10 text-secondary",
  Resident: "bg-blue-100 text-blue-700",
};

interface RoleBadgeProps {
  role: StaffRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[role] ?? "bg-gray-100 text-gray-700"}`}
    >
      {role}
    </span>
  );
}
