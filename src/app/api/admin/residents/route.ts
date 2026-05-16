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
            return NextResponse.json(
                { error: error.message ?? "Failed to fetch residents." },
                { status: 500 },
            );
        }

        const normalized = (residents as unknown as Array<{
            id: string;
            full_name: string | null;
            username: string | null;
            email: string | null;
            role: string | null;
            phone: string | null;
            avatar_url: string | null;
            is_active: boolean | null;
            created_at: string;
            unit_residents: Array<{
                is_primary: boolean | null;
                unit: {
                    id: string;
                    block_number: string | null;
                    lot_number: string | null;
                    address_label: string | null;
                    unit_type: string | null;
                    phase: { name: string | null } | null;
                } | null;
            }>;
        }> ?? []).map((row) => {
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
        return NextResponse.json({ error: "Internal error." }, { status: 500 });
    }
}
