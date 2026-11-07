-- Guest management for the Taniya & Suresh invitation.
-- Run this once in the Supabase SQL editor, or with the Supabase CLI.
-- The service role key is not used by the website. Add administrators only
-- from the Supabase dashboard, using the commented statement at the bottom.

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  invitation_code text not null unique check (invitation_code ~ '^[A-Z0-9]{6,16}$'),
  phone_number text check (phone_number is null or char_length(phone_number) <= 40),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  guest_category text check (guest_category is null or char_length(guest_category) <= 80),
  church_attendance text not null default 'pending' check (church_attendance in ('pending', 'attending', 'not_attending')),
  reception_attendance text not null default 'pending' check (reception_attendance in ('pending', 'attending', 'not_attending')),
  invitation_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_church_attendance_idx on public.guests (church_attendance);
create index guests_reception_attendance_idx on public.guests (reception_attendance);
create index guests_created_at_idx on public.guests (created_at desc);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create index admin_users_user_id_idx on public.admin_users (user_id);

create or replace function public.touch_guest_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.full_name = btrim(new.full_name);
  new.invitation_code = upper(btrim(new.invitation_code));
  new.updated_at = now();
  return new;
end;
$$;

create trigger guests_touch_updated_at
  before insert or update on public.guests
  for each row
  execute function public.touch_guest_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- Returns only the invited guest's name and the two attendance fields.
create or replace function public.lookup_invitation(code text)
returns table (
  full_name text,
  church_attendance text,
  reception_attendance text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := upper(btrim(coalesce(code, '')));
begin
  if normalized !~ '^[A-Z0-9]{6,16}$' then
    return;
  end if;

  return query
  select guests.full_name, guests.church_attendance, guests.reception_attendance
  from public.guests
  where guests.invitation_code = normalized
  limit 1;
end;
$$;

-- Updates attendance only. Invitation codes and contact details stay unchanged.
create or replace function public.submit_rsvp(
  code text,
  church text,
  reception text
)
returns table (
  full_name text,
  church_attendance text,
  reception_attendance text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := upper(btrim(coalesce(code, '')));
  updated_id uuid;
begin
  if normalized !~ '^[A-Z0-9]{6,16}$' then
    raise exception 'Invalid invitation';
  end if;

  if church not in ('attending', 'not_attending') or reception not in ('attending', 'not_attending') then
    raise exception 'Choose attending or not attending for both events';
  end if;

  update public.guests
  set church_attendance = church,
      reception_attendance = reception
  where invitation_code = normalized
  returning id into updated_id;

  if updated_id is null then
    raise exception 'Invalid invitation';
  end if;

  return query
  select guests.full_name, guests.church_attendance, guests.reception_attendance
  from public.guests
  where guests.id = updated_id;
end;
$$;

revoke all on function public.touch_guest_updated_at() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.lookup_invitation(text) from public;
grant execute on function public.lookup_invitation(text) to anon, authenticated;

revoke all on function public.submit_rsvp(text, text, text) from public;
grant execute on function public.submit_rsvp(text, text, text) to anon, authenticated;

alter table public.guests enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.guests from public, anon;
grant select, insert, update, delete on table public.guests to authenticated;

revoke all on table public.admin_users from public, anon;
grant select on table public.admin_users to authenticated;

create policy guests_admin_select
  on public.guests
  for select
  to authenticated
  using (public.is_admin());

create policy guests_admin_insert
  on public.guests
  for insert
  to authenticated
  with check (public.is_admin());

create policy guests_admin_update
  on public.guests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy guests_admin_delete
  on public.guests
  for delete
  to authenticated
  using (public.is_admin());

create policy admin_users_select_own
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- There is intentionally no public or guest policy for selecting, inserting,
-- updating, or deleting rows in guests. Guests use the two functions above.
-- There is no client policy for inserting admin_users.
--
-- After you create an administrator in Authentication → Users, authorize them:
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'you@example.com');
