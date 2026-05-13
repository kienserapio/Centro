import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch units with phases and owner info
    const { data: units, error } = await supabase
      .from("units")
      .select(
        `
        id,
        block_number,
        lot_number,
        address_label,
        unit_type,
        phase_id,
        phases(id, name),
        owner_id,
        created_at,
        updated_at
      `
      )
      .is("deleted_at", true);

    if (error) {
      console.error("Error fetching units:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Fetch unit residents with profile info
    const { data: residents, error: residentsError } = await supabase
      .from("unit_residents")
      .select(`
        unit_id,
        profile_id,
        resident_type,
        is_primary,
        profiles(id, full_name, username, phone)
      `);

    if (residentsError) {
      console.error("Error fetching residents:", residentsError);
      return Response.json(
        { error: residentsError.message },
        { status: 500 }
      );
    }

    // Map residents by unit_id for easier lookup
    const residentsByUnit = residents.reduce(
      (acc, resident) => {
        if (!acc[resident.unit_id]) {
          acc[resident.unit_id] = [];
        }
        acc[resident.unit_id].push(resident);
        return acc;
      },
      {} as Record<string, typeof residents>
    );

    // Transform units to match frontend format
    const transformedUnits = units.map((unit: any) => {
      const unitResidents = residentsByUnit[unit.id] || [];
      const primaryResident = unitResidents.find((r: any) => r.is_primary);
      const residentName = primaryResident?.profiles?.full_name;
      const contact = primaryResident?.profiles?.phone;

      return {
        id: unit.id,
        block: unit.block_number,
        lot: unit.lot_number,
        phase: unit.phases?.name || "Unknown Phase",
        status: unit.unit_type === "vacant" ? "vacant" : "occupied",
        residentName: residentName,
        contact: contact,
        notes: [] as any[], // Can be extended with special notes from profiles
      };
    });

    return Response.json({
      units: transformedUnits,
      total: transformedUnits.length,
      debug: {
        unitsCount: units.length,
        residentsCount: residents.length,
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
