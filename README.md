# Career Copilot

An AI-powered job application assistant built with Next.js and Gemini. Upload your resume once, search jobs, get AI fit scores, generate tailored resumes and cover letters — all in one place.

![Career Copilot](public/preview.png)

## Features

- **Google OAuth** — one-click sign in
- **Resume parsing** — upload your PDF resume once, AI extracts skills, experience, and education
- **Job search** — search live job listings powered by JSearch (LinkedIn, Indeed, Glassdoor)
- **Manual job input** — paste any job URL or description directly
- **AI fit score** — see how well your resume matches a job (0-100%)
- **Skill analysis** — matched skills and missing skills highlighted
- **Tailored resume** — AI rewrites your resume bullets to match the JD
- **Cover letter** — AI-generated personalised cover letter in markdown
- **Application tracker** — track every application with status updates
- **Usage limits** — free tier limits with Redis-based tracking
- **Light/dark mode** — clean minimal UI

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Auth & DB** — Supabase (PostgreSQL + Storage)
- **AI** — Google Gemini 3.5, 3.1, 2.5 etc Flash
- **Job listings** — JSearch via RapidAPI
- **Rate limiting** — Upstash Redis
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Data fetching** — TanStack Query
- **Package manager** — pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Google Cloud Console project (for OAuth)
- Google Gemini API key
- RapidAPI account (JSearch)
- Upstash Redis account

### Installation

1. Clone the repo:

```bash
git clone https://github.com/Sanjayng125/career-copilot.git
cd career-copilot
```

2. Install dependencies:

```bash
pnpm install
```

3. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
JSEARCH_API_KEY=your_jsearch_rapidapi_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `schema.sql`
   - Create a storage bucket named `resumes` (private)
   - Enable Google OAuth under Authentication → Providers
   - Add `http://localhost:3000/api/auth/callback` to redirect URLs

5. Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Free Tier Limits - For Production

| Feature             | Free   | Pro       |
| ------------------- | ------ | --------- |
| AI analyses         | 10/day | Unlimited |
| Job searches        | 5/day  | Unlimited |
| Resume uploads      | 1      | Multiple  |
| Application tracker | ✅     | ✅        |
| Cover letter        | ✅     | ✅        |
