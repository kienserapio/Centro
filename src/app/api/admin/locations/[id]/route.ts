import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use service role key for server-side admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await params;
    const body = await req.json();
    const { is_enabled } = body;

    console.log(
      `Updating venue ${id} with is_enabled=${is_enabled}`
    );

    const { data, error } = await supabase
      .from("enabled_locations")
      .update({ is_enabled })
      .eq("venue_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Update successful:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error toggling venue:", errorMessage);
    return NextResponse.json(
      { error: "Failed to toggle venue status", details: errorMessage },
      { status: 500 }
    );
  }
}
