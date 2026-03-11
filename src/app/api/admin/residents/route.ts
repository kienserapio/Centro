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

/**
 * GET /api/admin/residents
 * Fetches all profiles with role='resident', joining units for address info.
 * Uses service role key to bypass RLS.
 */
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing env variables." },
                { status: 500 }
            );
        }

        const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

        // Fetch resident profiles — join units table for address
        const { data: residents, error } = await supabase
            .from("profiles")
            .select(`
        id,
        full_name,
        role,
        phone,
        avatar_url,
        is_active,
        created_at,
        units:unit_id (
          id,
          block_number,
          lot_number,
          phase,
          address_label
        )
      `)
            .eq("role", "resident")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[GET /api/admin/residents] Error:", error);
            return NextResponse.json(
                { error: "Failed to fetch residents." },
                { status: 500 }
            );
        }

        return NextResponse.json(residents ?? []);
    } catch (err) {
        console.error("[GET /api/admin/residents] Internal error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
