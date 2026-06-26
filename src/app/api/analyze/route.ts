import { geminiModel } from "@/lib/gemini";
import { analzseRateLimit } from "@/lib/redis/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementUsage } from "@/lib/usage.server";
import { NextResponse } from "next/server";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { success, reset, } = await analzseRateLimit.limit(
            user.id
        )
        if (!success) {
            const resetIn = Math.ceil((reset - Date.now()) / 1000)
            return NextResponse.json(
                {
                    error: `Too many requests. Hold on a sec. Try again in ${resetIn}s.`,
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

        const { allowed } = await checkAndIncrementUsage(user.id, "analyses", plan);

        if (!allowed) {
            return NextResponse.json(
                {
                    error: "Daily analysis limit reached. Upgrade to Pro for unlimited analyses.",
                    code: "LIMIT_REACHED",
                },
                { status: 429 }
            );
        }

        const { source, jobTitle, company, location, applyUrl, description } = await request.json();

        if (!jobTitle || !description) {
            return NextResponse.json({ error: "Job title and description are required" }, { status: 400 });
        }

        const { data: resume } = await supabase
            .from("resumes")
            .select("parsed_data")
            .eq("user_id", user.id)
            .single();

        if (!resume) {
            return NextResponse.json({ error: "No resume found" }, { status: 404 });
        }

        const analysisResult = await geminiModel.generateContent(`
You are an expert ATS and career coach. Analyze how well this candidate's resume matches the job description.

RESUME DATA:
${JSON.stringify(resume.parsed_data, null, 2)}

JOB TITLE: ${jobTitle}
COMPANY: ${company ?? "Not specified"}
JOB DESCRIPTION:
${description}

Return ONLY a JSON object with no markdown, no backticks, nothing else:
{
  "fit_score": <number 0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "ai_summary": "3-4 sentence honest assessment of fit, written directly to the candidate using 'you/your'. Mention strengths and gaps clearly."
}
`);

        const analysisText = analysisResult.response.text().trim();
        const cleanAnalysisText = analysisText.replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(cleanAnalysisText);
        // console.log({ analysis })

        await delay(1000);

        const resumeResult = await geminiModel.generateContent(`
You are an expert resume writer. Rewrite this candidate's resume to better match the job description.

RESUME DATA:
${JSON.stringify(resume.parsed_data, null, 2)}

JOB TITLE: ${jobTitle}
COMPANY: ${company ?? "Not specified"}
JOB DESCRIPTION:
${description}

Instructions:
- Rewrite bullet points to highlight relevant experience
- Naturally incorporate missing but learnable skills where honest
- Keep it truthful — do not fabricate experience
- Return the resume in clean Markdown format
- Structure: Summary, Skills, Experience, Education. (For Summary Section, do not add "Summary" or "Summary:" heading. Mention Candidate's name if available as the heading otherwise just directly write summary without any headings.).
- Do not add any preamble or explanation, just the markdown resume
`);

        await delay(1000);

        const tailoredResume = resumeResult.response.text().trim();
        // console.log({ tailoredResume })

        const coverLetterResult = await geminiModel.generateContent(`
You are an expert cover letter writer. Write a professional cover letter for this candidate.

RESUME DATA:
${JSON.stringify(resume.parsed_data, null, 2)}

JOB TITLE: ${jobTitle}
COMPANY: ${company ?? "Not specified"}
JOB DESCRIPTION:
${description}

Instructions:
- Professional but warm tone
- 3-4 paragraphs: opening, why them, why this role, closing
- Reference specific skills and experience from the resume
- Do not fabricate anything
- Return in clean Markdown format
- Do not add any preamble or explanation, just the markdown cover letter
`);

        const coverLetter = coverLetterResult.response.text().trim();
        // console.log({ coverLetter })

        const { data: application, error } = await supabase
            .from("applications")
            .insert({
                user_id: user.id,
                source,
                job_title: jobTitle,
                company: company ?? null,
                location: location ?? null,
                apply_url: applyUrl ?? null,
                status: "saved",
                fit_score: analysis.fit_score ?? 0,
                matched_skills: analysis.matched_skills ?? [],
                missing_skills: analysis.missing_skills ?? [],
                ai_summary: analysis.ai_summary ?? "N/A",
                tailored_resume: tailoredResume ?? "N/A",
                cover_letter: coverLetter ?? "N/A",
            })
            .select("id")
            .single();

        if (error) return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });

        return NextResponse.json({ applicationId: application.id });
    } catch (error) {
        console.error("Analyze error:", error);

        if (error instanceof Error && error.message.includes('GoogleGenerativeAI')) {
            return NextResponse.json({ error: 'AI service is currently unavailable. Please try again later.' }, { status: 503 })
        }

        return NextResponse.json({ error: "Failed to analyze job" }, { status: 500 });
    }
}
