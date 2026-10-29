import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  email: z.string().trim().email().max(255).optional(),
  password: z.string().min(8).max(72).optional(),
});

// Owner changes their own login email/password without needing an inbox confirmation.
export const updateOwnerLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    if (!data.email && !data.password) return { ok: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      ...(data.email ? { email: data.email, email_confirm: true } : {}),
      ...(data.password ? { password: data.password } : {}),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
