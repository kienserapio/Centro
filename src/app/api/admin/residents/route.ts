/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  RESIDENTS LIST — Fetch resident-role profiles           │
 * │  GET: Returns all profiles WHERE role = 'resident'       │
 * │       Joins the units table for address info             │
 * │  Used by: Resident Directory page (/admin/residents)     │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const USE_DEMO_RESIDENTS = process.env.USE_DEMO_RESIDENTS === "true";

const DEMO_RESIDENTS = [
    {
        id: "demo-resident-1",
        full_name: "Juan Dela Cruz",
        role: "resident",
        phone: "+63 912 345 6781",
        avatar_url: null,
        is_active: true,
        created_at: "2026-01-04T08:30:00.000Z",
        units: {
            id: "demo-unit-1",
            block_number: "12",
            lot_number: "04",
            phase: "Phase 1",
            address_label: "Mabini Street",
            unit_type: "owned",
        },
    },
    {
        id: "demo-resident-2",
        full_name: "Maria Santos",
        role: "resident",
        phone: "+63 917 123 4402",
        avatar_url: null,
        is_active: true,
        created_at: "2026-01-10T10:15:00.000Z",
        units: {
            id: "demo-unit-2",
            block_number: "14",
            lot_number: "09",
            phase: "Phase 2",
            address_label: "Acacia Lane",
            unit_type: "rented",
        },
    },
    {
        id: "demo-resident-3",
        full_name: "Kevin Reyes",
        role: "resident",
        phone: "+63 998 881 0033",
        avatar_url: null,
        is_active: true,
        created_at: "2026-01-13T09:45:00.000Z",
        units: {
            id: "demo-unit-3",
            block_number: "15",
            lot_number: "02",
            phase: "Phase 3",
            address_label: "Sampaguita Drive",
            unit_type: "owned",
        },
    },
    {
        id: "demo-resident-4",
        full_name: "Alyssa Gomez",
        role: "resident",
        phone: "+63 915 771 2288",
        avatar_url: null,
        is_active: true,
        created_at: "2026-01-17T14:20:00.000Z",
        units: {
            id: "demo-unit-4",
            block_number: "16",
            lot_number: "07",
            phase: "Phase 3",
            address_label: "Mahogany Road",
            unit_type: "rented",
        },
    },
];

function getDemoResidents() {
    return DEMO_RESIDENTS;
}

/**
 * GET /api/admin/residents
 * Fetches all profiles with role='resident', joining units for address info.
 * Uses service role key to bypass RLS.
 */
export async function GET() {
    try {
        if (USE_DEMO_RESIDENTS) {
            return NextResponse.json(getDemoResidents());
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.warn("[GET /api/admin/residents] Missing Supabase env vars. Falling back to demo residents.");
            return NextResponse.json(getDemoResidents());
        }

        const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

                // Fetch resident profiles — join unit_residents + units + phases
                const { data: residents, error } = await supabase
                        .from("profiles")
                        .select(`
                id,
                full_name,
                username,
                email,
                role,
                phone,
                avatar_url,
                is_active,
                created_at,
                unit_residents:unit_residents (
                    resident_type,
                    is_primary,
                    unit:units (
                        id,
                        block_number,
                        lot_number,
                        address_label,
                        unit_type,
                        phase:phases (name)
                    )
                )
            `)
                        .eq("role", "resident")
                        .order("created_at", { ascending: false });

        if (error) {
            console.error("[GET /api/admin/residents] Error:", error);
            return NextResponse.json(getDemoResidents());
        }

        const normalized = (residents ?? []).map((row) => {
            const links = Array.isArray(row.unit_residents) ? row.unit_residents : [];
            const primary = links.find((link) => link.is_primary) ?? links[0];
            const unit = primary?.unit ?? null;
            const rawPhaseName = unit?.phase?.name ?? null;
            const phaseName = rawPhaseName
                ? (rawPhaseName.toLowerCase().startsWith("phase")
                    ? rawPhaseName
                    : `Phase ${rawPhaseName}`)
                : null;

            const fallbackName = row.full_name || row.username || row.email || "—";

            return {
                id: row.id,
                full_name: fallbackName,
                email: row.email ?? null,
                username: row.username ?? null,
                role: row.role,
                phone: row.phone,
                avatar_url: row.avatar_url,
                is_active: row.is_active,
                created_at: row.created_at,
                units: unit
                    ? {
                        id: unit.id,
                        block_number: unit.block_number,
                        lot_number: unit.lot_number,
                        phase: phaseName,
                        address_label: unit.address_label,
                        unit_type: unit.unit_type,
                    }
                    : null,
            };
        });

        return NextResponse.json(normalized);
    } catch (err) {
        console.error("[GET /api/admin/residents] Internal error:", err);
        return NextResponse.json(getDemoResidents());
    }
}
