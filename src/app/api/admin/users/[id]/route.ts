/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  USER BY ID — Update & Delete a single user              │
 * │  PATCH:  Update profile fields (full_name, role, phone)  │
 * │  DELETE: Remove user from auth.users (cascades to        │
 * │          profiles via FK)                                 │
 * │  Used by: Roles page & Resident Directory (edit/delete)  │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const VALID_ROLES = ["resident", "admin", "guard"] as const;
const VALID_RESIDENT_TYPES = ["owner", "tenant"] as const;

/**
 * PATCH /api/admin/users/[id]
 * Updates a user's profile in the profiles table.
 * Body: { full_name?, role?, phone?, resident_type? }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        console.log(`[PATCH /api/admin/users/${id}] Body:`, body);

        // Build the update object from allowed fields only
        const updates: Record<string, unknown> = {};
        if (body.full_name !== undefined) updates.full_name = body.full_name;
        if (body.phone !== undefined) updates.phone = body.phone;
        let normalizedResidentType: "owner" | "tenant" | null = null;

        if (body.role !== undefined) {
            const normalizedRole = String(body.role).toLowerCase();
            if (!VALID_ROLES.includes(normalizedRole as typeof VALID_ROLES[number])) {
                return NextResponse.json(
                    { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
                    { status: 400 }
                );
            }
            updates.role = normalizedRole;
        }

        if (body.resident_type !== undefined) {
            const candidate = String(body.resident_type).toLowerCase();
            if (!VALID_RESIDENT_TYPES.includes(candidate as typeof VALID_RESIDENT_TYPES[number])) {
                return NextResponse.json(
                    { error: `Invalid resident_type. Must be one of: ${VALID_RESIDENT_TYPES.join(", ")}` },
                    { status: 400 }
                );
            }
            normalizedResidentType = candidate as "owner" | "tenant";
        }

        if (Object.keys(updates).length === 0 && !normalizedResidentType) {
            return NextResponse.json(
                { error: "No valid fields to update." },
                { status: 400 }
            );
        }

        let data: unknown = null;
        if (Object.keys(updates).length > 0) {
            const profileUpdateResult = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            data = profileUpdateResult.data;

            if (profileUpdateResult.error) {
                console.error(`[PATCH /api/admin/users/${id}] Error:`, profileUpdateResult.error);
                return NextResponse.json(
                    { error: profileUpdateResult.error.message ?? "Failed to update user." },
                    { status: 500 }
                );
            }
        }

        if (normalizedResidentType) {
            const { data: profileWithUnit, error: profileFetchError } = await supabase
                .from("profiles")
                .select("unit_id")
                .eq("id", id)
                .single();

            if (profileFetchError) {
                console.error(`[PATCH /api/admin/users/${id}] Unit lookup error:`, profileFetchError);
                return NextResponse.json(
                    { error: profileFetchError.message ?? "Failed to fetch resident unit." },
                    { status: 500 }
                );
            }

            if (profileWithUnit?.unit_id) {
                const { data: unitRow, error: unitReadError } = await supabase
                    .from("units")
                    .select("owner_id")
                    .eq("id", profileWithUnit.unit_id)
                    .single();

                if (unitReadError) {
                    console.error(`[PATCH /api/admin/users/${id}] Unit read error:`, unitReadError);
                    return NextResponse.json(
                        { error: unitReadError.message ?? "Failed to read unit data." },
                        { status: 500 }
                    );
                }

                const unitUpdates: {
                    unit_type: "owned" | "rented";
                    owner_id?: string | null;
                } = {
                    unit_type: normalizedResidentType === "owner" ? "owned" : "rented",
                };

                if (normalizedResidentType === "owner") {
                    unitUpdates.owner_id = id;
                } else if (unitRow?.owner_id === id) {
                    unitUpdates.owner_id = null;
                }

                const { error: unitUpdateError } = await supabase
                    .from("units")
                    .update(unitUpdates)
                    .eq("id", profileWithUnit.unit_id);

                if (unitUpdateError) {
                    console.error(`[PATCH /api/admin/users/${id}] Unit update error:`, unitUpdateError);
                    return NextResponse.json(
                        { error: unitUpdateError.message ?? "Failed to update resident occupancy." },
                        { status: 500 }
                    );
                }
            }
        }

        console.log(`[PATCH /api/admin/users/${id}] Updated`);
        return NextResponse.json(data ?? { id, updated: true });
    } catch (err) {
        console.error("[PATCH /api/admin/users] Internal error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Deletes a user from auth.users (which cascades to profiles via trigger/FK).
 * Requires the service role key since auth.admin is needed.
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log(`[DELETE /api/admin/users/${id}] Deleting user...`);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing env variables." },
                { status: 500 }
            );
        }

        const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey);

        // Delete from auth.users — the profiles row should cascade/be handled by trigger
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            console.error(`[DELETE /api/admin/users/${id}] Error:`, error);
            return NextResponse.json(
                { error: error.message ?? "Failed to delete user." },
                { status: 500 }
            );
        }

        console.log(`[DELETE /api/admin/users/${id}] Deleted`);
        return NextResponse.json({ message: "User deleted successfully." });
    } catch (err) {
        console.error("[DELETE /api/admin/users] Internal error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
