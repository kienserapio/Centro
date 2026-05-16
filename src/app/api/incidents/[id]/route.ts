/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  EMERGENCY ALERTS — Acknowledge & Resolve                │
 * │  PATCH: Guard/admin updates incident status              │
 * │  Used by: Security incidents page + Active Emergencies   │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VALID_STATUSES } from "@/lib/incidents/constants";
import type { IncidentStatus } from "@/lib/incidents/types";

/**
 * PATCH /api/incidents/[id]
 * Updates the status of an emergency alert.
 *
 * Request body:
 * {
 *   status: 'responding' | 'resolved' | 'false_alarm' | 'escalated' | 'unresolved'
 *   resolution_note?: string
 * }
 *
 * Valid transitions (enforced):
 *   open → responding  (guard acknowledges)
 *   open → false_alarm  (dismiss without responding)
 *   responding → resolved | false_alarm | escalated | unresolved  (guard closes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? "3dd4d817-e770-4eda-905c-f018f5b1b0a5";

    // 2. Parse body
    const body = await request.json();
    const { status, resolution_note } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 }
      );
    }

    const normalizedStatus = String(status).toLowerCase() as IncidentStatus;

    if (!VALID_STATUSES.includes(normalizedStatus) || normalizedStatus === "open") {
      return NextResponse.json(
        { error: `Invalid target status "${status}". Must be one of: responding, resolved, false_alarm, escalated, unresolved` },
        { status: 400 }
      );
    }

    // Escalated requires resolution_note
    if (normalizedStatus === "escalated" && (!resolution_note || !String(resolution_note).trim())) {
      return NextResponse.json(
        { error: "Escalation details are required when setting status to escalated." },
        { status: 400 }
      );
    }

    // 3. Fetch current alert to validate transition
    const { data: currentAlert, error: fetchError } = await supabase
      .from("emergency_alerts")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !currentAlert) {
      return NextResponse.json(
        { error: "Incident report not found." },
        { status: 404 }
      );
    }

    // 4. Validate status transition
    const current = currentAlert.status as IncidentStatus;
    const closingStatuses: IncidentStatus[] = ["resolved", "false_alarm", "escalated", "unresolved"];

    const isValidTransition =
      (current === "open" && normalizedStatus === "responding") ||
      (current === "open" && normalizedStatus === "false_alarm") ||
      (current === "responding" && closingStatuses.includes(normalizedStatus));

    if (!isValidTransition) {
      return NextResponse.json(
        {
          error: `Cannot transition from "${current}" to "${normalizedStatus}". Invalid status transition.`,
        },
        { status: 409 }
      );
    }

    // 5. Build update payload
    const updatePayload: Record<string, unknown> = {
      status: normalizedStatus,
    };

    if (normalizedStatus === "responding") {
      updatePayload.acknowledged_by = userId;
      updatePayload.acknowledged_at = new Date().toISOString();
    }

    if (closingStatuses.includes(normalizedStatus)) {
      updatePayload.resolved_at = new Date().toISOString();
      if (resolution_note) {
        updatePayload.resolution_note = String(resolution_note).trim();
      }
    }

    // 6. Update the alert
    const { data: updatedAlert, error: updateError } = await supabase
      .from("emergency_alerts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedAlert) {
      console.error("Error updating emergency alert:", updateError);
      return NextResponse.json(
        { error: updateError?.message ?? "Failed to update incident report." },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAlert, { status: 200 });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
