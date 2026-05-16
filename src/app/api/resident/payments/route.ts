import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const dueId = body?.due_id as string | undefined;

    if (!dueId) {
      return NextResponse.json({ error: "Missing due_id." }, { status: 400 });
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

    const { data: links, error: linkError } = await admin
      .from("unit_residents")
      .select("unit_id")
      .eq("profile_id", user.id);

    if (linkError || !links || links.length === 0) {
      return NextResponse.json({ error: "No unit linked to user." }, { status: 403 });
    }

    const unitIds = links.map((link) => link.unit_id);

    const { data: due, error: dueError } = await admin
      .from("dues")
      .select("id, unit_id, amount, amount_paid, description, billing_period, due_date")
      .eq("id", dueId)
      .single();

    if (dueError || !due) {
      return NextResponse.json({ error: "Dues record not found." }, { status: 404 });
    }

    if (!unitIds.includes(due.unit_id)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const amount = Math.max(Number(due.amount ?? 0) - Number(due.amount_paid ?? 0), 0);

    if (amount <= 0) {
      return NextResponse.json({ error: "This bill is already paid." }, { status: 409 });
    }

    const { data: existing } = await admin
      .from("payments")
      .select("id")
      .eq("unit_id", due.unit_id)
      .eq("status", "pending")
      .eq("description", due.description)
      .eq("due_date", due.due_date)
      .eq("billing_period", due.billing_period)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Payment request already submitted." },
        { status: 409 }
      );
    }

    const insertPayload = {
      unit_id: due.unit_id,
      recorded_by: user.id,
      status: "pending",
      amount,
      description: due.description ?? "Resident payment",
      billing_period: due.billing_period,
      due_date: due.due_date,
    };

    let { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({ ...insertPayload, transaction_type: "payment" })
      .select()
      .single();

    if (paymentError && (paymentError.message.includes("transaction_type") || paymentError.message.includes("Could not find the 'transaction_type'"))) {
      ({ data: payment, error: paymentError } = await admin
        .from("payments")
        .insert(insertPayload)
        .select()
        .single());
    }

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resident/payments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
