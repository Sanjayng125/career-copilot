"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobSearch from "@/components/jobs/JobSearch";
import JobManual from "@/components/jobs/JobManual";
import Notice from "@/components/notice";

export default function JobsPage() {
  const [tab, setTab] = useState<"search" | "manual">("search");

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">Find jobs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search live listings or paste a job description manually.
        </p>

        <Notice
          message="Due to very low free quota of Job Search API, i have restricted the route to very low search limits. so test the project wisely."
          className="mt-2 text-center"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "search" | "manual")}>
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search jobs</TabsTrigger>
          <TabsTrigger value="manual">Paste manually</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <JobSearch />
        </TabsContent>
        <TabsContent value="manual">
          <JobManual />
        </TabsContent>
      </Tabs>
    </div>
  );
}
