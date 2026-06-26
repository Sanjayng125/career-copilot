import { geminiModel } from "@/lib/gemini";
import { parseRateLimit } from "@/lib/redis/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { success, reset, } = await parseRateLimit.limit(
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

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const fileName = formData.get("fileName") as string;

        if (!file) {
            return NextResponse.json({ error: 'Missing file' }, { status: 400 })
        }

        if (file?.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");

        const result = await geminiModel.generateContent([
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64,
                },
            },
            {
                text: `Extract structured information from this resume and return ONLY a JSON object with no markdown, no backticks, nothing else. The JSON must follow this exact structure:
{
  "skills": ["skill1", "skill2"],
  "experience": ["Job Title at Company (Year-Year): brief description"],
  "education": ["Degree in Field from University (Year)"],
  "summary": "2-3 sentence professional summary of this candidate"
}`,
            },
        ]);

        const text = result.response.text().trim();

        let parsed: { skills: string[], experience: string[], education: string[], summary: string }
        try {
            const clean = text.replace(/```json|```/g, '').trim()
            parsed = JSON.parse(clean)
        } catch {
            parsed = {
                skills: [],
                experience: [],
                education: [],
                summary: "We couldn't extract any information from this resume. Please try again with a different file."
            }
        }

        const filePath = `${user.id}/${Date.now()}_${fileName}`;
        const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(filePath, file);

        if (uploadError) return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });

        const { error } = await supabase.from("resumes").upsert({
            user_id: user.id,
            file_path: filePath,
            file_name: fileName,
            parsed_data: parsed,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: "user_id",
        })

        if (error) throw error;

        return NextResponse.json({ success: true, parsed });
    } catch (error) {
        console.error("Resume parse error:", error);

        if (error instanceof Error && error.message.includes('GoogleGenerativeAI')) {
            return NextResponse.json({ error: 'AI service is currently unavailable. Please try again later.' }, { status: 503 })
        }

        return NextResponse.json({ error: "Something went wrong. Failed to parse resume." }, { status: 500 });
    }
}
