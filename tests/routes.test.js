import test from "node:test";
import assert from "node:assert/strict";
import { GODPARENTS } from "../src/config.js";
import { findGodparentByRoute, validateRsvp } from "../src/utils.js";

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

test("each configured godparent has a unique route and one letter entry", () => {
  for (const person of GODPARENTS) {
    assert.equal(findGodparentByRoute(`/${person.slug}`, GODPARENTS), person);
    assert.deepEqual(Object.keys(person.letter), ["paragraphs"]);
    assert.equal(person.letter.paragraphs.length, 1);
    assert.ok(person.letter.paragraphs[0].trim());
  }
});
