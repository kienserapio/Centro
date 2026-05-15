import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { shift_start_time, shift_end_time, post_assignment, notes, is_active } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: schedule, error } = await supabase
      .from("guard_schedules")
      .update({
        ...(shift_start_time && { shift_start_time }),
        ...(shift_end_time && { shift_end_time }),
        ...(post_assignment && { post_assignment }),
        ...(notes !== undefined && { notes }),
        ...(is_active !== undefined && { is_active }),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating guard schedule:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ schedule: schedule?.[0], success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("guard_schedules")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error deleting guard schedule:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
