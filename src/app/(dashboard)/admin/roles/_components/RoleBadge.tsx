export type StaffRole = "Admin" | "Security";

const variants: Record<StaffRole, string> = {
  Admin: "bg-primary/10 text-primary",
  Security: "bg-secondary/10 text-secondary",
};

interface RoleBadgeProps {
  role: StaffRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[role]}`}
    >
      {role}
    </span>
  );
}
