export function cleanName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeName(value) {
  return cleanName(value).toLocaleLowerCase("en-PH");
}

/** Only exact configured names and aliases match. Ambiguous aliases match no one. */
export function findGodparent(value, godparents) {
  const sought = normalizeName(value);
  if (!sought) return null;
  const matches = godparents.filter((person) =>
    [person.name, ...(person.aliases ?? [])].some(
      (alias) => normalizeName(alias) === sought,
    ),
  );
  return matches.length === 1 ? matches[0] : null;
}

/** The headcount includes infants, even if they do not need a seat or package. */
function countOrNaN(value) {
  if (value === null || value === undefined || String(value).trim() === "")
    return NaN;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : NaN;
}

export function totalAttendees(form) {
  return (
    countOrNaN(form.adult_count) +
    countOrNaN(form.kid_count) +
    countOrNaN(form.infant_count)
  );
}

export function validateRsvp(form, maxCount = 20) {
  const name = cleanName(form.representative_name);
  if (name.length < 2 || name.length > 120)
    return "Please enter your name (2–120 characters).";
  if (!["attending", "declined"].includes(form.attendance_status))
    return "Please select whether your family can attend.";
  if (form.attendance_status === "attending") {
    const counts = [
      form.adult_count,
      form.kid_count,
      form.infant_count,
      form.infant_seat_meal_count,
    ].map(countOrNaN);
    if (counts.some((count) => !Number.isFinite(count)))
      return "Please enter a valid whole number (0 or more) for each age group.";
    const [adults, kids, infants, infantsNeedingSeatOrMeal] = counts;
    if (adults + kids + infants < 1 || adults + kids + infants > maxCount)
      return `Please enter a total between 1 and ${maxCount} attendees.`;
    if (infantsNeedingSeatOrMeal > infants)
      return "Infants needing a seat or meal cannot exceed the total number of infants.";
  }
  if (String(form.message ?? "").length > 500)
    return "Your message must be 500 characters or fewer.";
  return null;
}

export function rsvpPayload(form, godparent) {
  const attending = form.attendance_status === "attending";
  const adultCount = attending ? Number(form.adult_count) : 0;
  const kidCount = attending ? Number(form.kid_count) : 0;
  const infantCount = attending ? Number(form.infant_count) : 0;
  const infantSeatMealCount = attending
    ? Number(form.infant_seat_meal_count)
    : 0;
  return {
    representative_name: cleanName(form.representative_name),
    guest_type: godparent ? "godparent" : "regular",
    godparent_role: godparent?.role ?? null,
    attendance_status: form.attendance_status,
    attendee_count: adultCount + kidCount + infantCount,
    adult_count: adultCount,
    kid_count: kidCount,
    infant_count: infantCount,
    infant_seat_meal_count: infantSeatMealCount,
    message: String(form.message ?? "").trim() || null,
  };
}

export function rsvpStats(rows) {
  const attending = rows.filter((row) => row.attendance_status === "attending");
  const categorized = attending.filter((row) =>
    [
      row.adult_count,
      row.kid_count,
      row.infant_count,
      row.infant_seat_meal_count,
    ].every(Number.isInteger),
  );
  const sum = (list, field) =>
    list.reduce((count, row) => count + Number(row[field] || 0), 0);
  const knownGuests = sum(categorized, "attendee_count");
  const expectedGuests = sum(attending, "attendee_count");
  const adultGuests = sum(categorized, "adult_count");
  const kidGuests = sum(categorized, "kid_count");
  const infantGuests = sum(categorized, "infant_count");
  const infantsNeedingSeatOrMeal = sum(categorized, "infant_seat_meal_count");
  return {
    responses: rows.length,
    attendingFamilies: attending.length,
    declinedFamilies: rows.filter((row) => row.attendance_status === "declined")
      .length,
    expectedGuests,
    adultGuests,
    kidGuests,
    infantGuests,
    infantsNeedingSeatOrMeal,
    packageHeadcount: adultGuests + kidGuests + infantsNeedingSeatOrMeal,
    uncategorizedGuests: expectedGuests - knownGuests,
  };
}

export function isPastDeadline(dateString, now = new Date()) {
  // End of the stated date in Philippine time (UTC+08:00).
  return now.getTime() > new Date(`${dateString}T23:59:59+08:00`).getTime();
}

export function directionsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Philippines")}`;
}
