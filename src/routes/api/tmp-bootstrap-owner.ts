import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tmp-bootstrap-owner")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (new URL(request.url).hostname !== "localhost") return new Response("no", { status: 403 });
        const { email, password } = await request.json();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });
        return Response.json({ id: data?.user?.id, error: error?.message });
      },
    },
  },
});
