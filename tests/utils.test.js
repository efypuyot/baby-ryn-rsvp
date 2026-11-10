import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, normalizeName, findGodparent, validateRsvp, rsvpPayload, rsvpStats, isPastDeadline } from '../src/utils.js';

const sampleGodparents = [
  { name: 'Marie', role: 'Ninang', aliases: ['Nang Marie'] },
  { name: 'Juan Dela Cruz', role: 'Ninong', aliases: ['Juan'] },
];

test('trims and normalizes names for exact matching', () => {
  assert.equal(cleanName('  Marie   Santos '), 'Marie Santos');
  assert.equal(normalizeName('  MARIE   '), 'marie');
  assert.equal(findGodparent('  mArIe ', sampleGodparents)?.role, 'Ninang');
  assert.equal(findGodparent('Nang Marie', sampleGodparents)?.name, 'Marie');
  assert.equal(findGodparent('Juan', sampleGodparents)?.role, 'Ninong');
  assert.equal(findGodparent('Mari', sampleGodparents), null);
});

test('refuses ambiguous aliases', () => {
  const duplicate = [...sampleGodparents, { name: 'Another', role: 'Ninang', aliases: ['Marie'] }];
  assert.equal(findGodparent('Marie', duplicate), null);
});

test('validates family attendee count and status', () => {
  const input = { representative_name: 'Marie', attendance_status: 'attending', attendee_count: 4, message: '' };
  assert.equal(validateRsvp(input, 20), null);
  assert.match(validateRsvp({ ...input, attendee_count: 0 }, 20), /between/);
  assert.match(validateRsvp({ ...input, attendee_count: 100 }, 20), /between/);
  assert.match(validateRsvp({ ...input, attendance_status: '' }, 20), /select/);
  assert.equal(validateRsvp({ ...input, attendance_status: 'declined', attendee_count: 0 }, 20), null);
});

test('declining forces count zero and matches stats', () => {
  const base = { representative_name: 'Marie', attendance_status: 'declined', attendee_count: 9, message: 'Thanks' };
  assert.equal(rsvpPayload(base, null).attendee_count, 0);
  assert.deepEqual(rsvpStats([
    { attendance_status: 'attending', attendee_count: 4 },
    { attendance_status: 'attending', attendee_count: 3 },
    { attendance_status: 'declined', attendee_count: 0 },
  ]), { responses: 3, attendingFamilies: 2, declinedFamilies: 1, expectedGuests: 7 });
});

test('deadline uses Philippine date end', () => {
  assert.equal(isPastDeadline('2026-12-01', new Date('2026-12-01T12:00:00+08:00')), false);
  assert.equal(isPastDeadline('2026-12-01', new Date('2026-12-02T00:00:01+08:00')), true);
});
