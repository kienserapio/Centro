import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type ResidentPayload = {
  id: string;
  unitId: string;
};

type CreatePaymentsBody = {
  residents: ResidentPayload[];
  amount: number;
  description: string;
  billingPeriod: string | null;
  dueDate: string | null;
};

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration." },
        { status: 500 }
      );
    }

    // Try to authenticate the caller. Prefer an Authorization bearer token
    // sent from the client. If not present, fall back to reading cookies
    // from the incoming request (createClient uses next/headers cookies()).
    const authHeader = request.headers.get("authorization");
    let user: any = null;

    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const {
          data: getUserData,
          error: getUserError,
        } = await serviceClient.auth.getUser(token as any);

        if (getUserError) {
          return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        user = getUserData?.user ?? null;
      } catch (err) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    } else {
      const authClient = await createClient();
      const {
        data: { user: cookieUser },
      } = await authClient.auth.getUser();

      user = cookieUser ?? null;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error: profileError } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const body = (await request.json()) as CreatePaymentsBody;

    if (!body?.residents?.length || !body.description || !body.amount) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Normalize amount to centavos (integer) and insert as 'charge' transaction
    const amountCentavos = Math.round(Number(body.amount) * 100);

    const paymentRows = body.residents.map((resident) => ({
      unit_id: resident.unitId,
      recorded_by: user.id,
      transaction_type: "charge",
      amount: amountCentavos,
      description: body.description,
      billing_period: body.billingPeriod || null,
      due_date: body.dueDate || null,
      reference_no: null,
    }));

    // Attempt primary insert (newer schema with `transaction_type`).
    try {
      const { data: inserted, error } = await serviceClient
        .from("payments")
        .insert(paymentRows)
        .select("id, unit_id, transaction_type, amount, description, billing_period, due_date");

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, count: (inserted ?? []).length, rows: inserted });
    } catch (err: any) {
      const msg = err?.message || String(err);

      // If the error indicates `transaction_type` is missing in this DB, retry
      // using legacy `status` column (older schema). Keep amount as centavos.
      if (msg.includes("transaction_type") || msg.includes("Could not find the 'transaction_type'")) {
        const fallbackRows = body.residents.map((resident) => ({
          unit_id: resident.unitId,
          recorded_by: user.id,
          status: "pending",
          amount: amountCentavos,
          description: body.description,
          billing_period: body.billingPeriod || null,
          due_date: body.dueDate || null,
          reference_no: null,
        }));

        const { data: insertedFallback, error: fallbackError } = await serviceClient
          .from("payments")
          .insert(fallbackRows)
          .select("id, unit_id, status, amount, description, billing_period, due_date");

        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message ?? "Failed to insert payments (fallback)." }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: (insertedFallback ?? []).length, rows: insertedFallback });
      }

      return NextResponse.json({ error: msg ?? "Failed to insert payments." }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration." }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    let user: any = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: getUserData, error: getUserError } = await serviceClient.auth.getUser(token as any);
      if (getUserError || !getUserData?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      user = getUserData.user;
    } else {
      const authClient = await createClient();
      const { data: { user: cookieUser } } = await authClient.auth.getUser();
      user = cookieUser ?? null;
    }

    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const url = new URL(request.url);
    const unitId = url.searchParams.get("unitId");
    const q = serviceClient.from("payments");
    let builder = q.select("id, unit_id, transaction_type, status, amount, description, billing_period, due_date, created_at").order("created_at", { ascending: false }).limit(50);
    if (unitId) builder = builder.eq("unit_id", unitId);

    const { data, error } = await builder;
    if (error) return NextResponse.json({ error: error.message ?? "Failed to query payments." }, { status: 500 });

    return NextResponse.json({ count: (data ?? []).length, rows: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
