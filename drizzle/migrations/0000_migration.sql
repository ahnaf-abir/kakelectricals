create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First account to sign in becomes the owner (admin)
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.assign_first_admin();

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text not null default '',
  suburb text not null default '',
  job_date date,
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "anyone can view jobs" on public.jobs for select to anon, authenticated using (true);
create policy "admin insert jobs" on public.jobs for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update jobs" on public.jobs for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete jobs" on public.jobs for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 6 and 30),
  email text check (email is null or char_length(email) <= 255),
  suburb text not null check (char_length(suburb) between 1 and 100),
  details text not null check (char_length(details) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant insert on public.quote_requests to anon, authenticated;
grant select, delete on public.quote_requests to authenticated;
grant all on public.quote_requests to service_role;
alter table public.quote_requests enable row level security;
create policy "anyone can request quote" on public.quote_requests for insert to anon, authenticated with check (true);
create policy "admin read quotes" on public.quote_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete quotes" on public.quote_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "public read job photos" on storage.objects for select using (bucket_id = 'job-photos');
create policy "admin upload job photos" on storage.objects for insert to authenticated with check (bucket_id = 'job-photos' and public.has_role(auth.uid(),'admin'));
create policy "admin delete job photos" on storage.objects for delete to authenticated using (bucket_id = 'job-photos' and public.has_role(auth.uid(),'admin'));