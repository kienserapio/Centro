/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  ANNOUNCEMENT BY ID — Edit & Delete                     │
 * │  PATCH:  Update an existing announcement                │
 * │  DELETE: Remove an announcement                         │
 * │  Used by: Admin Posts page (/admin/posts)               │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = ["general", "utility", "security", "meeting", "emergency"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "emergency"] as const;

type Category = (typeof VALID_CATEGORIES)[number];
type Priority = (typeof VALID_PRIORITIES)[number];

/**
 * PATCH /api/admin/announcements/[id]
 * Partially updates an announcement. Only provided fields are changed.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const body = await request.json();
        const { title, body: bodyContent, category, priority, is_pinned } = body;

        const updateData: Record<string, unknown> = {};

        if (title !== undefined) updateData.title = title;
        if (bodyContent !== undefined) updateData.body = bodyContent;

        if (category !== undefined) {
            const normalized = String(category).toLowerCase() as Category;
            if (!VALID_CATEGORIES.includes(normalized)) {
                return NextResponse.json(
                    { error: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}` },
                    { status: 400 }
                );
            }
            updateData.category = normalized;
        }

        if (priority !== undefined) {
            const normalized = String(priority).toLowerCase() as Priority;
            if (!VALID_PRIORITIES.includes(normalized)) {
                return NextResponse.json(
                    { error: `Invalid priority "${priority}". Must be one of: ${VALID_PRIORITIES.join(", ")}` },
                    { status: 400 }
                );
            }
            updateData.priority = normalized;
        }

        if (is_pinned !== undefined) updateData.is_pinned = Boolean(is_pinned);

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided for update." },
                { status: 400 }
            );
        }

        const { data: announcement, error } = await supabase
            .from("announcements")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("[PATCH /api/admin/announcements/:id] Error:", error);
            return NextResponse.json(
                { error: error.message ?? "Failed to update announcement." },
                { status: 500 }
            );
        }

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Internal server error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Permanently removes an announcement.
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase
            .from("announcements")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("[DELETE /api/admin/announcements/:id] Error:", error);
            return NextResponse.json(
                { error: error.message ?? "Failed to delete announcement." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Internal server error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
