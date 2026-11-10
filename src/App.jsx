import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Decorations } from './components/Decorations.jsx';
import { FlowerPhoto, RoundedPhoto } from './components/Photos.jsx';
import { EVENT, GODPARENTS, PHOTO_PATHS } from './config.js';
import { APP_MODE, supabase } from './lib/supabase.js';
import { loadRsvps, organizerAllowed, saveRsvp } from './lib/rsvp.js';
import { cleanName, directionsUrl, findGodparent, isPastDeadline, rsvpPayload, rsvpStats, totalAttendees, validateRsvp } from './utils.js';

const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
const INITIAL_FORM = { representative_name: '', attendance_status: '', adult_count: 1, kid_count: 0, infant_count: 0, infant_seat_meal_count: 0, message: '' };

function App() {
  const [page, setPage] = useState(() => window.location.hash === '#/organizer' ? 'organizer' : 'welcome');
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [matchedGodparent, setMatchedGodparent] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submissionId = useRef(null);
  const requestInFlight = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#/organizer') setPage('organizer');
      else setPage(previous => previous === 'organizer' ? 'welcome' : previous);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = page === 'organizer' ? 'Organizer View · Ryn’s Christening' : 'Baby Ryn’s Christening · You’re Invited';
  }, [page]);

  const move = next => { setSubmitError(''); setPage(next); };
  const openOrganizer = () => { window.location.hash = '/organizer'; setPage('organizer'); };
  const leaveOrganizer = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setPage('welcome');
  };

  const continueName = event => {
    event.preventDefault();
    const name = cleanName(nameInput);
    if (name.length < 2 || name.length > 120) {
      setNameError('Please enter a name between 2 and 120 characters.');
      return;
    }
    setNameError('');
    const godparent = findGodparent(name, GODPARENTS);
    setMatchedGodparent(godparent);
    setForm(previous => ({ ...previous, representative_name: name }));
    submissionId.current = crypto.randomUUID();
    move(godparent ? 'letter' : 'rsvp');
  };

  const submitRsvp = async event => {
    event.preventDefault();
    if (requestInFlight.current) return;
    const validationError = validateRsvp(form, EVENT.maxAttendeesPerFamily);
    if (validationError) { setSubmitError(validationError); return; }
    requestInFlight.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      if (!submissionId.current) submissionId.current = crypto.randomUUID();
      await saveRsvp(rsvpPayload(form, matchedGodparent), submissionId.current);
      move('thankyou');
    } catch (error) {
      setSubmitError(error?.message || 'We could not save your RSVP. Please try again.');
    } finally {
      requestInFlight.current = false;
      setSubmitting(false);
    }
  };

  const reset = () => {
    submissionId.current = null;
    setMatchedGodparent(null);
    setNameInput('');
    setNameError('');
    setForm({ ...INITIAL_FORM });
    move('welcome');
  };

  return <div className="site">
    <Decorations />
    <div className="site-inner">
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="Return to welcome page">
          <span className="brand-heart">♡</span>
          <span>baby ryn <span className="brand-divider">/</span> christening</span>
        </button>
        {page !== 'organizer' ?
          <button className="organizer-link" onClick={openOrganizer} title="Parents and organizers only">
            <span aria-hidden="true">🔒</span> Organizer view
          </button> :
          <button className="organizer-link" onClick={leaveOrganizer}>← Back to invitation</button>}
      </header>

      <main className="stage">
        {page === 'welcome' && <Welcome nameInput={nameInput} setNameInput={setNameInput} error={nameError} onContinue={continueName} />}
        {page === 'letter' && <GodparentLetter godparent={matchedGodparent} onBack={() => move('welcome')} onContinue={() => move('rsvp')} />}
        {page === 'rsvp' && <RsvpScreen form={form} setForm={setForm} matchedGodparent={matchedGodparent} error={submitError} submitting={submitting} onSubmit={submitRsvp} onBack={() => move(matchedGodparent ? 'letter' : 'welcome')} onChangeName={() => move('welcome')} />}
        {page === 'thankyou' && <ThankYou form={form} onReset={reset} />}
        {page === 'organizer' && <OrganizerScreen onBack={leaveOrganizer} />}
      </main>

      <footer className="site-footer">
        <span>Made with love for Baby Ryn <span className="blue-heart">♥</span></span>
        <span>December 13, 2026 · Cebu City</span>
      </footer>
    </div>
  </div>;
}

function ModeNotice() {
  if (APP_MODE === 'demo') return <div className="mode-banner" role="note">✦ Local demo mode — RSVPs stay in this browser only. Configure Supabase before sharing your website.</div>;
  if (APP_MODE === 'unconfigured') return <div className="mode-banner mode-warning" role="alert">This website needs Supabase configuration before guests can submit RSVPs. See README.md.</div>;
  return null;
}

function SectionEyebrow({ children }) { return <p className="eyebrow"><span className="eyebrow-line" />{children}<span className="eyebrow-line" /></p>; }

function Welcome({ nameInput, setNameInput, error, onContinue }) {
  return <section className="page-card welcome-card" aria-labelledby="welcome-title">
    <ModeNotice />
    <div className="arc-wrap" aria-label="With hearts full of joy and gratitude to God">
      <svg viewBox="0 0 700 156" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs><path id="welcome-curve" d="M 28 146 Q 350 -65 672 146" /></defs>
        <text className="arc-text"><textPath href="#welcome-curve" startOffset="8%">With hearts full of joy and gratitude to God,</textPath></text>
      </svg>
    </div>
    <p className="mobile-prelude">With hearts full of joy and gratitude to God,</p>
    <FlowerPhoto src={PHOTO_PATHS.main} alt="Baby Ryn facing the camera" hint="ryn-main.jpg" className="welcome-photo" />
    <p className="invitation-copy">{EVENT.parentNames} joyfully invite you to<br className="desktop-break" /> the christening of their beloved son,</p>
    <h1 className="baby-name" id="welcome-title">Ryn<span className="baby-name-star">✧</span></h1>
    <div className="event-highlight">
      <span>December 13 <span className="event-pipe">|</span> 10 AM</span>
      <strong>Our Lady of Sacred Heart Parish Cebu</strong>
      <small>15 N. Escario St., Cebu City</small>
    </div>
    <div className="welcome-form-panel">
      <SectionEyebrow>YOUR INVITATION STARTS HERE</SectionEyebrow>
      <h2>We're so happy you're here!</h2>
      <p>Before we begin, may we know your name?</p>
      <form onSubmit={onContinue} className="name-form">
        <label htmlFor="guest-name" className="field-label">Your name</label>
        <input id="guest-name" className="text-input" placeholder="Enter your first or full name" type="text" autoComplete="name" maxLength={120} value={nameInput} onChange={event => setNameInput(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'name-error' : undefined} required />
        {error && <p id="name-error" className="field-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Open my invitation <span aria-hidden="true">→</span></button>
      </form>
      <p className="fineprint">One person may RSVP for the whole family. <span aria-hidden="true">♡</span></p>
    </div>
  </section>;
}

function GodparentLetter({ godparent, onBack, onContinue }) {
  if (!godparent) return null;
  return <section className="page-card letter-card" aria-labelledby="letter-title">
    <SectionEyebrow>A SPECIAL LITTLE LETTER</SectionEyebrow>
    <RoundedPhoto src={PHOTO_PATHS.letter} alt="Baby Ryn in a side profile" hint="ryn-letter.jpg" />
    <div className="letter-body">
      <h1 id="letter-title" className="letter-heading">Dear <span>{godparent.role} <em>{godparent.name}</em></span>,</h1>
      <p>As I begin my journey of faith, my Mommy and Daddy chose you to be one of my <strong>guideposts.</strong></p>
      <p>I am still very small, but I know I will need your <strong>wisdom, prayers, and love</strong> as I grow up. Thank you for promising to walk beside me, protect me, and help me become the person God made me to be.</p>
      <p>I can't wait to see you on my special day!</p>
      <div className="letter-signoff">
        <span>With lots of love and tiny hugs,</span>
        <strong>Baby Ryn <span aria-hidden="true">♥</span></strong>
      </div>
    </div>
    <div className="page-actions">
      <button className="button button-ghost" onClick={onBack} type="button">← Back</button>
      <button className="button button-primary" onClick={onContinue} type="button">Continue to RSVP <span aria-hidden="true">→</span></button>
    </div>
  </section>;
}

function LocationCard({ label, icon, time, venue, address, className = '' }) {
  return <article className={`location-card ${className}`}>
    <div className="location-icon" aria-hidden="true">{icon}</div>
    <div>
      <div className="location-topline"><span>{label}</span><strong>{time}</strong></div>
      <h3>{venue}</h3>
      <p>{address}</p>
      <a href={directionsUrl(address)} target="_blank" rel="noopener noreferrer">View on Google Maps <span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}

function CelebrationDetails() {
  return <div className="celebration-details">
    <SectionEyebrow>THE CELEBRATION</SectionEyebrow>
    <h2>A beautiful day to remember</h2>
    <p className="celebration-date">{EVENT.dateLabel}</p>
    <div className="location-grid">
      <LocationCard label="CHRISTENING CEREMONY" icon="✝" time={EVENT.ceremonyTime} venue={EVENT.ceremonyVenue} address={EVENT.ceremonyAddress} />
      <LocationCard label="LUNCHEON TO FOLLOW" icon="♧" time={EVENT.luncheonTime} venue={EVENT.luncheonVenue} address={EVENT.luncheonAddress} />
    </div>
  </div>;
}

function RsvpScreen({ form, setForm, matchedGodparent, error, submitting, onSubmit, onBack, onChangeName }) {
  const attending = form.attendance_status === 'attending';
  const pastDeadline = isPastDeadline(EVENT.rsvpDeadline);
  return <section className="page-card rsvp-page" aria-labelledby="rsvp-title">
    <div className="rsvp-heading">
      <div>
        <SectionEyebrow>YOU'RE INVITED</SectionEyebrow>
        <h1 id="rsvp-title">Come celebrate <em>Ryn!</em></h1>
        <p>Join us for a day filled with love, little blessings, and happy memories.</p>
      </div>
      <FlowerPhoto src={PHOTO_PATHS.rsvp} alt="Close-up of Baby Ryn" hint="ryn-rsvp.jpg" className="rsvp-photo" />
    </div>

    <CelebrationDetails />
    <div className="rsvp-form-card">
      <div className="rsvp-form-heading"><span aria-hidden="true" className="rsvp-envelope">✉</span><div><SectionEyebrow>RESERVE YOUR SEATS</SectionEyebrow><h2>Kindly RSVP <span aria-hidden="true">♡</span></h2></div></div>
      <p className="form-intro">We want to make sure a seat is ready for you and your loved ones.</p>
      <ModeNotice />
      {pastDeadline ? <p className="deadline-note">The December 1 RSVP date has passed, but you may still send a response. Please also contact {EVENT.organizerName} about seating.</p> :
        <p className="deadline-note">Please confirm by <strong>December 1, 2026.</strong></p>}
      <form onSubmit={onSubmit} noValidate>
        <label className="field-label" htmlFor="representative-name">Your name</label>
        <div className="name-readonly-row">
          <input className="text-input" type="text" id="representative-name" value={form.representative_name} readOnly />
          <button type="button" className="text-button" onClick={onChangeName}>Change</button>
        </div>
        {matchedGodparent && <p className="role-tag">♡ Your invitation recognizes you as {matchedGodparent.role} {matchedGodparent.name}</p>}

        <fieldset className="attendance-fieldset">
          <legend>Will you and your family attend? <span className="required">*</span></legend>
          <div className="attendance-options">
            <label className={`attendance-option ${attending ? 'is-selected' : ''}`}>
              <input type="radio" name="attendance" value="attending" checked={attending} onChange={() => setForm(previous => ({ ...previous, attendance_status: 'attending' }))} />
              <span className="option-icon" aria-hidden="true">♥</span>
              <span><strong>Joyfully accepts</strong><small>We'll be there to celebrate!</small></span>
            </label>
            <label className={`attendance-option ${form.attendance_status === 'declined' ? 'is-selected' : ''}`}>
              <input type="radio" name="attendance" value="declined" checked={form.attendance_status === 'declined'} onChange={() => setForm(previous => ({ ...previous, attendance_status: 'declined' }))} />
              <span className="option-icon" aria-hidden="true">✉</span>
              <span><strong>Regretfully declines</strong><small>Sending love from afar</small></span>
            </label>
          </div>
        </fieldset>

        {attending && <div className="guest-count-block">
          <p className="field-label">How many family members will attend, including yourself?</p>
          <p className="age-group-intro">Please count every person once according to their age on December 13, 2026.</p>
          <div className="age-counter-grid">
            <AgeCounter id="adult-count" label="Adults" sublabel="12 years old & above" value={form.adult_count} max={EVENT.maxAttendeesPerFamily} onChange={value => setForm(previous => ({ ...previous, adult_count: value }))} />
            <AgeCounter id="kid-count" label="Kids" sublabel="3–11 years old" value={form.kid_count} max={EVENT.maxAttendeesPerFamily} onChange={value => setForm(previous => ({ ...previous, kid_count: value }))} />
            <AgeCounter id="infant-count" label="Infants" sublabel="0–2 years old" value={form.infant_count} max={EVENT.maxAttendeesPerFamily} onChange={value => setForm(previous => ({ ...previous, infant_count: value, infant_seat_meal_count: Math.min(Number(previous.infant_seat_meal_count) || 0, Number(value) || 0) }))} />
          </div>
          {Number(form.infant_count) > 0 && <div className="infant-special">
            <AgeCounter id="infant-special-count" label="Infants needing a seat or meal" sublabel="Of the infants above, how many need their own seat and/or kiddie meal?" value={form.infant_seat_meal_count} max={Number(form.infant_count)} onChange={value => setForm(previous => ({ ...previous, infant_seat_meal_count: value }))} />
          </div>}
          <div className="age-summary"><span>Total family members attending</span><strong>{Number.isFinite(totalAttendees(form)) ? totalAttendees(form) : '—'}</strong></div>
          <p className="age-policy-note">Infants aged 0–2 are usually excluded from package headcounts unless they need a separate seat or meal. The organizer will confirm the venue's final policy.</p>
        </div>}

        <label className="field-label" htmlFor="baby-message">A little message for Baby Ryn <span className="optional">(optional)</span></label>
        <textarea id="baby-message" className="text-input message-input" rows="3" maxLength={500} value={form.message} placeholder="Wishes, prayers, or just a little hello..." onChange={event => setForm(previous => ({ ...previous, message: event.target.value }))} />
        {error && <p role="alert" className="field-error form-error">{error}</p>}
        <button className="button button-primary submit-button" disabled={submitting || APP_MODE === 'unconfigured'} type="submit">{submitting ? 'Saving your RSVP…' : 'Confirm our RSVP'} <span aria-hidden="true">→</span></button>
        <p className="form-privacy">Your RSVP is shared only with the event organizers.</p>
      </form>
    </div>
    <div className="contact-block">Questions? Please contact {EVENT.organizerName} at <a href={`tel:${EVENT.organizerPhoneDial}`}>{EVENT.organizerPhoneDisplay}</a>.</div>
    <div className="page-actions single-back"><button className="button button-ghost" type="button" onClick={onBack}>← Back</button></div>
  </section>;
}

function AgeCounter({ id, label, sublabel, value, max, onChange }) {
  const number = Number(value);
  const canDecrease = Number.isInteger(number) && number > 0;
  const canIncrease = Number.isInteger(number) && number >= 0 && number < max;
  return <div className="age-counter-item">
    <div className="age-counter-label"><label htmlFor={id}>{label}</label><small>{sublabel}</small></div>
    <div className="counter">
      <button type="button" aria-label={`Remove one ${label.toLowerCase()}`} disabled={!canDecrease} onClick={() => onChange(number - 1)}>−</button>
      <input type="number" id={id} min="0" max={max} step="1" inputMode="numeric" value={value} onChange={event => onChange(event.target.value)} />
      <button type="button" aria-label={`Add one ${label.toLowerCase()}`} disabled={!canIncrease} onClick={() => onChange(number + 1)}>+</button>
    </div>
  </div>;
}

function ThankYou({ form, onReset }) {
  const attending = form.attendance_status === 'attending';
  const count = totalAttendees(form);
  return <section className="page-card thanks-card" aria-labelledby="thanks-title">
    <div className="thanks-heart" aria-hidden="true">♥</div>
    <SectionEyebrow>RSVP RECEIVED</SectionEyebrow>
    <h1 id="thanks-title">Thank you, <em>{form.representative_name}!</em></h1>
    {attending ? <><p>We can't wait to celebrate Baby Ryn's special day with you and your loved ones!</p><div className="confirmation-box"><span>Your family RSVP is confirmed for</span><strong>{count} {count === 1 ? 'guest' : 'guests'}</strong><small>{Number(form.adult_count)} adults · {Number(form.kid_count)} kids · {Number(form.infant_count)} infants</small>{Number(form.infant_seat_meal_count) > 0 && <small>{form.infant_seat_meal_count} infant(s) requesting a seat or meal</small>}</div></> :
      <><p>Thank you for letting us know. You'll be with us in spirit on Baby Ryn's special day. ♡</p><div className="confirmation-box"><span>Your response has been saved</span><strong>Regretfully declined</strong><small>Sending love your way</small></div></>}
    <div className="thanks-details"><strong>Sunday, December 13, 2026</strong><span>10:00 AM · Our Lady of Sacred Heart Parish Cebu</span><span>12:00 PM · Citadines Cebu City</span></div>
    <div className="page-actions centered"><button className="button button-secondary" type="button" onClick={onReset}>Return to invitation <span aria-hidden="true">↗</span></button></div>
    <p className="signoff-script">With love, Baby Ryn <span aria-hidden="true">♡</span></p>
  </section>;
}

function OrganizerScreen({ onBack }) {
  const [authState, setAuthState] = useState(APP_MODE === 'demo' ? 'ready' : APP_MODE === 'unconfigured' ? 'setup' : 'checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [records, setRecords] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const refresh = async () => {
    setLoadError('');
    try { setRecords(await loadRsvps()); }
    catch (error) { setLoadError(error.message); }
  };

  useEffect(() => {
    let active = true;
    if (APP_MODE === 'demo') { refresh(); return () => { active = false; }; }
    if (APP_MODE === 'unconfigured') return () => { active = false; };
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) { if (active) setAuthState('login'); return; }
        const allowed = await organizerAllowed(data.user.id);
        if (active) {
          if (allowed) { setAuthState('ready'); await refresh(); }
          else { await supabase.auth.signOut(); setAuthState('login'); }
        }
      } catch { if (active) { setAuthState('login'); setAuthError('Could not restore your organizer session. Please sign in.'); } }
    })();
    return () => { active = false; };
  }, []);

  const login = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error('Sign-in failed. Please check your email and password.');
      const allowed = await organizerAllowed(data.user?.id);
      if (!allowed) {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized as an event organizer.');
      }
      setPassword('');
      setAuthState('ready');
      await refresh();
    } catch (error) { setAuthError(error.message); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true);
    try { await supabase.auth.signOut(); setRecords([]); setAuthState('login'); }
    finally { setBusy(false); }
  };

  const stats = useMemo(() => rsvpStats(records), [records]);
  const filtered = useMemo(() => records.filter(row => {
    const categoryMatches = filter === 'all' ||
      (filter === 'godparents' ? row.guest_type === 'godparent' : row.attendance_status === filter);
    const searchMatches = row.representative_name.toLocaleLowerCase('en-PH').includes(query.trim().toLocaleLowerCase('en-PH'));
    return categoryMatches && searchMatches;
  }), [records, filter, query]);

  if (authState === 'checking') return <section className="page-card organizer-card"><h1>Organizer view</h1><p className="center-muted">Checking your session…</p></section>;
  if (authState === 'setup') return <section className="page-card organizer-card organizer-login"><SectionEyebrow>FOR THE PARENTS</SectionEyebrow><h1>Organizer view</h1><p>Supabase is not configured for this deployment. Please follow the README before using the organizer dashboard.</p><button className="button button-secondary" onClick={onBack}>← Back to invitation</button></section>;
  if (authState === 'login') return <section className="page-card organizer-card organizer-login" aria-labelledby="login-title">
    <SectionEyebrow>FOR THE PARENTS & ORGANIZERS</SectionEyebrow>
    <div className="organizer-icon" aria-hidden="true">♧</div>
    <h1 id="login-title">Welcome, organizers</h1>
    <p>Sign in to see who's celebrating with Baby Ryn.</p>
    <form onSubmit={login} className="organizer-login-form">
      <label className="field-label" htmlFor="organizer-email">Email address</label>
      <input id="organizer-email" type="email" className="text-input" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" />
      <label className="field-label" htmlFor="organizer-password">Password</label>
      <input id="organizer-password" type="password" className="text-input" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
      {authError && <p className="field-error" role="alert">{authError}</p>}
      <button type="submit" disabled={busy} className="button button-primary">{busy ? 'Signing in…' : 'Sign in securely'} <span aria-hidden="true">→</span></button>
    </form>
    <button className="button button-ghost" onClick={onBack}>← Back to invitation</button>
  </section>;

  return <section className="page-card organizer-card organizer-dashboard" aria-labelledby="dashboard-title">
    <div className="dashboard-header">
      <div><SectionEyebrow>FOR THE PARENTS & ORGANIZERS</SectionEyebrow><h1 id="dashboard-title">Our guest list <span aria-hidden="true">♡</span></h1><p>A little overview of who's joining Ryn's big day.</p></div>
      <div className="dashboard-actions"><button className="button button-secondary button-small" type="button" onClick={refresh}>↻ Refresh</button>{APP_MODE === 'live' && <button className="button button-ghost button-small" type="button" onClick={logout} disabled={busy}>Log out</button>}</div>
    </div>
    {APP_MODE === 'demo' && <div className="mode-banner">Demo dashboard — records here are only from this browser, and this demo view is NOT secured. Configure Supabase for real organizer access.</div>}
    {loadError && <p className="field-error" role="alert">{loadError}</p>}
    <div className="stats-grid">
      <div className="stat stat-featured"><span className="stat-icon">♥</span><strong>{stats.expectedGuests}</strong><span>All expected guests, infants included</span></div>
      <div className="stat"><span className="stat-icon">♧</span><strong>{stats.packageHeadcount}</strong><span>Estimated package headcount*</span></div>
      <div className="stat"><span className="stat-icon">♙</span><strong>{stats.adultGuests}</strong><span>Adults (12+)</span></div>
      <div className="stat"><span className="stat-icon">✿</span><strong>{stats.kidGuests}</strong><span>Kids (3–11)</span></div>
      <div className="stat"><span className="stat-icon">♡</span><strong>{stats.infantGuests}</strong><span>Infants (0–2)</span></div>
      <div className="stat"><span className="stat-icon">✧</span><strong>{stats.infantsNeedingSeatOrMeal}</strong><span>Infants needing seat / meal</span></div>
      <div className="stat"><span className="stat-icon">✉</span><strong>{stats.responses}</strong><span>RSVP responses</span></div>
      <div className="stat"><span className="stat-icon">✓</span><strong>{stats.attendingFamilies}</strong><span>Attending families · {stats.declinedFamilies} declined</span></div>
    </div>
    <p className="dashboard-policy-note">*Estimated package headcount = adults + kids + infants requesting their own seat or meal. Verify the venue's actual pricing and seating rules.</p>
    {stats.uncategorizedGuests > 0 && <p className="deadline-note dashboard-legacy-note">{stats.uncategorizedGuests} guest(s) are in RSVPs received before age-group tracking. They are included in expected guests but not in the category or package totals. Please reconcile these with the families.</p>}
    <div className="guest-list-head"><div><h2>Family responses</h2><p>Each entry represents one family or group.</p></div><span className="result-count">{filtered.length} shown</span></div>
    <div className="dashboard-filters">
      <div className="filters" aria-label="Filter RSVPs">
        {[
          ['all', 'All'], ['attending', 'Attending'], ['declined', 'Declined'], ['godparents', 'Godparents']
        ].map(([value, label]) => <button key={value} type="button" className={`filter-pill ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}
      </div>
      <label className="search-label"><span className="sr-only">Search representative name</span><input className="text-input search-input" value={query} placeholder="Search by name…" onChange={event => setQuery(event.target.value)} /></label>
    </div>
    <div className="table-scroll"><table className="guest-table age-table"><thead><tr><th>Representative</th><th>RSVP</th><th>Total</th><th>Adults 12+</th><th>Kids 3–11</th><th>Infants 0–2</th><th>Infant seat / meal</th><th>Message</th><th>Submitted</th></tr></thead><tbody>
      {filtered.map(row => <tr key={row.id}><td><strong>{row.representative_name}</strong><small>{row.guest_type === 'godparent' ? row.godparent_role : 'Regular guest'}</small></td><td><span className={`status-pill ${row.attendance_status === 'attending' ? 'status-attending' : 'status-declined'}`}>{row.attendance_status === 'attending' ? 'Attending' : 'Declined'}</span></td><td className="cell-number">{row.attendee_count}</td><td className="cell-number">{row.adult_count ?? '—'}</td><td className="cell-number">{row.kid_count ?? '—'}</td><td className="cell-number">{row.infant_count ?? '—'}</td><td className="cell-number">{row.infant_seat_meal_count ?? '—'}</td><td className="message-cell">{row.message || '—'}</td><td className="date-cell">{new Date(row.created_at).toLocaleDateString('en-PH', dateOptions)}</td></tr>)}
      {!filtered.length && <tr><td colSpan={9} className="empty-results">{records.length ? 'No responses match this filter.' : 'No RSVPs yet. New submissions will appear here.'}</td></tr>}
    </tbody></table></div>
    <div className="dashboard-bottom"><span>Read-only view · No guest editing</span><button className="text-button" onClick={onBack}>← Back to invitation</button></div>
  </section>;
}

export default App;
