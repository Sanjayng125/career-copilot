import { redis } from "./redis/redis";

const FREE_LIMITS = {
    analyses: 10,
    searches: 5,
};

function getTodayKey(userId: string, type: "analyses" | "searches") {
    const today = new Date().toISOString().split("T")[0];
    return `usage:${userId}:${type}:${today}`;
}

export async function checkAndIncrementUsage(
    userId: string,
    type: "analyses" | "searches",
    plan: string
): Promise<{ allowed: boolean; remaining: number }> {
    // remove type check in production
    if (type !== "searches" && plan === "pro") return { allowed: true, remaining: 999 };

    const key = getTodayKey(userId, type);
    const limit = FREE_LIMITS[type];

    const currentReqs = (await redis.get<number>(key)) ?? 0;

    if (currentReqs >= limit) {
        return { allowed: false, remaining: 0 };
    }

    const newReqsCount = await redis.incr(key);
    await redis.expire(key, 86400);

    return { allowed: true, remaining: limit - newReqsCount };
}

export async function getUsageStats(userId: string) {
    const analysesKey = getTodayKey(userId, "analyses");
    const searchesKey = getTodayKey(userId, "searches");

    const analysesCount = await redis.get<number>(analysesKey);
    const searchesCount = await redis.get<number>(searchesKey);

    return {
        analyses: {
            used: analysesCount ?? 0,
            limit: FREE_LIMITS.analyses,
            remaining: FREE_LIMITS.analyses - (analysesCount ?? 0),
        },
        searches: {
            used: searchesCount ?? 0,
            limit: FREE_LIMITS.searches,
            remaining: FREE_LIMITS.searches - (searchesCount ?? 0),
        },
    };
}
