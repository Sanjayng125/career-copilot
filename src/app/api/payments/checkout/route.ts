import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { setupLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { checkoutRateLimit } from "@/lib/redis/rate-limit";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { success, reset } = await checkoutRateLimit.limit(user.id)
        if (!success) {
            return NextResponse.json(
                {
                    error: `Too many requests. Hold on a sec. Try again in ${Math.ceil((reset - Date.now()) / 1000)}s.`,
                },
                {
                    status: 429,
                }
            )
        }

        const { data: userData } = await supabase
            .from("users")
            .select("plan, email, name")
            .eq("id", user.id)
            .single();

        if (userData?.plan === "pro") {
            return NextResponse.json({ error: "You are already a Pro user" }, { status: 400 });
        }

        setupLemonSqueezy();

        const checkout = await createCheckout(
            process.env.LEMONSQUEEZY_STORE_ID!,
            process.env.LEMONSQUEEZY_VARIANT_ID!,
            {
                checkoutOptions: {
                    embed: false,
                    media: false,
                },
                checkoutData: {
                    email: userData?.email ?? user.email ?? "",
                    name: userData?.name ?? "",
                    custom: {
                        user_id: user.id,
                    },
                },
                productOptions: {
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                    receiptButtonText: "Go to Dashboard",
                    receiptThankYouNote: "Thank you for upgrading to Career Copilot Pro!",
                },
                expiresAt: new Date(new Date().getTime() + 1000 * 60 * 10).toISOString(), // 10 minutes
                testMode: process.env.LEMONSQUEEZY_ENV === "production" ? false : true,
            }
        );

        const checkoutUrl = checkout.data?.data.attributes.url;
        if (!checkoutUrl) throw new Error("Failed to create checkout URL");

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }
}
