import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { signJobPhotos } from "@/lib/jobs.functions";

export type Job = {
  id: string;
  title: string;
  notes: string;
  suburb: string;
  job_date: string | null;
  photos: string[];
  photoUrls: string[];
};

export const BUCKET = "job-photos";

export async function fetchJobs(limit?: number): Promise<Job[]> {
  let q = supabase.from("jobs").select("*").order("job_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  const paths = data.flatMap((j) => j.photos);
  const urlMap: Record<string, string> = paths.length ? await signJobPhotos({ data: { paths } }) : {};
  return data.map((j) => ({ ...j, photoUrls: j.photos.map((p) => urlMap[p]).filter(Boolean) as string[] }));
}

export const jobsQuery = (limit?: number) =>
  queryOptions({ queryKey: ["jobs", limit ?? "all"], queryFn: () => fetchJobs(limit) });

export function formatJobDate(d: string | null) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

