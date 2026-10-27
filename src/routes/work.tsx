import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone } from "lucide-react";
import { jobsQuery } from "@/lib/jobs";
import { JobCard } from "@/components/JobCard";

const TITLE = "Our Work | K A K Electricals Craigieburn";
const DESC = "Photos and notes from recent lighting, powerpoint, CCTV and electrical jobs completed by K A K Electricals across Melbourne's north.";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  const { data, isLoading } = useQuery(jobsQuery());
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <a href="tel:+61425170200" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Phone className="h-4 w-4" /> Call</a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our work</p>
        <h1 className="text-display mt-2 text-4xl sm:text-5xl">Recent jobs.</h1>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {data?.length === 0 && <p className="text-muted-foreground">New jobs coming soon.</p>}
          {data?.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      </main>
    </div>
  );
}
