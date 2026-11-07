-- Safe additive migration for event-based guest invitations.
-- Existing guest rows and RSVP values are preserved.
-- This migration only adds explicit invitation flags and tightens the public functions.

do $$
begin
  if to_regclass('public.guests') is null then
    raise exception 'The public.guests table does not exist yet. Apply the guest management migration first.';
  end if;
end;
$$;

alter table public.guests
  add column if not exists invited_to_church boolean,
  add column if not exists invited_to_reception boolean;

update public.guests
set invited_to_church = true
where invited_to_church is null;

update public.guests
set invited_to_reception = true
where invited_to_reception is null;

alter table public.guests
  alter column invited_to_church set default true,
  alter column invited_to_reception set default true,
  alter column invited_to_church set not null,
  alter column invited_to_reception set not null;

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
      or new.invited_to_church is distinct from old.invited_to_church
      or new.invited_to_reception is distinct from old.invited_to_reception
      or new.invitation_sent is distinct from old.invitation_sent
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Protected guest fields cannot be changed';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.lookup_invitation(code text)
returns table (
  full_name text,
  church_attendance text,
  reception_attendance text,
  invited_to_church boolean,
  invited_to_reception boolean,
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
    return query
    select null::text, null::text, null::text, null::boolean, null::boolean, 'rate_limited'::text;
    return;
  end if;

  if normalized !~ '^[A-Z0-9]{6,16}$' then
    return query
    select null::text, null::text, null::text, null::boolean, null::boolean, 'invalid'::text;
    return;
  end if;

  return query
  select guests.full_name,
         guests.church_attendance,
         guests.reception_attendance,
         guests.invited_to_church,
         guests.invited_to_reception,
         'ok'::text
  from public.guests
  where guests.invitation_code = normalized
  limit 1;

  if not found then
    return query
    select null::text, null::text, null::text, null::boolean, null::boolean, 'invalid'::text;
  end if;
end;
$$;

create or replace function public.submit_rsvp(
  code text,
  church text,
  reception text
)
returns table (
  full_name text,
  church_attendance text,
  reception_attendance text,
  invited_to_church boolean,
  invited_to_reception boolean,
  outcome text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  normalized text := upper(btrim(coalesce(code, '')));
  guest_record public.guests%rowtype;
  church_value text := null;
  reception_value text := null;
begin
  if public.consume_invitation_attempt('rsvp') = 'rate_limited' then
    return query
    select null::text, null::text, null::text, null::boolean, null::boolean, 'rate_limited'::text;
    return;
  end if;

  if normalized !~ '^[A-Z0-9]{6,16}$' then
    return query
    select null::text, null::text, null::text, null::boolean, null::boolean, 'invalid'::text;
    return;
  end if;

  select *
  into guest_record
  from public.guests
  where invitation_code = normalized
  limit 1;

  if not found then
    return query
    select null::text, null::text, null::text, null::boolean, null::boolean, 'invalid'::text;
    return;
  end if;

  if guest_record.invited_to_church then
    if church is null or church not in ('attending', 'not_attending') then
      return query
      select null::text, null::text, null::text, guest_record.invited_to_church, guest_record.invited_to_reception, 'validation'::text;
      return;
    end if;

    church_value := church;
  elsif church is not null and btrim(coalesce(church, '')) not in ('', 'pending') then
    return query
    select null::text, null::text, null::text, guest_record.invited_to_church, guest_record.invited_to_reception, 'invalid'::text;
    return;
  end if;

  if guest_record.invited_to_reception then
    if reception is null or reception not in ('attending', 'not_attending') then
      return query
      select null::text, null::text, null::text, guest_record.invited_to_church, guest_record.invited_to_reception, 'validation'::text;
      return;
    end if;

    reception_value := reception;
  elsif reception is not null and btrim(coalesce(reception, '')) not in ('', 'pending') then
    return query
    select null::text, null::text, null::text, guest_record.invited_to_church, guest_record.invited_to_reception, 'invalid'::text;
    return;
  end if;

  if guest_record.invited_to_church and guest_record.invited_to_reception then
    update public.guests
    set church_attendance = church_value,
        reception_attendance = reception_value
    where id = guest_record.id;
  elsif guest_record.invited_to_church then
    update public.guests
    set church_attendance = church_value
    where id = guest_record.id;
  elsif guest_record.invited_to_reception then
    update public.guests
    set reception_attendance = reception_value
    where id = guest_record.id;
  end if;

  return query
  select guests.full_name,
         guests.church_attendance,
         guests.reception_attendance,
         guests.invited_to_church,
         guests.invited_to_reception,
         'ok'::text
  from public.guests
  where guests.id = guest_record.id;
end;
$$;

revoke all on function public.lookup_invitation(text) from public;
grant execute on function public.lookup_invitation(text) to anon, authenticated;

revoke all on function public.submit_rsvp(text, text, text) from public;
grant execute on function public.submit_rsvp(text, text, text) to anon, authenticated;
