import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching venues from Supabase...");

    // Use service role key for server-side admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, fetch venues
    const { data: venuesData, error: venuesError } = await supabase
      .from("venues")
      .select("id, name, description, category")
      .order("name", { ascending: true });

    if (venuesError) {
      console.error("Error fetching venues:", venuesError);
      throw venuesError;
    }

    console.log("Venues fetched:", venuesData?.length || 0, venuesData);

    // Then, fetch enabled_locations
    const { data: enabledLocationsData, error: enabledLocationsError } =
      await supabase.from("enabled_locations").select("venue_id, is_enabled");

    if (enabledLocationsError) {
      console.error("Error fetching enabled_locations:", enabledLocationsError);
      throw enabledLocationsError;
    }

    console.log("Enabled locations fetched:", enabledLocationsData?.length || 0, enabledLocationsData);

    // Map venues with their enabled status
    const venues = (venuesData || []).map((venue: any) => {
      const enabledLocation = (enabledLocationsData || []).find(
        (el: any) => el.venue_id === venue.id
      );
      return {
        id: venue.id,
        name: venue.name,
        description: venue.description,
        category: venue.category,
        is_enabled: enabledLocation?.is_enabled || false,
      };
    });

    console.log("Final venues list:", venues);
    return NextResponse.json({ 
      venues, 
      debug: { 
        venuesCount: venuesData?.length || 0, 
        enabledLocationsCount: enabledLocationsData?.length || 0 
      } 
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching venues:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch venues", details: errorMessage },
      { status: 500 }
    );
  }
}
