import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', id)
            .single()

        if (!data) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

        if (error) throw error

        return NextResponse.json({ application: data }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const { data, error } = await supabase
            .from('applications')
            .delete()
            .eq('user_id', user.id)
            .eq('id', id)
            .select()

        if (!data) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

        if (error) throw error

        return NextResponse.json({ success: true }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
