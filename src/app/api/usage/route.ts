import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUsageStats } from "@/lib/usage.server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: userData } = await supabase
            .from("users")
            .select("plan, plan_expires_at")
            .eq("id", user.id)
            .single();

        const stats = await getUsageStats(user.id);

        return NextResponse.json({
            plan: userData?.plan ?? "free",
            plan_expires_at: userData?.plan_expires_at ?? null,
            usage: stats,
        });
    } catch (error) {
        console.error("Usage error:", error);
        return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
    }
}
