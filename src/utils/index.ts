import { Application } from "@/types";

export function getStatusCounts(applications: Application[]) {
    return {
        total: applications.length,
        applied: applications.filter((a) => a.status === "applied").length,
        interview: applications.filter((a) => a.status === "interview").length,
        offer: applications.filter((a) => a.status === "offer").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
    };
}

export function getAvgFitScore(applications: Application[]) {
    if (!applications.length) return 0;
    const scored = applications.filter((a) => a.fit_score);
    if (!scored.length) return 0;
    return Math.round(
        scored.reduce((sum, a) => sum + a.fit_score, 0) / scored.length,
    );
}