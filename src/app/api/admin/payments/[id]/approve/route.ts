import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Unable to verify your role." }, { status: 500 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const admin = createServiceClient(supabaseUrl, serviceRoleKey);

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("id, unit_id, amount, status, description, due_date, billing_period")
      .eq("id", id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    if (payment.status !== "pending") {
      return NextResponse.json({ error: "Payment is not pending." }, { status: 409 });
    }

    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({ status: "completed" })
      .eq("id", id);

    if (paymentUpdateError) {
      return NextResponse.json({ error: paymentUpdateError.message }, { status: 500 });
    }

    let dueId: string | null = null;
    let amountApplied = 0;

    let duesQuery = admin
      .from("dues")
      .select("id, amount, amount_paid")
      .eq("unit_id", payment.unit_id)
      .is("deleted_at", null)
      .eq("description", payment.description)
      .order("due_date", { ascending: true })
      .limit(1);

    if (payment.due_date) {
      duesQuery = duesQuery.eq("due_date", payment.due_date);
    }

    if (payment.billing_period) {
      duesQuery = duesQuery.eq("billing_period", payment.billing_period);
    }

    const { data: dueRow, error: dueError } = await duesQuery.single();

    if (!dueError && dueRow) {
      dueId = dueRow.id;
      const paid = Number(dueRow.amount_paid ?? 0);
      const amount = Number(dueRow.amount ?? 0);
      const paymentAmount = Number(payment.amount ?? 0);
      const nextPaid = Math.min(amount, paid + paymentAmount);
      const status = nextPaid >= amount ? "paid" : "pending";

      amountApplied = Math.max(nextPaid - paid, 0);

      const { error: dueUpdateError } = await admin
        .from("dues")
        .update({ amount_paid: nextPaid, status })
        .eq("id", dueRow.id);

      if (dueUpdateError) {
        return NextResponse.json({ error: dueUpdateError.message }, { status: 500 });
      }
    }

    if (dueId && amountApplied > 0) {
      const { error: allocationError } = await admin
        .from("payment_allocations")
        .insert({
          payment_id: payment.id,
          due_id: dueId,
          amount: amountApplied,
        });

      if (allocationError) {
        console.error("[POST /api/admin/payments/:id/approve] Allocation error:", allocationError);
      }
    }

    return NextResponse.json({ message: "Payment approved." });
  } catch (error) {
    console.error("[POST /api/admin/payments/:id/approve]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
