/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  RESIDENTS LIST — Fetch resident profiles                │
 * │  GET: Returns all profiles WHERE role = 'resident'       │
 * │       Includes unit info via unit_residents + owner_id  │
 * │  Used by: Resident Directory page (/admin/residents)     │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/residents
 * Fetches all profiles with role='resident', joining units for address info.
 * Uses service role key to bypass RLS.
 */
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

        if (!supabaseUrl || !serviceRoleKey) {
            console.warn("[GET /api/admin/residents] Missing Supabase env vars.");
            return NextResponse.json(
                { error: "Missing Supabase configuration." },
                { status: 500 },
            );
        }

        const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

        const { data: residents, error } = await supabase
            .from("profiles")
            .select(`
        id,
        full_name,
        role,
        phone,
        avatar_url,
        is_active,
        created_at
    `)
            .eq("role", "resident")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[GET /api/admin/residents] Error:", error);
            return NextResponse.json(
                { error: error.message ?? "Failed to fetch residents." },
                { status: 500 },
            );
        }

        const profileIds = (residents ?? []).map((resident) => resident.id);

        let unitLinks: { profile_id: string; unit_id: string; resident_type: string | null }[] = [];
        if (profileIds.length > 0) {
            const { data: links, error: linksError } = await supabase
                .from("unit_residents")
                .select("profile_id, unit_id, resident_type")
                .in("profile_id", profileIds);

            if (linksError) {
                console.error("[GET /api/admin/residents] Unit residents lookup error:", linksError);
                return NextResponse.json(
                    { error: linksError.message ?? "Failed to fetch unit residents." },
                    { status: 500 },
                );
            }

            unitLinks = (links ?? []) as {
                profile_id: string;
                unit_id: string;
                resident_type: string | null;
            }[];
        }

        const linkedProfiles = new Set(unitLinks.map((link) => link.profile_id));
        const missingProfileIds = profileIds.filter((id) => !linkedProfiles.has(id));

        if (missingProfileIds.length > 0) {
            const { data: ownerUnits, error: ownerUnitsError } = await supabase
                .from("units")
                .select("id, owner_id")
                .in("owner_id", missingProfileIds);

            if (ownerUnitsError) {
                console.error("[GET /api/admin/residents] Owner units lookup error:", ownerUnitsError);
            } else {
                (ownerUnits ?? []).forEach((unit) => {
                    if (unit.owner_id) {
                        unitLinks.push({
                            profile_id: unit.owner_id,
                            unit_id: unit.id,
                            resident_type: "owner",
                        });
                    }
                });
            }
        }

        const unitIds = unitLinks
            .map((link) => link.unit_id)
            .filter((unitId): unitId is string => Boolean(unitId));

        let unitsById = new Map<string, {
            id: string;
            block_number: string | null;
            lot_number: string | null;
            phase: string | null;
            address_label: string | null;
            unit_type: "owned" | "rented" | "vacant" | null;
        }>();

        if (unitIds.length > 0) {
            const { data: units, error: unitsError } = await supabase
                .from("units")
                .select("id, block_number, lot_number, phase, address_label, unit_type")
                .in("id", unitIds);

            if (unitsError) {
                console.error("[GET /api/admin/residents] Units lookup error:", unitsError);
            } else {
                unitsById = new Map((units ?? []).map((unit) => [unit.id, unit]));
            }
        }

        const unitIdByProfileId = new Map(
            unitLinks.map((link) => [link.profile_id, link.unit_id]),
        );
        const residentTypeByProfileId = new Map(
            unitLinks.map((link) => [link.profile_id, link.resident_type]),
        );

        const payload = (residents ?? []).map((resident) => {
            const unitId = unitIdByProfileId.get(resident.id) ?? null;

            return {
                ...resident,
                unit_id: unitId,
                units: unitId ? unitsById.get(unitId) ?? null : null,
                resident_type: residentTypeByProfileId.get(resident.id) ?? null,
            };
        });

        return NextResponse.json(payload);
    } catch (err) {
        console.error("[GET /api/admin/residents] Internal error:", err);
        return NextResponse.json({ error: "Internal error." }, { status: 500 });
    }
}
