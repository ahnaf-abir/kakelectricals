create table public.owner_settings (
  id boolean primary key default true check (id),
  quote_alert_email text check (quote_alert_email is null or char_length(quote_alert_email) <= 255),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.owner_settings to authenticated;
grant all on public.owner_settings to service_role;
alter table public.owner_settings enable row level security;
create policy "admin read settings" on public.owner_settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin insert settings" on public.owner_settings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update settings" on public.owner_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));