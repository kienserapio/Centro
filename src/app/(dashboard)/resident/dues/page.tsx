import { ResidentSidebar } from "../_components/ResidentSidebar";
import { MobileNav } from "../_components/MobileNav";
import { DuesSummary } from "./_components/DuesSummary";
import { PendingPayments } from "./_components/PendingPayments";
import { PaymentHistory } from "./_components/PaymentHistory";
import { createClient } from "@/lib/supabase/server";

type PaymentRow = {
  id: string;
  amount: number;
  description: string;
  reference_no: string | null;
  billing_period: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
};

type PendingItem = {
  id: string;
  description: string;
  subtext: string;
  amount: string;
  dueDate: string;
};

type HistoryItem = {
  id: string;
  label: string;
  subtext: string;
  amount: string;
  date: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "—";
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function DuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let payments: PaymentRow[] = [];
  let unitId: string | null = null;

  if (user) {
    const { data: unitResident } = await supabase
      .from("unit_residents")
      .select("unit_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    unitId = unitResident?.unit_id ?? null;
  }

  if (unitId) {
    const { data } = await supabase
      .from("payments")
      .select(
        "id, amount, description, reference_no, billing_period, due_date, status, created_at"
      )
      .eq("unit_id", unitId)
      .order("created_at", { ascending: false });

    payments = (data as PaymentRow[]) ?? [];
  }

  const pending = payments.filter((payment) => payment.status !== "completed");
  const history = payments.filter((payment) => payment.status === "completed");

  const nextDue = pending
    .map((payment) => payment.due_date || payment.billing_period)
    .filter(Boolean)
    .map((value) => new Date(value as string))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const balance = pending.reduce((total, payment) => total + payment.amount, 0);

  const pendingItems: PendingItem[] = pending.map((payment) => ({
    id: payment.id,
    description: payment.description,
    subtext: payment.billing_period
      ? `Billing period: ${formatDate(payment.billing_period)}`
      : `Status: ${payment.status}`,
    amount: formatCurrency(payment.amount),
    dueDate: formatDate(payment.due_date || payment.billing_period),
  }));

  const historyItems: HistoryItem[] = history.map((payment) => ({
    id: payment.id,
    label: payment.description,
    subtext: payment.reference_no
      ? `Ref: ${payment.reference_no}`
      : `Recorded ${formatDate(payment.created_at)}`,
    amount: formatCurrency(payment.amount),
    date: formatDate(payment.created_at),
  }));

  const summary = {
    nextDueDate: nextDue ? formatDate(nextDue.toISOString()) : "—",
    balance: formatCurrency(balance),
  };

  return (
    <div className="flex min-h-screen relative bg-white">
      <ResidentSidebar />

      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
              My Dues
            </h1>
            <p className="text-[#6B7280] mt-1">
              Manage your subdivision assessments and active payments
            </p>
          </header>

          <DuesSummary nextDueDate={summary.nextDueDate} balance={summary.balance} />
          <PendingPayments items={pendingItems} />
          <PaymentHistory items={historyItems} />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
