import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public: signs only photo paths that are attached to a published job.
export const signJobPhotos = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ paths: z.array(z.string().max(300)).max(500) }).parse(input))
  .handler(async ({ data }) => {
    if (!data.paths.length) return {} as Record<string, string>;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: jobs } = await supabaseAdmin.from("jobs").select("photos").overlaps("photos", data.paths);
    const allowed = new Set((jobs ?? []).flatMap((j) => j.photos));
    const paths = data.paths.filter((p) => allowed.has(p));
    if (!paths.length) return {} as Record<string, string>;
    const { data: signed } = await supabaseAdmin.storage.from("job-photos").createSignedUrls(paths, 60 * 60 * 24);
    const out: Record<string, string> = {};
    signed?.forEach((s) => { if (s.path && s.signedUrl) out[s.path] = s.signedUrl; });
    return out;
  });
