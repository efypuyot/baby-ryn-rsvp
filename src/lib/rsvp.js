import { APP_MODE, supabase } from './supabase.js';

const STORAGE_KEY = 'baby-ryn-rsvps-local-demo-v1';

function readLocalRows() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRsvp(payload, submissionId) {
  if (APP_MODE === 'demo') {
    const rows = readLocalRows();
    if (!rows.some(row => row.id === submissionId)) {
      rows.push({ ...payload, id: submissionId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }
    return;
  }

  if (APP_MODE !== 'live') {
    throw new Error('Live RSVP storage is not configured. Please contact the organizer.');
  }

  // Never append .select(): anonymous guests may INSERT but must not SELECT.
  const { error } = await supabase.from('rsvps').insert({ id: submissionId, ...payload });
  if (error?.code === '23505') return; // Idempotent retry of this specific submission ID.
  if (error) throw new Error('We could not save your RSVP right now. Please try again.');
}

export async function organizerAllowed(userId) {
  if (APP_MODE !== 'live' || !userId) return false;
  const { data, error } = await supabase
    .from('organizer_accounts')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error('Unable to verify organizer access.');
  return Boolean(data);
}

export async function loadRsvps() {
  if (APP_MODE === 'demo') return readLocalRows().sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (APP_MODE !== 'live') throw new Error('Supabase has not been configured.');

  const rows = [];
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('rsvps')
      .select('id,representative_name,guest_type,godparent_role,attendance_status,attendee_count,message,created_at')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error('Unable to load RSVP responses.');
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
    offset += pageSize;
  }
}
