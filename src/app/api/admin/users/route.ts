/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  ALL USERS LIST — Fetch every profile (all roles)        │
 * │  GET: Returns all profiles regardless of role            │
 * │  Used by: Roles & Permissions page (/admin/roles)        │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/users
 * Fetches all user profiles from the database.
 * Uses the service role key to bypass RLS so all profiles are always returned.
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

        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, full_name, role, phone, avatar_url, is_active, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[GET /api/admin/users] Error fetching profiles:", error);
            return NextResponse.json(
                { error: "Failed to fetch users." },
                { status: 500 }
            );
        }

        return NextResponse.json(profiles ?? []);
    } catch (err) {
        console.error("[GET /api/admin/users] Internal error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
