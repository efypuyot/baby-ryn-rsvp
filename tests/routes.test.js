import test from "node:test";
import assert from "node:assert/strict";
import { GODPARENTS } from "../src/config.js";
import { findGodparentByRoute, godparentSalutation, rsvpPayload, validateRsvp } from "../src/utils.js";

const people = [
  { name: "Marie", slug: "ninang-marie", role: "Ninang" },
  { name: "Juan", slug: "ninong-juan", role: "Ninong" },
];
test("individual routes recognize an explicitly configured godparent", () => {
  assert.equal(findGodparentByRoute("/ninang-marie", people)?.name, "Marie");
  assert.equal(findGodparentByRoute("/ninong-juan/", people)?.role, "Ninong");
  assert.equal(findGodparentByRoute("/guest", people), null);
  assert.equal(findGodparentByRoute("/", people), null);
  assert.equal(findGodparentByRoute("/ninang-unknown", people), null);
});
test("ambiguous repeated routes do not match", () => {
  assert.equal(
    findGodparentByRoute("/ninang-marie", [people[0], people[0]]),
    null,
  );
});
test("regular guests must enter a name at RSVP", () => {
  assert.match(
    validateRsvp({ representative_name: "", attendance_status: "declined" }),
    /name/,
  );
});

test("each configured godparent has a unique route and letter paragraphs", () => {
  for (const person of GODPARENTS) {
    assert.equal(findGodparentByRoute(`/${person.slug}`, GODPARENTS), person);
    assert.ok(person.letter.paragraphs.length > 0);
    assert.ok(person.letter.paragraphs.every((paragraph) => paragraph.trim()));
  }
});

test("Jase and Micah share one letter and one godparent RSVP", () => {
  const couple = findGodparentByRoute("/ninong-jase-and-ninang-micah", GODPARENTS);
  assert.ok(couple);
  assert.equal(findGodparentByRoute("/ninong-jase", GODPARENTS), couple);
  assert.equal(findGodparentByRoute("/ninang-micah", GODPARENTS), couple);
  const name = godparentSalutation(couple);
  assert.equal(name, "Ninong Jase & Ninang Micah");
  const form = {
    representative_name: name,
    attendance_status: "attending",
    adult_count: 2,
    kid_count: 0,
  };
  assert.equal(validateRsvp(form), null);
  const payload = rsvpPayload(form, couple);
  assert.equal(payload.representative_name, name);
  assert.equal(payload.guest_type, "godparent");
  assert.equal(payload.godparent_role, "Ninong");
  assert.equal(payload.attendee_count, 2);
});
