import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const analzseRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '20s'),
    prefix: 'career-copilot:analzse',
    analytics: true,
})

export const parseRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '20s'),
    prefix: 'career-copilot:parse',
    analytics: true,
})

export const jobSearchRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '10s'),
    prefix: 'career-copilot:job-search',
    analytics: true,
})
