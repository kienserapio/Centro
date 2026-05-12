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
        if (body.email !== undefined) updates.email = body.email;
        if (body.username !== undefined) updates.username = body.username;
        let normalizedResidentType: "owner" | "tenant" | null = null;

        const parsedUnit = body.unit && typeof body.unit === "object"
            ? (body.unit as {
                phase?: string | null;
                block_number?: string;
                lot_number?: string;
                address_label?: string;
            })
            : null;

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
            updates.resident_type = normalizedResidentType;
        }

        const emailValue = typeof body.email === "string" ? body.email.trim() : "";
        const passwordValue = typeof body.password === "string" ? body.password.trim() : "";
        const hasAuthUpdate = !!emailValue || !!passwordValue;
        const hasProfileUpdate = Object.keys(updates).length > 0;
        const hasUnitUpdate = !!parsedUnit;

        if (!hasProfileUpdate && !normalizedResidentType && !hasAuthUpdate && !hasUnitUpdate) {
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

        if (hasAuthUpdate) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !serviceRoleKey) {
                return NextResponse.json(
                    { error: "Server misconfiguration: missing env variables." },
                    { status: 500 }
                );
            }

            const admin = createServiceClient(supabaseUrl, serviceRoleKey);
            const authUpdates: { email?: string; password?: string } = {};

            if (emailValue) authUpdates.email = emailValue;
            if (passwordValue) authUpdates.password = passwordValue;

            const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, authUpdates);

            if (authUpdateError) {
                console.error(`[PATCH /api/admin/users/${id}] Auth update error:`, authUpdateError);
                return NextResponse.json(
                    { error: authUpdateError.message ?? "Failed to update auth user." },
                    { status: 500 }
                );
            }
        }

        if (normalizedResidentType) {
            const { data: residentLinks, error: residentLinkError } = await supabase
                .from("unit_residents")
                .select("unit_id, is_primary")
                .eq("profile_id", id);

            if (residentLinkError) {
                console.error(`[PATCH /api/admin/users/${id}] Unit lookup error:`, residentLinkError);
                return NextResponse.json(
                    { error: residentLinkError.message ?? "Failed to fetch resident unit." },
                    { status: 500 }
                );
            }

            if (residentLinks && residentLinks.length > 0) {
                const primaryLink = residentLinks.find((link) => link.is_primary) ?? residentLinks[0];

                const { error: linkUpdateError } = await supabase
                    .from("unit_residents")
                    .update({ resident_type: normalizedResidentType })
                    .eq("profile_id", id);

                if (linkUpdateError) {
                    console.error(`[PATCH /api/admin/users/${id}] unit_residents update error:`, linkUpdateError);
                    return NextResponse.json(
                        { error: linkUpdateError.message ?? "Failed to update resident type." },
                        { status: 500 }
                    );
                }

                const { data: unitRow, error: unitReadError } = await supabase
                    .from("units")
                    .select("owner_id")
                    .eq("id", primaryLink.unit_id)
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
                    .eq("id", primaryLink.unit_id);

                if (unitUpdateError) {
                    console.error(`[PATCH /api/admin/users/${id}] Unit update error:`, unitUpdateError);
                    return NextResponse.json(
                        { error: unitUpdateError.message ?? "Failed to update resident occupancy." },
                        { status: 500 }
                    );
                }
            }
        }

        if (parsedUnit) {
            if (!normalizedResidentType) {
                return NextResponse.json(
                    { error: "resident_type is required when updating unit details." },
                    { status: 400 }
                );
            }

            const cleanBlock = String(parsedUnit.block_number ?? "").replace(/^Block\s*/i, "").trim();
            const cleanLot = String(parsedUnit.lot_number ?? "").replace(/^Lot\s*/i, "").trim();
            const cleanPhase = parsedUnit.phase
                ? String(parsedUnit.phase).replace(/^Phase\s*/i, "").trim()
                : null;

            if (!cleanBlock || !cleanLot) {
                return NextResponse.json(
                    { error: "Block and lot are required for unit updates." },
                    { status: 400 }
                );
            }

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !serviceRoleKey) {
                return NextResponse.json(
                    { error: "Server misconfiguration: missing env variables." },
                    { status: 500 }
                );
            }

            const admin = createServiceClient(supabaseUrl, serviceRoleKey);
            const phaseLabel = cleanPhase ? `Phase ${cleanPhase}` : null;
            const addressLabel = parsedUnit.address_label?.trim() || `Block ${cleanBlock}, Lot ${cleanLot}`;
            const unitType = normalizedResidentType === "owner" ? "owned" : "rented";

            let phaseId: string | null = null;
            if (cleanPhase) {
                const { data: foundPhase, error: phaseReadError } = await admin
                    .from("phases")
                    .select("id")
                    .eq("name", phaseLabel)
                    .single();

                if (!phaseReadError && foundPhase) {
                    phaseId = foundPhase.id;
                } else {
                    const { data: legacyPhase, error: legacyReadError } = await admin
                        .from("phases")
                        .select("id")
                        .eq("name", cleanPhase)
                        .single();

                    if (!legacyReadError && legacyPhase) {
                        phaseId = legacyPhase.id;
                    } else {
                        const { data: insertedPhase, error: phaseInsertError } = await admin
                            .from("phases")
                            .insert({ name: phaseLabel })
                            .select("id")
                            .single();

                        if (phaseInsertError) {
                            console.error(`[PATCH /api/admin/users/${id}] Phase create failed:`, phaseInsertError);
                        } else {
                            phaseId = insertedPhase.id;
                        }
                    }
                }
            }

            let unitId: string | null = null;
            const unitLookup = admin
                .from("units")
                .select("id, owner_id, phase_id")
                .eq("block_number", cleanBlock)
                .eq("lot_number", cleanLot)
                .limit(1);

            const { data: foundUnits, error: lookupError } = await unitLookup;

            if (lookupError) {
                console.error(`[PATCH /api/admin/users/${id}] Unit lookup failed:`, lookupError);
            } else {
                unitId = foundUnits?.[0]?.id ?? null;
            }

            if (!unitId) {
                const { data: insertedUnit, error: insertUnitError } = await admin
                    .from("units")
                    .insert({
                        block_number: cleanBlock,
                        lot_number: cleanLot,
                        phase_id: phaseId,
                        address_label: addressLabel,
                        unit_type: unitType,
                        owner_id: normalizedResidentType === "owner" ? id : null,
                    })
                    .select("id")
                    .single();

                if (insertUnitError) {
                    console.error(`[PATCH /api/admin/users/${id}] Unit create failed:`, insertUnitError);
                } else {
                    unitId = insertedUnit.id;
                }
            } else {
                const unitRow = foundUnits?.[0] ?? null;

                const unitUpdates: {
                    unit_type: "owned" | "rented";
                    owner_id?: string | null;
                    phase_id?: string | null;
                    address_label?: string;
                } = {
                    unit_type: unitType,
                    address_label: addressLabel,
                };

                if (phaseId) {
                    unitUpdates.phase_id = phaseId;
                }

                if (normalizedResidentType === "owner") {
                    unitUpdates.owner_id = id;
                } else if (unitRow?.owner_id === id) {
                    unitUpdates.owner_id = null;
                }

                const { error: unitUpdateError } = await admin
                    .from("units")
                    .update(unitUpdates)
                    .eq("id", unitId);

                if (unitUpdateError) {
                    console.error(`[PATCH /api/admin/users/${id}] Unit update failed:`, unitUpdateError);
                }
            }

            if (unitId) {
                const { error: clearPrimaryError } = await admin
                    .from("unit_residents")
                    .update({ is_primary: false })
                    .eq("profile_id", id)
                    .neq("unit_id", unitId);

                if (clearPrimaryError) {
                    console.error(`[PATCH /api/admin/users/${id}] Clear primary failed:`, clearPrimaryError);
                }

                const { error: linkError } = await admin
                    .from("unit_residents")
                    .upsert({
                        unit_id: unitId,
                        profile_id: id,
                        resident_type: normalizedResidentType,
                        is_primary: true,
                    }, { onConflict: "unit_id,profile_id" });

                if (linkError) {
                    console.error(`[PATCH /api/admin/users/${id}] unit_residents upsert failed:`, linkError);
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
