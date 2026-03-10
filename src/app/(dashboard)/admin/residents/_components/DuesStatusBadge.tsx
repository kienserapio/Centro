type DuesStatus = "paid" | "unpaid" | "pending";

const variants: Record<DuesStatus, string> = {
  paid: "bg-secondary/10 text-secondary border border-secondary/20",
  unpaid: "bg-red-100 text-red-600 border border-red-200",
  pending: "bg-primary/10 text-primary border border-primary/20",
};

const labels: Record<DuesStatus, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  pending: "Pending",
};

interface DuesStatusBadgeProps {
  status: DuesStatus;
}

export function DuesStatusBadge({ status }: DuesStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${variants[status]}`}
    >
      {labels[status]}
    </span>
  );
}
