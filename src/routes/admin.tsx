import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Trash2, LogOut, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET, jobsQuery, formatJobDate } from "@/lib/jobs";
import { useServerFn } from "@tanstack/react-start";
import { updateOwnerLogin } from "@/lib/owner.functions";

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function SignIn() {
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = credSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the form"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) toast.error("Wrong email or password");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-3 text-center">
      <h1 className="text-display text-3xl">Owner sign in</h1>
      <p className="text-muted-foreground">Sign in to add jobs and view quote requests.</p>
      <input name="email" type="email" placeholder="Email" autoComplete="username" className={field} />
      <input name="password" type="password" placeholder="Password" autoComplete="current-password" className={field} />
      <button disabled={busy} className="w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Please wait…" : "Sign in"}</button>
    </form>
  );
}

function Settings({ user }: { user: User }) {
  const qc = useQueryClient();
  const update = useServerFn(updateOwnerLogin);
  const [busy, setBusy] = useState<string | null>(null);
  const { data: alertEmail } = useQuery({
    queryKey: ["owner-settings"],
    queryFn: async () => (await supabase.from("owner_settings").select("quote_alert_email").maybeSingle()).data?.quote_alert_email ?? "",
  });

  async function saveLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const rawEmail = String(fd.get("email") ?? "").trim();
    const email = rawEmail && rawEmail !== user.email ? rawEmail : undefined;
    const password = String(fd.get("password") ?? "") || undefined;
    if (password && password !== String(fd.get("confirm") ?? "")) return void toast.error("Passwords don't match");
    const parsed = z.object({ email: z.string().email().optional(), password: z.string().min(8, "Password must be at least 8 characters").optional() }).safeParse({ email, password });
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Check the form");
    if (!email && !password) return void toast.info("Nothing to change");
    setBusy("login");
    try {
      await update({ data: parsed.data });
      toast.success("Login updated. Use the new details next time you sign in.");
      if (password) { form.reset(); }
      await supabase.auth.refreshSession();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update login");
    } finally { setBusy(null); }
  }

  async function saveAlert(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("alert") ?? "").trim();
    if (value && !z.string().email().safeParse(value).success) return void toast.error("Enter a valid email");
    setBusy("alert");
    const { error } = await supabase.from("owner_settings").upsert({ id: true, quote_alert_email: value || null, updated_at: new Date().toISOString() });
    setBusy(null);
    if (error) return void toast.error(error.message);
    toast.success("Quote alert email saved");
    qc.invalidateQueries({ queryKey: ["owner-settings"] });
  }

  return (
    <section className="space-y-6">
      <h2 className="text-display text-2xl">Settings</h2>
      <form onSubmit={saveLogin} className="space-y-3 rounded-2xl border border-border p-5">
        <h3 className="font-semibold">Owner login</h3>
        <input name="email" type="email" defaultValue={user.email ?? ""} placeholder="Login email" className={field} />
        <input name="password" type="password" placeholder="New password (leave blank to keep)" autoComplete="new-password" className={field} />
        <input name="confirm" type="password" placeholder="Confirm new password" autoComplete="new-password" className={field} />
        <button disabled={busy === "login"} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60">{busy === "login" ? "Saving…" : "Save login"}</button>
      </form>
      <form key={alertEmail} onSubmit={saveAlert} className="space-y-3 rounded-2xl border border-border p-5">
        <h3 className="font-semibold">Send quote requests to</h3>
        <input name="alert" type="email" defaultValue={alertEmail ?? ""} placeholder="you@example.com" className={field} />
        <button disabled={busy === "alert"} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60">{busy === "alert" ? "Saving…" : "Save"}</button>
      </form>
    </section>
  );
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner Area | K A K Electricals" },
      { name: "description", content: "Private area for adding past jobs and viewing quote requests." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Area | K A K Electricals" },
      { property: "og:description", content: "Private owner area." },
    ],
  }),
  component: AdminPage,
});

const field = "w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary";

function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async (u: User | null) => {
      setUser(u);
      if (!u) return setIsAdmin(false);
      const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    supabase.auth.getUser().then(({ data }) => check(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((e: string, s: { user: User } | null) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") check(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Website</Link>
          {user && <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-sm"><LogOut className="h-4 w-4" /> Sign out</button>}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10">
        {user === undefined ? <p>Loading…</p> : !user ? (
          <SignIn />
        ) : !isAdmin ? (
          <p className="text-center text-muted-foreground">This account ({user.email}) doesn't have owner access.</p>
        ) : (
          <div className="space-y-14">
            <AddJob />
            <JobsList />
            <Quotes />
            <Settings user={user} />
          </div>
        )}
      </main>
    </div>
  );
}

const jobSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(150),
  suburb: z.string().trim().max(100),
  job_date: z.string().max(10),
  notes: z.string().trim().max(3000),
});

function AddJob() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = jobSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the form"); return; }
    const files = (fd.getAll("photos") as File[]).filter((f) => f.size > 0);
    setBusy(true);
    try {
      const paths: string[] = [];
      for (const f of files) {
        const path = `${crypto.randomUUID()}.${f.name.split(".").pop() || "jpg"}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
        if (error) throw error;
        paths.push(path);
      }
      const { error } = await supabase.from("jobs").insert({ ...parsed.data, job_date: parsed.data.job_date || null, photos: paths });
      if (error) throw error;
      form.reset();
      toast.success("Job added");
      qc.invalidateQueries({ queryKey: ["jobs"] });
    } catch {
      toast.error("Couldn't save the job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="text-display text-2xl">Add a job</h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <input name="title" placeholder="Title (e.g. Pendant lights install) *" className={`${field} sm:col-span-2`} />
        <input name="suburb" placeholder="Suburb" className={field} />
        <input name="job_date" type="date" className={field} />
        <textarea name="notes" rows={4} placeholder="What was done" className={`${field} sm:col-span-2`} />
        <label className="sm:col-span-2 text-sm font-medium">Photos
          <input name="photos" type="file" accept="image/*" multiple className="mt-1 block w-full text-sm" />
        </label>
        <button disabled={busy} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60 sm:col-span-2">{busy ? "Saving…" : "Save job"}</button>
      </form>
    </section>
  );
}

function JobsList() {
  const qc = useQueryClient();
  const { data } = useQuery(jobsQuery());
  async function del(id: string, photos: string[]) {
    if (!confirm("Delete this job?")) return;
    if (photos.length) await supabase.storage.from(BUCKET).remove(photos);
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) { toast.error("Couldn't delete"); return; }
    qc.invalidateQueries({ queryKey: ["jobs"] });
  }
  return (
    <section>
      <h2 className="text-display text-2xl">Your jobs</h2>
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
        {data?.length === 0 && <li className="p-4 text-muted-foreground">No jobs yet.</li>}
        {data?.map((j) => (
          <li key={j.id} className="flex items-center gap-3 p-3">
            {j.photoUrls[0] ? <img src={j.photoUrls[0]} alt="" className="h-14 w-14 rounded-md object-cover" /> : <div className="h-14 w-14 rounded-md bg-muted" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{j.title}</p>
              <p className="text-xs text-muted-foreground">{[j.suburb, formatJobDate(j.job_date)].filter(Boolean).join(" · ")} · {j.photos.length} photo(s)</p>
            </div>
            <button aria-label="Delete job" onClick={() => del(j.id, j.photos)} className="p-2 text-destructive"><Trash2 className="h-5 w-5" /></button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Quotes() {
  const { data, refetch } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  async function del(id: string) {
    await supabase.from("quote_requests").delete().eq("id", id);
    refetch();
  }
  return (
    <section>
      <h2 className="text-display text-2xl">Quote requests</h2>
      <div className="mt-4 space-y-3">
        {data?.length === 0 && <p className="text-muted-foreground">No requests yet.</p>}
        {data?.map((q: { id: string; name: string; suburb: string; phone: string; email: string | null; details: string; created_at: string }) => (
          <div key={q.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{q.name} · {q.suburb}</p>
                <p className="text-sm"><a className="underline" href={`tel:${q.phone}`}>{q.phone}</a>{q.email && <> · <a className="underline" href={`mailto:${q.email}`}>{q.email}</a></>}</p>
              </div>
              <button aria-label="Delete request" onClick={() => del(q.id)} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{q.details}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString("en-AU")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
