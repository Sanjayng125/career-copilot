import { ApplicationStatus, DatePosted, EMPLOYMENT_TYPE } from "@/types";

export const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
    { label: "Saved", value: "saved" },
    { label: "Applied", value: "applied" },
    { label: "Interview", value: "interview" },
    { label: "Offer", value: "offer" },
    { label: "Rejected", value: "rejected" },
];

export const FILTER_STATUS_OPTIONS: { label: string; value: ApplicationStatus | "all" }[] = [
    { label: "All", value: "all" },
    ...STATUS_OPTIONS
]

export const STATUS_STYLES: Record<string, string> = {
    saved: "bg-muted text-muted-foreground",
    applied: "bg-blue-500/10 text-blue-500",
    interview: "bg-yellow-500/10 text-yellow-500",
    offer: "bg-green-500/10 text-green-500",
    rejected: "bg-red-500/10 text-red-500",
};



export const DATE_POSTED_OPTIONS: { label: string; value: DatePosted }[] = [
    { label: "Any time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 3 days", value: "3days" },
    { label: "This week", value: "week" },
    { label: "This month", value: "month" },
];

export const EMPLOYMENT_TYPE_OPTIONS: { label: string; value: EMPLOYMENT_TYPE }[] = [
    { label: "Any", value: "Any" },
    { label: "Full-time", value: "FULLTIME" },
    { label: "Contractor", value: "CONTRACTOR" },
    { label: "Part-time", value: "PARTTIME" },
    { label: "Intern", value: "INTERN" },
];
