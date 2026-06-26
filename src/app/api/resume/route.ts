import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) throw error

        return NextResponse.json({ resume: data }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}