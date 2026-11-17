import { godparentSalutation, normalizeName } from "../utils.js";
import { APP_MODE, supabase } from "./supabase.js";

const STORAGE_KEY = "baby-ryn-rsvps-local-demo-v1";

function readLocalRows() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRsvp(payload, submissionId, godparent) {
  const slug = godparent?.slug ?? null;
  const name = normalizeName(payload.representative_name);
  const legacyNames = godparent
    ? [name, godparent.name, godparentSalutation(godparent), godparent.partner?.name]
        .filter(Boolean)
        .map(normalizeName)
    : [name];

  if (APP_MODE === "demo") {
    const rows = readLocalRows();
    const matchingRows = rows.filter((row) =>
      row.guest_type === payload.guest_type &&
      (row.invitation_slug
        ? row.invitation_slug === slug
        : legacyNames.includes(normalizeName(row.representative_name))),
    );
    matchingRows.sort((a, b) =>
      Number(Boolean(b.invitation_slug)) - Number(Boolean(a.invitation_slug)) ||
      Number(normalizeName(b.representative_name) === name) -
        Number(normalizeName(a.representative_name) === name) ||
      (b.updated_at ?? b.created_at).localeCompare(a.updated_at ?? a.created_at),
    );
    const existing = matchingRows[0];
    const now = new Date().toISOString();
    const response = {
      ...payload,
      invitation_slug: slug,
      id: existing?.id ?? submissionId,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
    if (existing) rows[rows.indexOf(existing)] = response;
    else rows.push(response);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    return;
  }

  if (APP_MODE !== "live") {
    throw new Error(
      "Live RSVP storage is not configured. Please contact the organizer.",
    );
  }

  const { error } = await supabase.rpc("save_rsvp", {
    submission_id: submissionId,
    response: payload,
    route_slug: slug,
    legacy_names: legacyNames,
  });
  if (error)
    throw new Error("We could not save your RSVP right now. Please try again.");
}

export async function organizerAllowed(userId) {
  if (APP_MODE !== "live" || !userId) return false;
  const { data, error } = await supabase
    .from("organizer_accounts")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Unable to verify organizer access.");
  return Boolean(data);
}

export async function loadRsvps() {
  if (APP_MODE === "demo")
    return readLocalRows().sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  if (APP_MODE !== "live") throw new Error("Supabase has not been configured.");

  const rows = [];
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("rsvps")
      .select(
        "id,representative_name,guest_type,godparent_role,attendance_status,attendee_count,adult_count,kid_count,infant_count,infant_seat_meal_count,message,created_at",
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error("Unable to load RSVP responses.");
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
    offset += pageSize;
  }
}
