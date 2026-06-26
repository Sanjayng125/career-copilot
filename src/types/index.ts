export type User = {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    plan: "free" | "pro"
    plan_expires_at: string
    created_at: string;
};

export type UsageData = {
    plan: "free" | "pro";
    plan_expires_at: string | null;
    usage: {
        analyses: { used: number; limit: number; remaining: number };
        searches: { used: number; limit: number; remaining: number };
    };
};

export type Resume = {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    parsed_data: {
        skills: string[];
        experience: string[];
        education: string[];
        summary: string;
    };
    created_at: string;
    updated_at: string;
};

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";
export type ApplicationSource = "search" | "manual";

export type Application = {
    id: string;
    user_id: string;
    source: ApplicationSource;
    job_title: string;
    company: string;
    location: string;
    apply_url: string;
    status: ApplicationStatus;
    fit_score: number;
    matched_skills: string[];
    missing_skills: string[];
    ai_summary: string;
    tailored_resume: string;
    cover_letter: string;
    notes: string;
    created_at: string;
    updated_at: string;
};

export type Job = {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo: string;
    job_employment_type: string;
    job_apply_link: string;
    job_description: string;
    job_is_remote: boolean;
    job_posted_at: string;
    job_location: string;
    job_city: string;
    job_state: string;
    job_salary_string: string | null;
};

export type DatePosted = "all" | "today" | "3days" | "week" | "month";

export type EMPLOYMENT_TYPE = "Any" | "FULLTIME" | "CONTRACTOR" | "PARTTIME" | "INTERN";
