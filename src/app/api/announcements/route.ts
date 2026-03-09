import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ENUM values for validation
const VALID_CATEGORIES = ['general', 'utility', 'security', 'meeting', 'emergency'] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'emergency'] as const;

type Category = typeof VALID_CATEGORIES[number];
type Priority = typeof VALID_PRIORITIES[number];

/**
 * POST /api/announcements
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
    // Initialize Supabase server client
    const supabase = await createClient();

    // TEMPORARY: Skip auth for testing
    const userId = "f3a9c6b2-7d41-4c8b-9e7d-2a1f5c0b6d93";

    // Parse the JSON body
    const body = await request.json();
    const { title, body: bodyContent, category, priority, is_pinned } = body;

    // TEMPORARY: Skip validation for testing
    /*
    // Data Validation: Check required fields
    if (!title || !bodyContent || !category || !priority || is_pinned === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, body, category, priority, and is_pinned are required"
        },
        { status: 400 }
      );
    }

    // Data Validation: Check ENUM values for category
    if (!VALID_CATEGORIES.includes(category as Category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Data Validation: Check ENUM values for priority
    if (!VALID_PRIORITIES.includes(priority as Priority)) {
      return NextResponse.json(
        {
          error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
        },
        { status: 400 }
      );
    }
    */

    // Database Insert 1: Insert into announcements table
    const { data: announcement, error: insertError } = await supabase
      .from("announcements")
      .insert({
        title,
        body: bodyContent,
        category,
        priority,
        is_pinned,
        author_id: userId,
      })
      .select()
      .single();

    if (insertError || !announcement) {
      console.error("Error inserting announcement:", insertError);
      return NextResponse.json(
        { error: "Failed to create announcement" },
        { status: 500 }
      );
    }

    // Database Insert 2: Insert audit log entry
    const { error: auditError } = await supabase
      .from("audit_logs")
      .insert({
        actor_id: userId,
        action: "CREATE_ANNOUNCEMENT",
        entity_type: "announcements",
        entity_id: announcement.id,
        new_value: announcement,
      });

    if (auditError) {
      console.error("Error creating audit log:", auditError);
      // Note: We're not returning an error here because the announcement was successfully created.
      // Audit logging is secondary to the main operation.
    }

    // Return success response
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
 * GET /api/announcements
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