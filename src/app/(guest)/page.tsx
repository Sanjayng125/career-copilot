import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  FileText,
  Mail,
  LayoutDashboard,
  Brain,
  Sparkles,
} from "lucide-react";
import { Check, Crown, Zap } from "lucide-react";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/constants";

const features = [
  {
    icon: <BarChart2 size={18} />,
    title: "AI fit score",
    desc: "Know exactly how well your resume matches a job before applying.",
  },
  {
    icon: <FileText size={18} />,
    title: "Tailored resume",
    desc: "AI rewrites your resume bullets to match the job description.",
  },
  {
    icon: <Mail size={18} />,
    title: "Cover letter",
    desc: "Generate a personalised cover letter in seconds, in your tone.",
  },
  {
    icon: <LayoutDashboard size={18} />,
    title: "App tracker",
    desc: "Track every application — status, notes, and AI analysis in one view.",
  },
  {
    icon: <Brain size={18} />,
    title: "Skill gaps",
    desc: "See exactly which skills you're missing and what to focus on next.",
  },
  {
    icon: <FileText size={18} />,
    title: "Smart job search",
    desc: "Search thousands of live jobs or paste any job description manually.",
  },
];

const steps = [
  "Upload your resume",
  "Search or paste a job",
  "Get AI analysis",
  "Apply with confidence",
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="flex flex-col items-center text-center px-6 py-20 border-b border-border">
        <div className="flex items-center gap-1.5 bg-muted border border-border rounded-full px-3 py-1 text-xs text-muted-foreground mb-6">
          <Sparkles size={12} />
          Powered by AI
        </div>
        <h1 className="text-4xl font-medium leading-tight max-w-xl mb-4">
          Land your dream job with an AI copilot by your side
        </h1>
        <p className="text-muted-foreground text-base max-w-md mb-8 leading-relaxed">
          Upload your resume once. Search jobs, get fit scores, generate
          tailored resumes and cover letters — all in one place.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/login">
            <Button size="lg">Get started free</Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline">
              See how it works
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                {f.icon}
              </div>
              <div>
                <p className="font-medium text-sm mb-1">{f.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-16 border-t border-border">
        <h2 className="text-xl font-medium text-center mb-10">How it works</h2>
        <div className="flex flex-wrap items-start justify-center gap-0 max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <div key={step} className="flex items-start mb-2">
              <div className="flex flex-col items-center text-center w-28">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-medium mb-2">
                  {i + 1}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">
                  {step}
                </p>
              </div>
              {i < steps.length - 1 && (
                <span className="text-muted-foreground mt-3 px-1">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 border-t border-border">
        <div>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-medium mb-3">Simple pricing</h1>
            <p className="text-muted-foreground text-sm">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-muted-foreground" />
                  <p className="font-medium">Free</p>
                </div>
                <p className="text-3xl font-medium">₹0</p>
                <p className="text-xs text-muted-foreground mt-1">forever</p>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" disabled>
                Default plan
              </Button>
            </div>

            <div className="bg-card border-2 border-foreground rounded-xl p-6 flex flex-col gap-5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-foreground text-background text-xs px-3 py-1 rounded-full font-medium">
                  Most popular
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-yellow-500" />
                  <p className="font-medium">Pro</p>
                </div>
                <p className="text-3xl font-medium">₹499</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {PRO_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check size={13} className="text-foreground shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/pricing" className="w-full">
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-border bg-muted text-center">
        <h2 className="text-2xl font-medium mb-2">
          Start applying smarter today
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Free to get started. No credit card required.
        </p>
        <Link href="/login">
          <Button size="lg">Get started free</Button>
        </Link>
      </section>
    </div>
  );
}
