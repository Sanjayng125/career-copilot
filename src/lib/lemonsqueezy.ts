import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function setupLemonSqueezy() {
    const requiredVars = [
        'LEMONSQUEEZY_API_KEY',
        'LEMONSQUEEZY_STORE_ID',
        'LEMONSQUEEZY_VARIANT_ID',
        'LEMONSQUEEZY_WEBHOOK_SECRET',
    ]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required LEMONSQUEEZY env variables: ${missingVars.join(
                ', '
            )}. Please, set them in your .env file.`
        )
    }

    lemonSqueezySetup({
        apiKey: process.env.LEMONSQUEEZY_API_KEY!,
        onError: (error) => {
            console.error("LemonSqueezy error:", error)
            throw error;
        },
    });
}
