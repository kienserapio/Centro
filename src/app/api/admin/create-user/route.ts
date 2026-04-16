/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  CREATE USER — Register a new Supabase auth user         │
 * │  POST: Creates user in auth.users via service role key   │
 * │        Trigger auto-creates a profiles row               │
 * │  Used by: Add User modal (Roles) & Add Resident modal    │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Must match the user_role enum in the database
const VALID_ROLES = ["resident", "admin", "guard"] as const;
type UserRole = (typeof VALID_ROLES)[number];
const VALID_RESIDENT_TYPES = ["owner", "tenant"] as const;
type ResidentType = (typeof VALID_RESIDENT_TYPES)[number];

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * POST /api/admin/create-user
 * Allows an authenticated admin to manually register a new user.
 *
 * Uses the Supabase Service Role Key to call `auth.admin.createUser`,
 * which bypasses email confirmation. The database trigger `handle_new_user`
 * will automatically create a row in `public.profiles` using the metadata
 * keys: username, full_name, role, phone.
 *
 * Request body:
 * {
 *   email:     string  (required)
 *   password:  string  (required, min 6 characters)
 *   full_name: string  (required)
 *   username:  string  (required)
 *   role:      string  (required, one of 'resident', 'admin', 'guard')
 *   phone:     string  (optional)
 * }
 *
 * Returns: 201 with created user data on success
 * Returns: 400 if required fields are missing or invalid
 * Returns: 401 if the requester is not authenticated (skipped in dev)
 * Returns: 403 if the requester is not an admin (skipped in dev)
 * Returns: 409 if the user already exists
 * Returns: 500 if user creation fails
 */
export async function POST(request: NextRequest) {
    try {
        console.log("\n========== [CREATE-USER] START ==========");

        // ── 1. Check environment variables ───────────────────────────────────
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log("[CREATE-USER] ENV check:");
        console.log("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ loaded" : "❌ MISSING");
        console.log("  SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? `✅ loaded (${serviceRoleKey.slice(0, 10)}...)` : "❌ MISSING");

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Supabase environment variables." },
                { status: 500 }
            );
        }

        // ── 2. Authenticate the requester ────────────────────────────────────
        const supabase = await createClient();

        const {
            data: { user: requester },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("[CREATE-USER] Auth result:");
        console.log("  requester:", requester ? `✅ ${requester.id}` : "❌ null");
        if (authError) console.log("  authError:", authError.message);

        if (!requester) {
            if (IS_DEV) {
                console.log("  ⚠️  DEV MODE — skipping auth & admin check");
            } else {
                return NextResponse.json(
                    { error: "Unauthorized. You must be logged in." },
                    { status: 401 }
                );
            }
        }

        // ── 3. Authorize: requester must be an admin ─────────────────────────
        if (requester) {
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", requester.id)
                .single();

            console.log("[CREATE-USER] Profile check:");
            console.log("  profile:", profile);
            if (profileError) console.log("  profileError:", profileError.message);

            if (profileError || !profile) {
                return NextResponse.json(
                    { error: "Unable to verify your role." },
                    { status: 500 }
                );
            }

            if (profile.role !== "admin") {
                return NextResponse.json(
                    { error: "Forbidden. Only admins can create users." },
                    { status: 403 }
                );
            }
        }

        // ── 4. Parse and validate the request body ───────────────────────────
        const body = await request.json();
        console.log("[CREATE-USER] Incoming body:", {
            ...body,
            password: body.password ? "***" : undefined, // mask password in logs
        });

        const { email, password, full_name, username, role, phone, resident_type, unit } = body;

        // Check required fields
        if (!email || !password || !full_name || !username || !role) {
            console.log("[CREATE-USER] ❌ Validation failed — missing required fields");
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: email, password, full_name, username, and role are required.",
                },
                { status: 400 }
            );
        }

        // Validate password length
        if (String(password).length < 6) {
            console.log("[CREATE-USER] ❌ Validation failed — password too short");
            return NextResponse.json(
                { error: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        // Validate role against the database enum
        const normalizedRole = String(role).toLowerCase() as UserRole;
        if (!VALID_ROLES.includes(normalizedRole)) {
            console.log(`[CREATE-USER] ❌ Validation failed — invalid role: "${role}"`);
            return NextResponse.json(
                {
                    error: `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        const normalizedResidentType = (resident_type
            ? String(resident_type).toLowerCase()
            : "owner") as ResidentType;

        if (normalizedRole === "resident" && !VALID_RESIDENT_TYPES.includes(normalizedResidentType)) {
            return NextResponse.json(
                {
                    error: `Invalid resident_type "${resident_type}". Must be one of: ${VALID_RESIDENT_TYPES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        const parsedUnit = unit && typeof unit === "object" ? unit as {
            phase?: string | null;
            block_number?: string;
            lot_number?: string;
            address_label?: string;
        } : null;

        console.log("[CREATE-USER] ✅ Validation passed");

        // ── 5. Create the user via Supabase Admin API ────────────────────────
        const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey);

        // These metadata keys must match what handle_new_user trigger expects:
        //   COALESCE(new.raw_user_meta_data->>'full_name', '')
        //   COALESCE(new.raw_user_meta_data->>'username', '')
        //   COALESCE(new.raw_user_meta_data->>'role', 'resident')
        //   COALESCE(new.raw_user_meta_data->>'phone', '')
        const userMetadata = {
            full_name,
            username,
            role: normalizedRole,
            phone: phone ?? "",
            resident_type: normalizedResidentType,
        };

        console.log("[CREATE-USER] Creating user with metadata:", userMetadata);

        const { data: newUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: userMetadata,
            });

        if (createError) {
            console.error("[CREATE-USER] ❌ createUser error:", {
                message: createError.message,
                status: (createError as { status?: number }).status,
                name: createError.name,
            });

            // Handle "user already exists" specifically
            if (
                createError.message?.toLowerCase().includes("already") ||
                createError.message?.toLowerCase().includes("duplicate")
            ) {
                return NextResponse.json(
                    { error: "A user with this email already exists." },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: createError.message ?? "Failed to create user." },
                { status: 500 }
            );
        }

        if (!newUser?.user) {
            console.error("[CREATE-USER] ❌ No user returned from createUser (but no error either)");
            return NextResponse.json(
                { error: "User creation returned no data." },
                { status: 500 }
            );
        }

        console.log("[CREATE-USER] ✅ User created:", {
            id: newUser.user.id,
            email: newUser.user.email,
        });

        // ── 6. Link resident to a unit and set occupancy if unit data exists ──
        if (
            normalizedRole === "resident" &&
            parsedUnit?.block_number &&
            parsedUnit?.lot_number
        ) {
            const cleanBlock = String(parsedUnit.block_number).replace(/^Block\s*/i, "").trim();
            const cleanLot = String(parsedUnit.lot_number).replace(/^Lot\s*/i, "").trim();
            const cleanPhase = parsedUnit.phase ? String(parsedUnit.phase).replace(/^Phase\s*/i, "").trim() : null;
            const addressLabel = parsedUnit.address_label?.trim() || `Block ${cleanBlock}, Lot ${cleanLot}`;
            const unitType = normalizedResidentType === "owner" ? "owned" : "rented";

            let unitId: string | null = null;

            const unitLookup = supabaseAdmin
                .from("units")
                .select("id")
                .eq("block_number", cleanBlock)
                .eq("lot_number", cleanLot)
                .limit(1);

            const { data: foundUnits, error: lookupError } = cleanPhase
                ? await unitLookup.eq("phase", cleanPhase)
                : await unitLookup;

            if (lookupError) {
                console.error("[CREATE-USER] Unit lookup failed:", lookupError.message);
            } else {
                unitId = foundUnits?.[0]?.id ?? null;
            }

            if (!unitId) {
                const { data: insertedUnit, error: insertUnitError } = await supabaseAdmin
                    .from("units")
                    .insert({
                        block_number: cleanBlock,
                        lot_number: cleanLot,
                        phase: cleanPhase,
                        address_label: addressLabel,
                        unit_type: unitType,
                        owner_id: normalizedResidentType === "owner" ? newUser.user.id : null,
                    })
                    .select("id")
                    .single();

                if (insertUnitError) {
                    console.error("[CREATE-USER] Unit create failed:", insertUnitError.message);
                } else {
                    unitId = insertedUnit.id;
                }
            } else {
                const unitUpdates: {
                    unit_type: "owned" | "rented";
                    owner_id?: string;
                } = {
                    unit_type: unitType,
                };

                if (normalizedResidentType === "owner") {
                    unitUpdates.owner_id = newUser.user.id;
                }

                const { error: updateUnitError } = await supabaseAdmin
                    .from("units")
                    .update(unitUpdates)
                    .eq("id", unitId);

                if (updateUnitError) {
                    console.error("[CREATE-USER] Unit update failed:", updateUnitError.message);
                }
            }

            if (unitId) {
                const { error: profileUnitError } = await supabaseAdmin
                    .from("profiles")
                    .update({ unit_id: unitId })
                    .eq("id", newUser.user.id);

                if (profileUnitError) {
                    console.error("[CREATE-USER] Profile unit link failed:", profileUnitError.message);
                }
            }
        }

        // ── 7. Return success ────────────────────────────────────────────────
        console.log("========== [CREATE-USER] DONE ==========\n");

        return NextResponse.json(
            {
                message: "User created successfully.",
                user: {
                    id: newUser.user.id,
                    email: newUser.user.email,
                    role: normalizedRole,
                    resident_type: normalizedRole === "resident" ? normalizedResidentType : null,
                    full_name,
                    username,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[CREATE-USER] ❌ Unhandled exception:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
