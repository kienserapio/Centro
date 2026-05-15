import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all active guard schedules with guard info
    const { data: schedules = [], error } = await supabase
      .from("guard_schedules")
      .select(`
        id,
        guard_id,
        shift_date,
        shift_start_time,
        shift_end_time,
        post_assignment,
        notes,
        is_active,
        created_at,
        profiles(id, full_name, username, phone)
      `)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("shift_date", { ascending: false });

    if (error) {
      console.error("Error fetching guard schedules:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      schedules: schedules || [],
      total: schedules?.length || 0,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guard_id, shift_date, shift_start_time, shift_end_time, post_assignment, notes } = body;

    if (!guard_id || !shift_date || !shift_start_time || !shift_end_time) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: schedule, error } = await supabase
      .from("guard_schedules")
      .insert({
        guard_id,
        shift_date,
        shift_start_time,
        shift_end_time,
        post_assignment,
        notes,
        is_active: true,
      })
      .select();

    if (error) {
      console.error("Error creating guard schedule:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ schedule: schedule?.[0], success: true }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
