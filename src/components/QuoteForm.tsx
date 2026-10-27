import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().min(6, "Please enter a valid phone number").max(30),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email").max(255)]),
  suburb: z.string().trim().min(1, "Please enter your suburb").max(100),
  details: z.string().trim().min(1, "Tell us about the job").max(2000),
});

const field = "w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

export function QuoteForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { email, ...rest } = parsed.data;
    const { error } = await supabase.from("quote_requests").insert({ ...rest, email: email || null });
    setBusy(false);
    if (error) return toast.error("Couldn't send — please call us instead.");
    form.reset();
    setDone(true);
  }

  if (done)
    return (
      <div className="rounded-xl border border-border bg-background p-8 text-center">
        <h3 className="text-display text-2xl">Thanks — request received!</h3>
        <p className="mt-2 text-muted-foreground">We'll get back to you shortly. For emergencies, please call.</p>
        <button onClick={() => setDone(false)} className="mt-4 text-sm font-semibold underline">Send another</button>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-border bg-background p-5 sm:grid-cols-2 sm:p-8">
      <input name="name" placeholder="Your name *" autoComplete="name" className={field} />
      <input name="phone" type="tel" placeholder="Phone *" autoComplete="tel" className={field} />
      <input name="email" type="email" placeholder="Email (optional)" autoComplete="email" className={field} />
      <input name="suburb" placeholder="Suburb / location *" autoComplete="address-level2" className={field} />
      <textarea name="details" rows={4} placeholder="What do you need done? *" className={`${field} sm:col-span-2`} />
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-60 sm:col-span-2">
        <Send className="h-5 w-5" /> {busy ? "Sending…" : "Request a free quote"}
      </button>
    </form>
  );
}
