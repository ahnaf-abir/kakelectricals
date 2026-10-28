<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Owner access = `admin` row in `user_roles` (first account to sign in gets it via trigger); all job/quote writes are gated by `has_role` RLS, so UI checks are cosmetic only.
- Job photos live in the private `job-photos` bucket (public buckets are blocked in this workspace); store object paths in `jobs.photos` and show them via signed URLs.
- `bun.lock` tarball URLs must stay empty (`""`, default registry); after any install, strip `http://npm-cache.lovable.net/...` URLs because the publish builder cannot resolve that sandbox-only host.
