import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { notes } = await request.json();
        if (typeof notes !== "string" || !notes.trim()) return NextResponse.json({ error: "Bad request" }, { status: 400 });
        if (notes.trim().length > 2000) return NextResponse.json({ error: "Notes cannot exceed 2000 characters" }, { status: 400 });

        const { error } = await supabase
            .from("applications")
            .update({ notes: notes.trim(), updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notes update error:", error);
        return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
    }
}
