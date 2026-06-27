import { DATE_POSTED_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from "@/lib/constants";
import { jobSearchRateLimit } from "@/lib/redis/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementUsage } from "@/lib/usage.server";
import { Job } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { success, reset, } = await jobSearchRateLimit.limit(user.id)
        if (!success) {
            const resetIn = Math.ceil((reset - Date.now()) / 1000)
            return NextResponse.json(
                {
                    error: `Too many requests, Hold on a sec. Try again in ${resetIn}s.`,
                },
                {
                    status: 429,
                }
            )
        }

        const { data: userData } = await supabase
            .from("users")
            .select("plan")
            .eq("id", user.id)
            .single();

        const plan = userData?.plan ?? "free";

        const { allowed } = await checkAndIncrementUsage(user.id, "searches", plan);

        if (!allowed) {
            return NextResponse.json(
                {
                    error: "Daily job search limit reached. Upgrade to Pro for unlimited job searches.",
                    code: "LIMIT_REACHED",
                },
                { status: 429 }
            );
        }

        const { query, location, page = 1, datePosted = "all", workFromHome, employmentType } = await request.json();

        if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });
        if (typeof query !== 'string' ||
            typeof location !== 'string' ||
            typeof page !== 'number' ||
            (datePosted && !DATE_POSTED_OPTIONS.some(date => date.value === datePosted)) ||
            (employmentType && !EMPLOYMENT_TYPE_OPTIONS.some(type => type.value === employmentType)))
            return NextResponse.json({ error: "Bad Request" }, { status: 400 });

        const searchQuery = location ? `${query} in ${location}` : query;

        const params = new URLSearchParams({
            query: searchQuery,
            num_pages: "1",
            page: String(page),
            country: "in",
            date_posted: datePosted,
        });

        if (typeof workFromHome === "boolean" && workFromHome === true) params.append("work_from_home", "true");
        if (employmentType) params.append("employment_types", employmentType);

        const res = await fetch(
            `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
            {
                headers: {
                    "x-rapidapi-key": process.env.JSEARCH_API_KEY!,
                },
            }
        );

        if (!res.ok) throw new Error("JSearch API failed");

        const { data = [] } = await res.json();

        const jobs = data?.map((job: Job) => ({
            job_id: job.job_id,
            job_title: job.job_title,
            employer_name: job.employer_name ?? "N/A",
            employer_logo: job.employer_logo ?? "https://res.cloudinary.com/dnugvoy3m/image/upload/v1782200985/not-available_p9jhui.png",
            job_employment_type: job.job_employment_type ?? "N/A",
            job_apply_link: job.job_apply_link ?? "#not-available",
            job_description: job.job_description ?? "N/A",
            job_is_remote: job.job_is_remote ?? false,
            job_posted_at: job.job_posted_at ?? "N/A",
            job_location: job.job_location ?? "N/A",
            job_city: job.job_city ?? "N/A",
            job_state: job.job_state ?? "N/A",
            job_salary_string: job.job_salary_string ?? null,
        }));

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error("Job search error:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}