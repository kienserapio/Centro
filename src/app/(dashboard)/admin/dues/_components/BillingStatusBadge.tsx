export type BillingStatus = "paid" | "pending" | "overdue";

const variants: Record<BillingStatus, string> = {
  paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  overdue: "bg-red-100 text-red-600 border border-red-200",
};

const labels: Record<BillingStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

interface BillingStatusBadgeProps {
  status: BillingStatus;
}

export function BillingStatusBadge({ status }: BillingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${variants[status]}`}
    >
      {labels[status]}
    </span>
  );
}
