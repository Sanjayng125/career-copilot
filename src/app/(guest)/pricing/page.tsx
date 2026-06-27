"use client";

import { Button } from "@/components/ui/button";
import { Check, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UsageData } from "@/types";
import { toast } from "sonner";
import { useState } from "react";

const FREE_FEATURES = [
  "10 AI analyses per day",
  "5 job searches per day",
  "1 resume upload",
  "Application tracker",
  "Cover letter generation",
  "Tailored resume generation",
];

const PRO_FEATURES = [
  "Unlimited AI analyses",
  "Unlimited job searches",
  "Multiple resume versions",
  "Application tracker",
  "Cover letter generation",
  "Tailored resume generation",
  "Priority support",
];

export default function PricingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("free");

  const { isLoading } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const res = await fetch("/api/usage");
      if (!res.ok) throw new Error("Failed to fetch usage");
      const data = await res.json();

      setCurrentPlan(data?.plan ?? "free");

      return data as Promise<UsageData>;
    },
    enabled: !!user,
  });

  const handleCheckoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payments/checkout");

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Failed to create checkout");

      return data;
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isLoading) return null;

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium mb-3">Simple pricing</h1>
          <p className="text-muted-foreground text-sm">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
                  <Check size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>

            {currentPlan === "free" ? (
              <Button variant="outline" disabled className="w-full">
                {user ? "Current plan" : "Default plan"}
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Free plan
              </Button>
            )}
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

            {!user ? (
              <Link href="/login" className="w-full">
                <Button className="w-full">Get started</Button>
              </Link>
            ) : currentPlan === "pro" ? (
              <Button className="w-full" disabled>
                <Crown size={13} className="mr-1.5 text-yellow-500" />
                Current plan
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleCheckoutMutation.mutate()}
                disabled={handleCheckoutMutation.isPending}
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
