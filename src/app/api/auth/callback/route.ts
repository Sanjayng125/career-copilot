import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: existingUser } = await supabase
                    .from("users")
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (!existingUser) {
                    await supabase.from("users").insert({
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata.full_name,
                        avatar_url: user.user_metadata.avatar_url,
                    });

                    return NextResponse.redirect(`${origin}/onboarding`);
                }

                const { data: resume } = await supabase
                    .from("resumes")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();

                if (!resume) {
                    return NextResponse.redirect(`${origin}/onboarding`);
                }
            }

            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
