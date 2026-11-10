-- Baby Ryn's Christening RSVP — run in Supabase SQL Editor as project owner.
-- Anonymous guests may INSERT only; no anonymous reads, edits, or deletes.
-- Only specifically authorized organizer accounts may SELECT RSVP rows.

create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key,
  representative_name text not null check (char_length(btrim(representative_name)) between 2 and 120),
  guest_type text not null check (guest_type in ('godparent', 'regular')),
  godparent_role text null check (godparent_role in ('Ninong', 'Ninang')),
  attendance_status text not null check (attendance_status in ('attending', 'declined')),
  attendee_count integer not null check (attendee_count between 0 and 20),
  message text null check (char_length(message) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consistent_guest_role check (
    (guest_type = 'regular' and godparent_role is null) or
    (guest_type = 'godparent' and godparent_role is not null)
  ),
  constraint consistent_attendee_count check (
    (attendance_status = 'attending' and attendee_count >= 1) or
    (attendance_status = 'declined' and attendee_count = 0)
  )
);

create table if not exists public.organizer_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;
alter table public.organizer_accounts enable row level security;

-- Keep grants explicit: public guests can write the actual RSVP fields only.
revoke all on table public.rsvps from public, anon, authenticated;
revoke all on table public.organizer_accounts from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant insert (id, representative_name, guest_type, godparent_role, attendance_status, attendee_count, message)
  on public.rsvps to anon;
grant select on public.rsvps to authenticated;
grant select (user_id) on public.organizer_accounts to authenticated;

-- Cleanly replace policies if rerunning schema.sql.
drop policy if exists "Guests may create RSVP" on public.rsvps;
drop policy if exists "Organizers may view RSVPs" on public.rsvps;
drop policy if exists "Organizers can verify own membership" on public.organizer_accounts;

create policy "Guests may create RSVP"
  on public.rsvps for insert to anon
  with check (true);

create policy "Organizers can verify own membership"
  on public.organizer_accounts for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Organizers may view RSVPs"
  on public.rsvps for select to authenticated
  using (
    exists (
      select 1 from public.organizer_accounts o
      where o.user_id = (select auth.uid())
    )
  );

-- IMPORTANT: Create each organizer in Authentication > Users first.
-- Then use their actual Auth User ID in this statement (execute separately):
-- insert into public.organizer_accounts (user_id) values ('REAL-USER-UUID-HERE');
-- Never use a frontend password or hardcode Supabase service_role/secret keys.
-- Note: public anonymous forms need anti-spam protection for large/untrusted traffic.
-- Attendee cap in this file (20) should match src/config.js.
