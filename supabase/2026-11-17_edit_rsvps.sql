-- Apply after 2026-11-10_age_group_counts.sql and before deploying the frontend.
begin;

alter table public.rsvps add column if not exists invitation_slug text;

create or replace function public.save_rsvp(
  submission_id uuid,
  response jsonb,
  route_slug text,
  legacy_names text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry public.rsvps := pg_catalog.jsonb_populate_record(null::public.rsvps, response);
  name_key text := lower(btrim(regexp_replace(normalize(entry.representative_name, NFKC), '[[:space:]]+', ' ', 'g')));
  existing_id uuid;
begin
  if submission_id is null or name_key is null
    or (entry.guest_type = 'regular' and route_slug is not null)
    or (entry.guest_type = 'godparent' and (route_slug is null or route_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'))
    or entry.adult_count is null or entry.kid_count is null
  then
    raise exception 'Invalid RSVP' using errcode = '22023';
  end if;

  -- Serialize repeat saves of the same invitation or guest name.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('rsvp:' || coalesce('invite:' || route_slug, 'guest:' || name_key), 0)
  );

  select r.id into existing_id
  from public.rsvps r
  where r.guest_type = entry.guest_type
    and (
      (route_slug is not null and r.invitation_slug = route_slug)
      or (
        r.invitation_slug is null
        and lower(btrim(regexp_replace(normalize(r.representative_name, NFKC), '[[:space:]]+', ' ', 'g')))
          = any(case when route_slug is null then array[name_key] else legacy_names end)
      )
    )
  order by
    (r.invitation_slug is not null) desc,
    (lower(btrim(regexp_replace(normalize(r.representative_name, NFKC), '[[:space:]]+', ' ', 'g'))) = name_key) desc,
    r.updated_at desc, r.created_at desc, r.id desc
  limit 1
  for update;

  if existing_id is null then
    insert into public.rsvps (
      id, representative_name, guest_type, godparent_role, invitation_slug,
      attendance_status, attendee_count, adult_count, kid_count, infant_count,
      infant_seat_meal_count, message
    ) values (
      submission_id, entry.representative_name, entry.guest_type, entry.godparent_role, route_slug,
      entry.attendance_status, entry.attendee_count, entry.adult_count, entry.kid_count, 0,
      0, entry.message
    );
  else
    update public.rsvps set
      representative_name = entry.representative_name,
      godparent_role = entry.godparent_role,
      invitation_slug = route_slug,
      attendance_status = entry.attendance_status,
      attendee_count = entry.attendee_count,
      adult_count = entry.adult_count,
      kid_count = entry.kid_count,
      infant_count = 0,
      infant_seat_meal_count = 0,
      message = entry.message,
      updated_at = now()
    where id = existing_id;
  end if;
end;
$$;

revoke all on function public.save_rsvp(uuid, jsonb, text, text[]) from public, anon, authenticated;
grant execute on function public.save_rsvp(uuid, jsonb, text, text[]) to anon, authenticated;

commit;
