-- Follow-up to 20261106180000_guest_management.sql.
-- Safe to run once after that migration. It does not recreate guests or admin_users.
-- There is still no public SELECT, INSERT, UPDATE, or DELETE policy on guests.

do $$
begin
  if to_regclass('public.guests') is null or to_regclass('public.admin_users') is null then
    raise exception 'Apply 20261106180000_guest_management.sql before this migration';
  end if;
end;
$$;

-- Default privileges in Supabase grant ALL (including TRUNCATE) to anon and
-- authenticated. TRUNCATE ignores row level security, so remove those grants
-- and restore only the privileges the admin policies need.
revoke all on table public.guests from public, anon, authenticated;
grant select, insert, update, delete on table public.guests to authenticated;

revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;

create table if not exists public.invitation_rate_limits (
  id bigint generated always as identity primary key,
  client_key text not null,
  action text not null check (action in ('lookup', 'rsvp')),
  created_at timestamptz not null default now()
);

create index if not exists invitation_rate_limits_client_idx
  on public.invitation_rate_limits (client_key, action, created_at desc);

alter table public.invitation_rate_limits enable row level security;

revoke all on table public.invitation_rate_limits from public, anon, authenticated;

-- No policies: only the security-definer invitation functions may write here.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Keeps updated_at current and stops a non-admin update, including the RSVP
-- function, from changing identity or contact fields.
create or replace function public.touch_guest_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.full_name = btrim(new.full_name);
  new.invitation_code = upper(btrim(new.invitation_code));
  new.updated_at = now();

  if tg_op = 'UPDATE' and not public.is_admin() then
    if new.id is distinct from old.id
      or new.full_name is distinct from old.full_name
      or new.invitation_code is distinct from old.invitation_code
      or new.phone_number is distinct from old.phone_number
      or new.email is distinct from old.email
      or new.guest_category is distinct from old.guest_category
      or new.invitation_sent is distinct from old.invitation_sent
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Protected guest fields cannot be changed';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.touch_guest_updated_at() from public, anon, authenticated;

create or replace function public.consume_invitation_attempt(action_name text)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  headers json;
  forwarded text;
  caller_key text;
  recent_count integer;
  max_attempts integer;
begin
  if action_name not in ('lookup', 'rsvp') then
    return 'rate_limited';
  end if;

  begin
    headers := nullif(current_setting('request.headers', true), '')::json;
  exception
    when others then
      headers := null;
  end;

  caller_key := nullif(btrim(coalesce(headers->>'cf-connecting-ip', '')), '');
  if caller_key is null then
    caller_key := nullif(btrim(coalesce(headers->>'x-real-ip', '')), '');
  end if;
  if caller_key is null then
    forwarded := coalesce(headers->>'x-forwarded-for', '');
    caller_key := nullif(btrim(split_part(forwarded, ',', 1)), '');
  end if;
  if caller_key is null then
    caller_key := 'unknown';
  end if;

  caller_key := md5(caller_key);

  insert into public.invitation_rate_limits (client_key, action)
  values (caller_key, action_name);

  delete from public.invitation_rate_limits
  where created_at < now() - interval '1 day';

  max_attempts := case
    when action_name = 'lookup' and caller_key = md5('unknown') then 300
    when action_name = 'lookup' then 40
    when caller_key = md5('unknown') then 80
    else 12
  end;

  select count(*)
  into recent_count
  from public.invitation_rate_limits
  where client_key = caller_key
    and action = action_name
    and created_at > now() - interval '10 minutes';

  if recent_count > max_attempts then
    return 'rate_limited';
  end if;

  return 'ok';
end;
$$;

revoke all on function public.consume_invitation_attempt(text) from public, anon, authenticated;

drop function if exists public.lookup_invitation(text);
drop function if exists public.submit_rsvp(text, text, text);

create function public.lookup_invitation(code text)
returns table (
  full_name text,
  church_attendance text,
  reception_attendance text,
  outcome text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  normalized text := upper(btrim(coalesce(code, '')));
begin
  if public.consume_invitation_attempt('lookup') = 'rate_limited' then
    return query select null::text, null::text, null::text, 'rate_limited'::text;
    return;
  end if;

  if normalized !~ '^[A-Z0-9]{6,16}$' then
    return query select null::text, null::text, null::text, 'invalid'::text;
    return;
  end if;

  return query
  select guests.full_name, guests.church_attendance, guests.reception_attendance, 'ok'::text
  from public.guests
  where guests.invitation_code = normalized
  limit 1;

  if not found then
    return query select null::text, null::text, null::text, 'invalid'::text;
  end if;
end;
$$;

create function public.submit_rsvp(
  code text,
  church text,
  reception text
)
returns table (
  full_name text,
  church_attendance text,
  reception_attendance text,
  outcome text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  normalized text := upper(btrim(coalesce(code, '')));
  updated_id uuid;
begin
  if public.consume_invitation_attempt('rsvp') = 'rate_limited' then
    return query select null::text, null::text, null::text, 'rate_limited'::text;
    return;
  end if;

  if normalized !~ '^[A-Z0-9]{6,16}$' then
    return query select null::text, null::text, null::text, 'invalid'::text;
    return;
  end if;

  if church not in ('attending', 'not_attending') or reception not in ('attending', 'not_attending') then
    return query select null::text, null::text, null::text, 'validation'::text;
    return;
  end if;

  update public.guests
  set church_attendance = church,
      reception_attendance = reception
  where invitation_code = normalized
  returning id into updated_id;

  if updated_id is null then
    return query select null::text, null::text, null::text, 'invalid'::text;
    return;
  end if;

  return query
  select guests.full_name, guests.church_attendance, guests.reception_attendance, 'ok'::text
  from public.guests
  where guests.id = updated_id;
end;
$$;

revoke all on function public.lookup_invitation(text) from public;
grant execute on function public.lookup_invitation(text) to anon, authenticated;

revoke all on function public.submit_rsvp(text, text, text) from public;
grant execute on function public.submit_rsvp(text, text, text) to anon, authenticated;
