export function cleanName(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeName(value) {
  return cleanName(value).toLocaleLowerCase('en-PH');
}

/** Only exact configured names and aliases match. Ambiguous aliases match no one. */
export function findGodparent(value, godparents) {
  const sought = normalizeName(value);
  if (!sought) return null;
  const matches = godparents.filter(person =>
    [person.name, ...(person.aliases ?? [])].some(alias => normalizeName(alias) === sought)
  );
  return matches.length === 1 ? matches[0] : null;
}

export function validateRsvp(form, maxCount = 20) {
  const name = cleanName(form.representative_name);
  if (name.length < 2 || name.length > 120) return 'Please enter your name (2–120 characters).';
  if (!['attending', 'declined'].includes(form.attendance_status)) return 'Please select whether your family can attend.';
  if (form.attendance_status === 'attending' &&
      (!Number.isInteger(Number(form.attendee_count)) || Number(form.attendee_count) < 1 || Number(form.attendee_count) > maxCount)) {
    return `Please enter a number of attendees between 1 and ${maxCount}.`;
  }
  if (String(form.message ?? '').length > 500) return 'Your message must be 500 characters or fewer.';
  return null;
}

export function rsvpPayload(form, godparent) {
  return {
    representative_name: cleanName(form.representative_name),
    guest_type: godparent ? 'godparent' : 'regular',
    godparent_role: godparent?.role ?? null,
    attendance_status: form.attendance_status,
    attendee_count: form.attendance_status === 'attending' ? Number(form.attendee_count) : 0,
    message: String(form.message ?? '').trim() || null,
  };
}

export function rsvpStats(rows) {
  const attending = rows.filter(r => r.attendance_status === 'attending');
  return {
    responses: rows.length,
    attendingFamilies: attending.length,
    declinedFamilies: rows.filter(r => r.attendance_status === 'declined').length,
    expectedGuests: attending.reduce((sum, r) => sum + Number(r.attendee_count || 0), 0),
  };
}

export function isPastDeadline(dateString, now = new Date()) {
  // End of the stated date in Philippine time (UTC+08:00).
  return now.getTime() > new Date(`${dateString}T23:59:59+08:00`).getTime();
}

export function directionsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Philippines')}`;
}
