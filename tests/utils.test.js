import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanName,
  normalizeName,
  findGodparent,
  validateRsvp,
  rsvpPayload,
  rsvpStats,
  isPastDeadline,
  totalAttendees,
} from "../src/utils.js";

const sampleGodparents = [
  { name: "Marie", role: "Ninang", aliases: ["Nang Marie"] },
  { name: "Juan Dela Cruz", role: "Ninong", aliases: ["Juan"] },
];
const sampleForm = {
  representative_name: "Marie",
  attendance_status: "attending",
  adult_count: 2,
  kid_count: 1,
  infant_count: 1,
  infant_seat_meal_count: 0,
  message: "",
};

test("trims and normalizes names for exact matching", () => {
  assert.equal(cleanName("  Marie   Santos "), "Marie Santos");
  assert.equal(normalizeName("  MARIE   "), "marie");
  assert.equal(findGodparent("  mArIe ", sampleGodparents)?.role, "Ninang");
  assert.equal(findGodparent("Nang Marie", sampleGodparents)?.name, "Marie");
  assert.equal(findGodparent("Juan", sampleGodparents)?.role, "Ninong");
  assert.equal(findGodparent("Mari", sampleGodparents), null);
});

test("refuses ambiguous aliases", () => {
  const duplicate = [
    ...sampleGodparents,
    { name: "Another", role: "Ninang", aliases: ["Marie"] },
  ];
  assert.equal(findGodparent("Marie", duplicate), null);
});

test("validates family age groups, total limits and infant seat counts", () => {
  assert.equal(validateRsvp(sampleForm, 20), null);
  assert.equal(totalAttendees(sampleForm), 4);
  assert.match(
    validateRsvp(
      { ...sampleForm, adult_count: 0, kid_count: 0, infant_count: 0 },
      20,
    ),
    /total/,
  );
  assert.match(validateRsvp({ ...sampleForm, adult_count: 21 }, 20), /total/);
  assert.match(validateRsvp({ ...sampleForm, kid_count: 1.5 }, 20), /whole/);
  assert.match(validateRsvp({ ...sampleForm, kid_count: "" }, 20), /whole/);
  assert.match(
    validateRsvp({ ...sampleForm, infant_seat_meal_count: 2 }, 20),
    /cannot exceed/,
  );
  assert.match(
    validateRsvp({ ...sampleForm, attendance_status: "" }, 20),
    /select/,
  );
});

test("one RSVP represents a family, with infant subset not double counted", () => {
  const payload = rsvpPayload(
    { ...sampleForm, infant_seat_meal_count: 1 },
    sampleGodparents[0],
  );
  assert.equal(payload.attendee_count, 4);
  assert.equal(payload.adult_count, 2);
  assert.equal(payload.kid_count, 1);
  assert.equal(payload.infant_count, 1);
  assert.equal(payload.infant_seat_meal_count, 1);
  assert.equal(payload.guest_type, "godparent");
});

test("declining forces every category to zero", () => {
  const form = { ...sampleForm, attendance_status: "declined" };
  assert.equal(validateRsvp(form), null);
  const payload = rsvpPayload(form, null);
  for (const field of [
    "attendee_count",
    "adult_count",
    "kid_count",
    "infant_count",
    "infant_seat_meal_count",
  ])
    assert.equal(payload[field], 0);
});

test("dashboard stats separate paid headcount, physical guests, and old uncategorized responses", () => {
  assert.deepEqual(
    rsvpStats([
      {
        attendance_status: "attending",
        attendee_count: 4,
        adult_count: 2,
        kid_count: 1,
        infant_count: 1,
        infant_seat_meal_count: 0,
      },
      {
        attendance_status: "attending",
        attendee_count: 3,
        adult_count: 1,
        kid_count: 1,
        infant_count: 1,
        infant_seat_meal_count: 1,
      },
      {
        attendance_status: "attending",
        attendee_count: 2,
        adult_count: null,
        kid_count: null,
        infant_count: null,
        infant_seat_meal_count: null,
      },
      {
        attendance_status: "declined",
        attendee_count: 0,
        adult_count: 0,
        kid_count: 0,
        infant_count: 0,
        infant_seat_meal_count: 0,
      },
    ]),
    {
      responses: 4,
      attendingFamilies: 3,
      declinedFamilies: 1,
      expectedGuests: 9,
      adultGuests: 3,
      kidGuests: 2,
      infantGuests: 2,
      infantsNeedingSeatOrMeal: 1,
      packageHeadcount: 6,
      uncategorizedGuests: 2,
    },
  );
});

test("deadline uses Philippine date end", () => {
  assert.equal(
    isPastDeadline("2026-12-01", new Date("2026-12-01T12:00:00+08:00")),
    false,
  );
  assert.equal(
    isPastDeadline("2026-12-01", new Date("2026-12-02T00:00:01+08:00")),
    true,
  );
});
