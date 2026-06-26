import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Application } from "@/types";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const applications = (data ?? []) as Application[];

        const scored = applications.filter((a) => a.fit_score);
        const avgFitScore = scored.length ?
            scored.length === 1 ?
                scored[0].fit_score :
                Math.round(scored.reduce((sum, a) => sum + a.fit_score, 0) / scored.length) :
            0;

        return NextResponse.json({
            stats: {
                total: applications.length,
                interview: applications.filter((a) => a.status === "interview").length,
                offer: applications.filter((a) => a.status === "offer").length,
                avgFitScore,
            },
            recent: applications.slice(0, 5),
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}