import { useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { formatJobDate, type Job } from "@/lib/jobs";

export function JobCard({ job }: { job: Job }) {
  const [i, setI] = useState(0);
  const urls = job.photoUrls;
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      {urls.length > 0 && (
        <div className="relative aspect-[4/3] bg-muted">
          <img src={urls[i]} alt={job.title} loading="lazy" className="h-full w-full object-cover" />
          {urls.length > 1 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {urls.map((_, n) => (
                <button key={n} aria-label={`Photo ${n + 1}`} onClick={() => setI(n)} className={`h-2.5 w-2.5 rounded-full border border-background ${n === i ? "bg-primary" : "bg-background/70"}`} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {job.suburb && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.suburb}</span>}
          {job.job_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatJobDate(job.job_date)}</span>}
        </div>
        {job.notes && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{job.notes}</p>}
      </div>
    </article>
  );
}
