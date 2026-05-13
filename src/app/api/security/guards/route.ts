import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all guards (users with 'guard' role)
    const { data: guards, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, email, phone, avatar_url, is_active")
      .eq("role", "guard")
      .is("deleted_at", true);

    if (error) {
      console.error("Error fetching guards:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      guards: guards || [],
      total: guards?.length || 0,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
