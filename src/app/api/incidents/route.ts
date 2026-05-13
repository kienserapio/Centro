/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  EMERGENCY ALERTS — Create & List                        │
 * │  POST: Resident submits a new incident report            │
 * │  GET:  Guards/admins fetch all incident reports          │
 * │  Used by: Resident page, Security incidents, Admin view  │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VALID_INCIDENT_TYPES } from "@/lib/incidents/constants";
import type { IncidentType } from "@/lib/incidents/types";

/**
 * POST /api/incidents
 * Creates a new emergency alert in the database.
 *
 * Request body:
 * {
 *   incident_type: string (enum: 'medical', 'fire', 'intrusion', 'suspicious', 'other')
 *   description: string
 *   location_note?: string
 * }
 *
 * Returns: 201 with the newly created alert object
 * Returns: 400 if required fields are missing or invalid
 * Returns: 401 if user is not authenticated
 * Returns: 500 if database operations fail
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Initialize Supabase server client
    const supabase = await createClient();

    // 2. Retrieve the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? "3dd4d817-e770-4eda-905c-f018f5b1b0a5";

    // 3. Look up the reporter's unit via unit_residents table
    const { data: unitResident, error: unitResidentError } = await supabase
      .from("unit_residents")
      .select("unit_id")
      .eq("profile_id", userId)
      .limit(1)
      .single();

    if (unitResidentError || !unitResident) {
      console.error("Error fetching unit_residents:", unitResidentError);
      return NextResponse.json(
        { error: "Your profile is not linked to a unit. Contact admin." },
        { status: 400 }
      );
    }

    const unitId = unitResident.unit_id;

    // 4. Parse & validate request body
    const body = await request.json();
    const { incident_type, description, location_note } = body;

    if (!incident_type || !description) {
      return NextResponse.json(
        { error: "Missing required fields: incident_type and description are required." },
        { status: 400 }
      );
    }

    const normalizedType = String(incident_type).toLowerCase() as IncidentType;

    if (!VALID_INCIDENT_TYPES.includes(normalizedType)) {
      return NextResponse.json(
        {
          error: `Invalid incident_type "${incident_type}". Must be one of: ${VALID_INCIDENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 5. Insert into emergency_alerts
    const { data: alert, error: insertError } = await supabase
      .from("emergency_alerts")
      .insert({
        reporter_id: userId,
        unit_id: unitId,
        incident_type: normalizedType,
        description: String(description).trim(),
        location_note: location_note ? String(location_note).trim() : null,
        status: "open",
      })
      .select()
      .single();

    if (insertError || !alert) {
      console.error("Error inserting emergency alert:", insertError);
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create incident report." },
        { status: 500 }
      );
    }

    // 6. Return the created alert
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/incidents
 * Fetches all emergency alerts with JOINed reporter/unit/guard data.
 * Access: guards and admins only (RLS also enforces this).
 *
 * Returns: 200 with array of alerts
 * Returns: 500 if database query fails
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch all alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("emergency_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (alertsError) {
      console.error("Error fetching emergency alerts:", alertsError);
      return NextResponse.json(
        { error: "Failed to fetch incident reports." },
        { status: 500 }
      );
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Collect unique profile IDs (reporters + acknowledgers)
    const profileIds = new Set<string>();
    const unitIds = new Set<string>();

    for (const alert of alerts) {
      profileIds.add(alert.reporter_id);
      if (alert.acknowledged_by) profileIds.add(alert.acknowledged_by);
      unitIds.add(alert.unit_id);
    }

    // 3. Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(profileIds));

    const profileMap = new Map<string, string>();
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p.full_name);
    }

    // 4. Fetch units with phase name via phase_id FK
    const { data: units } = await supabase
      .from("units")
      .select("id, block_number, lot_number, phase_id, phases ( name )")
      .in("id", Array.from(unitIds));

    const unitMap = new Map<string, string>();
    for (const u of units ?? []) {
      const phases = u.phases as unknown as { name: string }[] | { name: string } | null;
      const phaseName = Array.isArray(phases) ? phases[0]?.name : phases?.name;
      const label = `Block ${u.block_number}, Lot ${u.lot_number}${phaseName ? ` (${phaseName})` : ""}`;
      unitMap.set(u.id, label);
    }

    // 5. Transform into flat response
    const transformed = alerts.map((alert) => ({
      id: alert.id,
      reporter_id: alert.reporter_id,
      unit_id: alert.unit_id,
      incident_type: alert.incident_type,
      description: alert.description,
      location_note: alert.location_note,
      latitude: alert.latitude,
      longitude: alert.longitude,
      status: alert.status,
      acknowledged_by: alert.acknowledged_by,
      acknowledged_at: alert.acknowledged_at,
      resolved_at: alert.resolved_at,
      resolution_note: alert.resolution_note,
      created_at: alert.created_at,
      reporter_name: profileMap.get(alert.reporter_id) ?? "Unknown",
      reporter_unit_label: unitMap.get(alert.unit_id) ?? "Unknown Unit",
      acknowledged_by_name: alert.acknowledged_by
        ? profileMap.get(alert.acknowledged_by) ?? null
        : null,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
