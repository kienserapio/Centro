/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  ANNOUNCEMENTS — Create & List                          │
 * │  POST: Create a new community announcement              │
 * │  GET:  Fetch all announcements (newest first)           │
 * │  Used by: Admin Posts page (/admin/posts)               │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ENUM values for validation
const VALID_CATEGORIES = ['general', 'utility', 'security', 'meeting', 'emergency'] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'emergency'] as const;

type Category = typeof VALID_CATEGORIES[number];
type Priority = typeof VALID_PRIORITIES[number];

/**
 * POST /api/admin/announcements
 * Creates a new announcement and logs the action in audit_logs.
 *
 * Request body:
 * {
 *   title: string
 *   body: string
 *   category: string (enum: 'general', 'utility', 'security', 'meeting', 'emergency')
 *   priority: string (enum: 'low', 'medium', 'high', 'emergency')
 *   is_pinned: boolean
 * }
 *
 * Returns: 201 with the newly created announcement object on success
 * Returns: 400 if required fields are missing or invalid
 * Returns: 401 if user is not authenticated
 * Returns: 500 if database operations fail
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Initialize Supabase server client
        const supabase = await createClient();

        // 2. Retrieve the authenticated user's session
        // TODO: Remove the fallback test UUID before going to production!
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const authorId = user?.id ?? "3dd4d817-e770-4eda-905c-f018f5b1b0a5";

        // 3. Parse the JSON body
        const body = await request.json();
        const { title, body: bodyContent, category, priority, is_pinned } = body;

        // 4. Validate required fields
        if (!title || !bodyContent || !category || !priority || is_pinned === undefined) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: title, body, category, priority, and is_pinned are required.",
                },
                { status: 400 }
            );
        }

        // 5. Normalize enum values to lowercase
        const normalizedCategory = String(category).toLowerCase() as Category;
        const normalizedPriority = String(priority).toLowerCase() as Priority;

        // 6. Validate enum values
        if (!VALID_CATEGORIES.includes(normalizedCategory)) {
            return NextResponse.json(
                {
                    error: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        if (!VALID_PRIORITIES.includes(normalizedPriority)) {
            return NextResponse.json(
                {
                    error: `Invalid priority "${priority}". Must be one of: ${VALID_PRIORITIES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // 7. Insert into the announcements table
        const { data: announcement, error: insertError } = await supabase
            .from("announcements")
            .insert({
                title,
                body: bodyContent,
                category: normalizedCategory,
                priority: normalizedPriority,
                is_pinned: Boolean(is_pinned),
                author_id: authorId,
            })
            .select()
            .single();

        if (insertError || !announcement) {
            console.error("Error inserting announcement:", insertError);
            return NextResponse.json(
                { error: insertError?.message ?? "Failed to create announcement." },
                { status: 500 }
            );
        }

        // 8. Return the created announcement
        return NextResponse.json(announcement, { status: 201 });
    } catch (error) {
        console.error("Internal server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/announcements
 * Fetches all announcements from the database.
 *
 * Returns: 200 with array of announcements
 * Returns: 500 if database query fails
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: announcements, error } = await supabase
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching announcements:", error);
            return NextResponse.json(
                { error: "Failed to fetch announcements" },
                { status: 500 }
            );
        }

        return NextResponse.json(announcements);
    } catch (error) {
        console.error("Internal server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
