-- One-time migration for EXISTING deployed Baby Ryn RSVP projects.
-- Run in Supabase Dashboard > SQL Editor before deploying the new React code.
-- Existing family RSVP records and their original total attendee_count remain intact.
-- Existing RSVPs are left with NULL age columns, so their ages are not invented.

begin;

alter table public.rsvps
  add column if not exists adult_count integer,
  add column if not exists kid_count integer,
  add column if not exists infant_count integer,
  add column if not exists infant_seat_meal_count integer;

-- Old age-unknown RSVPs may have all four fields NULL.
-- Every new categorized RSVP must have a complete nonnegative breakdown.
-- Baby counts stay separate: infant_seat_meal_count is a SUBSET of infant_count.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.rsvps'::regclass
      and conname = 'consistent_age_group_counts'
  ) then
    alter table public.rsvps
      add constraint consistent_age_group_counts check (
        (adult_count is null and kid_count is null and infant_count is null and infant_seat_meal_count is null)
        or (
          adult_count is not null and adult_count >= 0 and
          kid_count is not null and kid_count >= 0 and
          infant_count is not null and infant_count >= 0 and
          infant_seat_meal_count is not null and infant_seat_meal_count >= 0 and
          infant_seat_meal_count <= infant_count and
          attendee_count = adult_count + kid_count + infant_count
        )
      );
  end if;
end $$;

-- The earlier schema grants guests column-specific INSERT permissions.
-- These new fields must be explicitly granted as well.
grant insert (adult_count, kid_count, infant_count, infant_seat_meal_count)
  on table public.rsvps to anon;

-- No new SELECT, UPDATE, or DELETE privileges are granted to guests.
-- Existing organizer SELECT policy still protects the new columns.
commit;
