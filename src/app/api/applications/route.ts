import { STATUS_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const q = searchParams.get('q')?.trim() ?? ''
        const sort = searchParams.get('sort') ?? 'desc'
        const status = STATUS_OPTIONS.some(s => searchParams.get('status') === s.value) && searchParams.get('status') !== "all" ? searchParams.get('status') : null
        const limit = parseInt(isNaN(Number(searchParams.get('limit'))) ? '10' : searchParams.get('limit') ?? '10')
        const page = parseInt(isNaN(Number(searchParams.get('page'))) ? '1' : searchParams.get('page') ?? '1')

        const start = (page - 1) * limit
        const end = start + limit - 1

        const query = supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .order("created_at", { ascending: sort === 'asc' })
            .range(start, end)

        const countQuery = supabase
            .from('applications')
            .select('id', { count: "exact", head: true })
            .eq('user_id', user.id)
            .range(start, end)

        if (q) {
            query.or(
                `job_title.ilike.%${q}%,company.ilike.%${q}%`
            )
            countQuery.or(
                `job_title.ilike.%${q}%,company.ilike.%${q}%`
            )
        }

        if (status) {
            query.eq('status', status)
            countQuery.eq('status', status)
        }

        const { data, error } = await query
        const { count: totalApplications, error: countError } = await countQuery

        if (error || countError) throw error || countError

        return NextResponse.json({
            applications: data,
            totalApplications,
            currentPage: page,
            totalPages: Math.ceil((totalApplications ?? limit) / limit)
        })
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}