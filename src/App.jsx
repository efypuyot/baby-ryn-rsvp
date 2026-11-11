import React, { useEffect, useMemo, useRef, useState } from "react";
import { Decorations } from "./components/Decorations.jsx";
import { FlowerPhoto, RoundedPhoto } from "./components/Photos.jsx";
import "./envelope.css";
import { EVENT, GODPARENTS, PHOTO_PATHS } from "./config.js";
import { APP_MODE, supabase } from "./lib/supabase.js";
import { loadRsvps, organizerAllowed, saveRsvp } from "./lib/rsvp.js";
import {
  cleanName,
  directionsUrl,
  findGodparent,
  isPastDeadline,
  rsvpPayload,
  rsvpStats,
  totalAttendees,
  validateRsvp,
} from "./utils.js";


/** Inline SVGs: consistent in Chrome, Safari and Android without emoji fonts or icon packages. */
function Icon({ name, size = 18, className = "" }) {
  const paths = {
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    mail: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    "mail-open": <><path d="m2.5 10.5 9.5 6 9.5-6" /><path d="M2.5 10.5V20h19v-9.5M2.5 10.5 12 3l9.5 7.5" /><path d="M7 8h10" /></>,
    "arrow-left": <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
    "arrow-right": <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    "arrow-up-right": <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    "arrow-up": <><path d="m12 19 0-14" /><path d="m5 12 7-7 7 7" /></>,
    "sparkles": <><path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z" /><path d="m19 18 .6 1.4L21 20l-1.4.6L19 22l-.6-1.4L17 20l1.4-.6L19 18ZM4 2l.5 1.5L6 4l-1.5.5L4 6l-.5-1.5L2 4l1.5-.5L4 2Z" /></>,
    church: <><path d="M12 2v5M9.5 4.5h5" /><path d="M4 21V11l8-5 8 5v10" /><path d="M2 21h20M10 21v-7a2 2 0 0 1 4 0v7" /><path d="M4 11h16" /></>,
    utensils: <><path d="M4 2v7a3 3 0 0 0 6 0V2M7 2v20M15 2c-3 4-3 9 0 12h4V2zM19 14v8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    "check-circle": <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    "user-round": <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    baby: <><circle cx="12" cy="12" r="9" /><path d="M9 10h.01M15 10h.01M9 15c1.6 1.5 4.4 1.5 6 0M12 3c-.1-1 1-2 2-2" /></>,
    "flower-2": <><path d="M12 12c-1.5-2.5-4-5.5-2-8 2-2 4-1 5 1 1-3 4-3 5-1 2 2 0 5-3 8 3-1 6 1 5 4-1 3-4 3-6 1 1 3-1 6-4 5-3 0-4-3-3-5-2 2-5 2-6 0-2-3 0-5 3-5-3-2-4-5-2-7 2-2 5-1 8 7Z" /><circle cx="12" cy="12" r="1.7" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    minus: <path d="M5 12h14" />,
    plus: <><path d="M5 12h14M12 5v14" /></>,
    "hand-pointer": <><path d="M9 12V5a2 2 0 0 1 4 0v5a2 2 0 0 1 3 .1c1.4-.9 3.1-.2 3.1 1.6V17c0 2.3-1.7 4-4 4h-3.8c-1.4 0-2.5-.5-3.5-1.5L5 15.5c-1.3-1.4.3-3.7 2-2.9L9 14" /></>,
  };
  return (
    <svg className={`ui-icon ${className}`} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name] || paths.heart}
    </svg>
  );
}

const dateOptions = { month: "short", day: "numeric", year: "numeric" };
const INITIAL_FORM = {
  representative_name: "",
  attendance_status: "",
  adult_count: 1,
  kid_count: 0,
  infant_count: 0,
  infant_seat_meal_count: 0,
  message: "",
};

function App() {
  const [page, setPage] = useState(() =>
    window.location.hash === "#/organizer" ? "organizer" : "welcome"
  );
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [matchedGodparent, setMatchedGodparent] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionId = useRef(null);
  const requestInFlight = useRef(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === "#/organizer") setPage("organizer");
      else
        setPage((previous) =>
          previous === "organizer" ? "welcome" : previous
        );
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    // Close mobile keyboards when switching screens, and return to the top.
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
    document.title =
      page === "organizer"
        ? "Organizer View · Ryn’s Christening"
        : "Baby Ryn’s Christening · You’re Invited";
  }, [page]);

  const move = (next) => {
    setSubmitError("");
    setPage(next);
  };
  const openOrganizer = () => {
    window.location.hash = "/organizer";
    setPage("organizer");
  };
  const leaveOrganizer = () => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    );
    setPage("welcome");
  };

  const continueName = (event) => {
    event.preventDefault();
    const name = cleanName(nameInput);
    if (name.length < 2 || name.length > 120) {
      setNameError("Please enter a name between 2 and 120 characters.");
      return;
    }
    setNameError("");
    const godparent = findGodparent(name, GODPARENTS);
    setMatchedGodparent(godparent);
    setForm((previous) => ({ ...previous, representative_name: name }));
    submissionId.current = crypto.randomUUID();
    move(godparent ? "letter" : "rsvp");
  };

  const submitRsvp = async (event) => {
    event.preventDefault();
    if (requestInFlight.current) return;
    const validationError = validateRsvp(form, EVENT.maxAttendeesPerFamily);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    requestInFlight.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      if (!submissionId.current) submissionId.current = crypto.randomUUID();
      await saveRsvp(rsvpPayload(form, matchedGodparent), submissionId.current);
      move("thankyou");
    } catch (error) {
      setSubmitError(
        error?.message || "We could not save your RSVP. Please try again."
      );
    } finally {
      requestInFlight.current = false;
      setSubmitting(false);
    }
  };

  const reset = () => {
    submissionId.current = null;
    setMatchedGodparent(null);
    setNameInput("");
    setNameError("");
    setForm({ ...INITIAL_FORM });
    move("welcome");
  };

  return (
    <div className="site">
      <Decorations />
      <div className="site-inner">
        <header className="topbar">
          <button
            className="brand"
            onClick={reset}
            aria-label="Return to welcome page"
          >
            <span className="brand-heart"><Icon name="heart" size={21} /></span>
            <span>
              baby ryn <span className="brand-divider">/</span> christening
            </span>
          </button>
          {page !== "organizer" ? (
            <button
              className="organizer-link"
              onClick={openOrganizer}
              title="Parents and organizers only"
            >
              <Icon name="lock" size={15} /> Organizer view
            </button>
          ) : (
            <button className="organizer-link" onClick={leaveOrganizer}>
              <Icon name="arrow-left" size={16} /> Back to invitation
            </button>
          )}
        </header>

        <main className="stage" ref={mainRef} tabIndex={-1} id="main-content">
          {page === "welcome" && (
            <Welcome
              nameInput={nameInput}
              setNameInput={setNameInput}
              error={nameError}
              onContinue={continueName}
            />
          )}
          {page === "letter" && (
            <GodparentLetter
              godparent={matchedGodparent}
              onBack={() => move("welcome")}
              onContinue={() => move("rsvp")}
            />
          )}
          {page === "rsvp" && (
            <RsvpScreen
              form={form}
              setForm={setForm}
              matchedGodparent={matchedGodparent}
              error={submitError}
              submitting={submitting}
              onSubmit={submitRsvp}
              onBack={() => move(matchedGodparent ? "letter" : "welcome")}
              onChangeName={() => move("welcome")}
            />
          )}
          {page === "thankyou" && <ThankYou form={form} onReset={reset} />}
          {page === "organizer" && <OrganizerScreen onBack={leaveOrganizer} />}
        </main>

        <footer className="site-footer">
          <span>
            Made with love for Baby Ryn <Icon name="heart" size={13} className="blue-heart" />
          </span>
          <span>December 13, 2026 · Cebu City</span>
        </footer>
      </div>
    </div>
  );
}

function ModeNotice() {
  if (APP_MODE === "demo")
    return (
      <div className="mode-banner" role="note">
        <Icon name="info" size={16} /> Local demo mode — RSVPs stay in this browser only. Configure Supabase
        before sharing your website.
      </div>
    );
  if (APP_MODE === "unconfigured")
    return (
      <div className="mode-banner mode-warning" role="alert">
        This website needs Supabase configuration before guests can submit
        RSVPs. See README.md.
      </div>
    );
  return null;
}

function SectionEyebrow({ children }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-line" />
      {children}
      <span className="eyebrow-line" />
    </p>
  );
}

function Welcome({ nameInput, setNameInput, error, onContinue }) {
  return (
    <section className="page-card welcome-card" aria-labelledby="welcome-title">
      <ModeNotice />
      <div
        className="arc-wrap"
        aria-label="With hearts full of joy and gratitude to God"
      >
        <svg
          viewBox="0 0 700 156"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <path id="welcome-curve" d="M 28 146 Q 350 -65 672 146" />
          </defs>
          <text className="arc-text">
            <textPath href="#welcome-curve" startOffset="8%">
              With hearts full of joy and gratitude to God,
            </textPath>
          </text>
        </svg>
      </div>
      <p className="mobile-prelude">
        With hearts full of joy and gratitude to God,
      </p>
      <FlowerPhoto
        src={PHOTO_PATHS.main}
        alt="Baby Ryn facing the camera"
        hint="ryn-main.jpg"
        className="welcome-photo"
      />
      <p className="invitation-copy">
        {EVENT.parentNames} joyfully invite you to
        <br className="desktop-break" /> the christening of their beloved son,
      </p>
      <h1 className="baby-name" id="welcome-title">
        Ryn<span className="baby-name-star"><Icon name="sparkles" size={22} /></span>
      </h1>
      <div className="event-highlight">
        <span>
          December 13 <span className="event-pipe">|</span> 10 AM
        </span>
        <strong>Our Lady of Sacred Heart Parish Cebu</strong>
        <small>15 N. Escario St., Cebu City</small>
      </div>
      <div className="welcome-form-panel">
        <SectionEyebrow>YOUR INVITATION STARTS HERE</SectionEyebrow>
        <h2>We're so happy you're here!</h2>
        <p>Before we begin, may we know your name?</p>
        <form onSubmit={onContinue} className="name-form">
          <label htmlFor="guest-name" className="field-label">
            Your name
          </label>
          <input
            id="guest-name"
            className="text-input"
            placeholder="Enter your first or full name"
            type="text"
            autoComplete="name"
            enterKeyHint="go"
            maxLength={120}
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "name-error" : undefined}
            required
          />
          {error && (
            <p id="name-error" className="field-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit">
            Open my invitation <Icon name="arrow-right" size={18} />
          </button>
        </form>
        <p className="fineprint">
          One person may RSVP for the whole family.{" "}
          <Icon name="heart" size={16} />
        </p>
      </div>
    </section>
  );
}


/** Interactive invitation for recognized godparents. No additional component dependency. */
function EnvelopeReveal({ godparent, onBack, onRead }) {
  const [opened, setOpened] = useState(false);
  const swipeStartY = useRef(null);
  const name = `${godparent.role} ${godparent.name}`;

  const openOrRead = () => {
    if (opened) onRead();
    else setOpened(true);
  };
  const handleTouchStart = (event) => {
    swipeStartY.current = event.touches?.[0]?.clientY ?? null;
  };
  const handleTouchEnd = (event) => {
    const end = event.changedTouches?.[0]?.clientY;
    if (opened && swipeStartY.current !== null && end !== undefined && swipeStartY.current - end > 40) {
      event.preventDefault();
      onRead();
    }
    swipeStartY.current = null;
  };

  return (
    <section className="page-card envelope-card" aria-labelledby="envelope-title">
      <SectionEyebrow>A SPECIAL DELIVERY</SectionEyebrow>
      <div className="envelope-head">
        <div className="envelope-script">a little love note <Icon name="heart" size={25} /></div>
        <h1 id="envelope-title">Just for you, {name}</h1>
        <p>From Baby Ryn, with lots of love and tiny hugs.</p>
      </div>

      <div className={`envelope-theatre ${opened ? "is-opened" : "is-sealed"}`}>
        <span className="envelope-sparkle sparkle-one" aria-hidden="true"><Icon name="sparkles" size={31} /></span>
        <span className="envelope-sparkle sparkle-two" aria-hidden="true"><Icon name="heart" size={25} /></span>
        <span className="envelope-sparkle sparkle-three" aria-hidden="true"><Icon name="sparkles" size={24} /></span>
        <button type="button" className="envelope-touch-area"
          onClick={openOrRead} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          aria-label={opened ? `Unfold and read your letter, ${name}` : `Open your invitation envelope, ${name}`}>
          <span className="envelope-visual" aria-hidden="true">
            <span className="envelope-back" />
            <span className="envelope-note">
              <span className="envelope-note-icon"><Icon name="heart" size={29} /></span>
              <span className="envelope-note-dear">Dear {godparent.role},</span>
              <span className="envelope-note-name">{godparent.name}</span>
              <span className="envelope-note-bottom">I have something special to tell you...</span>
            </span>
            <span className="envelope-front" />
            <span className="envelope-fold envelope-fold-left" />
            <span className="envelope-fold envelope-fold-right" />
            <span className="envelope-flap" />
            <span className="envelope-seal"><Icon name="heart" size={31} /></span>
            <span className="envelope-stamp">R</span>
          </span>
        </button>
      </div>

      <div className="envelope-prompts" aria-live="polite" aria-atomic="true">
        <span className="envelope-instruction-icon" aria-hidden="true">
          <Icon name={opened ? "arrow-up" : "hand-pointer"} size={25} />
        </span>
        <p className="envelope-instruction">
          {opened ? "Your letter is here! Tap it or swipe upward to unfold." : "Tap the heart seal to open your envelope."}
        </p>
        <span className="envelope-instruction-sub">
          {opened ? "A special message is waiting inside." : "A small surprise for a very special person."}
        </span>
      </div>
      <div className="page-actions envelope-actions">
        <button className="button button-ghost" onClick={onBack} type="button">
          <Icon name="arrow-left" size={17} /> Back
        </button>
        <button className={`button ${opened ? "button-primary" : "button-secondary"}`}
          onClick={opened ? onRead : () => setOpened(true)} type="button">
          {opened ? "Read my letter" : "Open envelope"}
          <Icon name={opened ? "mail-open" : "heart"} size={18} />
        </button>
      </div>
    </section>
  );
}

function GodparentLetter({ godparent, onBack, onContinue }) {
  const [unfolded, setUnfolded] = useState(false);
  if (!godparent) return null;
  if (!unfolded)
    return (
      <EnvelopeReveal
        godparent={godparent}
        onBack={onBack}
        onRead={() => setUnfolded(true)}
      />
    );
  return (
    <section className="page-card letter-card" aria-labelledby="letter-title">
      <SectionEyebrow>A SPECIAL LITTLE LETTER</SectionEyebrow>
      <RoundedPhoto
        src={PHOTO_PATHS.letter}
        alt="Baby Ryn in a side profile"
        hint="ryn-letter.jpg"
      />
      <div className="letter-body">
        <h1 id="letter-title" className="letter-heading">
          Dear{" "}
          <span>
            {godparent.role} <em>{godparent.name}</em>
          </span>
          ,
        </h1>
        <p>
          As I begin my journey of faith, my Mommy and Daddy chose you to be one
          of my <strong>guideposts.</strong>
        </p>
        <p>
          I am still very small, but I know I will need your{" "}
          <strong>wisdom, prayers, and love</strong> as I grow up. Thank you for
          promising to walk beside me, protect me, and help me become the person
          God made me to be.
        </p>
        <p>I can't wait to see you on my special day!</p>
        <div className="letter-signoff">
          <span>With lots of love and tiny hugs,</span>
          <strong>
            Baby Ryn <Icon name="heart" size={35} />
          </strong>
        </div>
      </div>
      <div className="page-actions">
        <button
          className="button button-ghost"
          onClick={() => setUnfolded(false)}
          type="button"
        >
          <Icon name="arrow-left" size={16} /> Back to envelope
        </button>
        <button
          className="button button-primary"
          onClick={onContinue}
          type="button"
        >
          Continue to RSVP <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </section>
  );
}

function LocationCard({ label, icon, time, venue, address, className = "" }) {
  return (
    <article className={`location-card ${className}`}>
      <div className="location-icon" aria-hidden="true">
        <Icon name={icon} size={25} />
      </div>
      <div>
        <div className="location-topline">
          <span>{label}</span>
          <strong>{time}</strong>
        </div>
        <h3>{venue}</h3>
        <p>{address}</p>
        <a
          href={directionsUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Google Maps <Icon name="arrow-up-right" size={16} />
        </a>
      </div>
    </article>
  );
}

function CelebrationDetails() {
  return (
    <div className="celebration-details">
      <SectionEyebrow>THE CELEBRATION</SectionEyebrow>
      <h2>A beautiful day to remember</h2>
      <p className="celebration-date">{EVENT.dateLabel}</p>
      <div className="location-grid">
        <LocationCard
          label="CHRISTENING CEREMONY"
          icon="church"
          time={EVENT.ceremonyTime}
          venue={EVENT.ceremonyVenue}
          address={EVENT.ceremonyAddress}
        />
        <LocationCard
          label="LUNCHEON TO FOLLOW"
          icon="utensils"
          time={EVENT.luncheonTime}
          venue={EVENT.luncheonVenue}
          address={EVENT.luncheonAddress}
        />
      </div>
    </div>
  );
}

function RsvpScreen({
  form,
  setForm,
  matchedGodparent,
  error,
  submitting,
  onSubmit,
  onBack,
  onChangeName,
}) {
  const attending = form.attendance_status === "attending";
  const pastDeadline = isPastDeadline(EVENT.rsvpDeadline);
  return (
    <section className="page-card rsvp-page" aria-labelledby="rsvp-title">
      <div className="rsvp-heading">
        <div>
          <SectionEyebrow>YOU'RE INVITED</SectionEyebrow>
          <h1 id="rsvp-title">
            Come celebrate <em>Ryn!</em>
          </h1>
          <p>
            Join us for a day filled with love, little blessings, and happy
            memories.
          </p>
        </div>
        <FlowerPhoto
          src={PHOTO_PATHS.rsvp}
          alt="Close-up of Baby Ryn"
          hint="ryn-rsvp.jpg"
          className="rsvp-photo"
        />
      </div>

      <CelebrationDetails />
      <div className="rsvp-form-card">
        <div className="rsvp-form-heading">
          <span aria-hidden="true" className="rsvp-envelope"><Icon name="mail" size={35} /></span>
          <div>
            <SectionEyebrow>RESERVE YOUR SEATS</SectionEyebrow>
            <h2>
              Kindly RSVP <Icon name="heart" size={16} />
            </h2>
          </div>
        </div>
        <p className="form-intro">
          We want to make sure a seat is ready for you and your loved ones.
        </p>
        <ModeNotice />
        {pastDeadline ? (
          <p className="deadline-note">
            The December 1 RSVP date has passed, but you may still send a
            response. Please also contact {EVENT.organizerName} about seating.
          </p>
        ) : (
          <p className="deadline-note">
            Please confirm by <strong>December 1, 2026.</strong>
          </p>
        )}
        <form onSubmit={onSubmit} noValidate>
          <label className="field-label" htmlFor="representative-name">
            Your name
          </label>
          <div className="name-readonly-row">
            <input
              className="text-input"
              type="text"
              id="representative-name"
              value={form.representative_name}
              readOnly
            />
            <button
              type="button"
              className="text-button"
              onClick={onChangeName}
            >
              Change
            </button>
          </div>
          {matchedGodparent && (
            <p className="role-tag">
              <Icon name="heart" size={14} /> Your invitation recognizes you as {matchedGodparent.role}{" "}
              {matchedGodparent.name}
            </p>
          )}

          <fieldset className="attendance-fieldset">
            <legend>
              Will you and your family attend?{" "}
              <span className="required">*</span>
            </legend>
            <div className="attendance-options">
              <label
                className={`attendance-option ${
                  attending ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value="attending"
                  checked={attending}
                  onChange={() =>
                    setForm((previous) => ({
                      ...previous,
                      attendance_status: "attending",
                    }))
                  }
                />
                <span className="option-icon" aria-hidden="true">
                  <Icon name="heart" size={25} />
                </span>
                <span>
                  <strong>Joyfully accepts</strong>
                  <small>We'll be there to celebrate!</small>
                </span>
              </label>
              <label
                className={`attendance-option ${
                  form.attendance_status === "declined" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value="declined"
                  checked={form.attendance_status === "declined"}
                  onChange={() =>
                    setForm((previous) => ({
                      ...previous,
                      attendance_status: "declined",
                    }))
                  }
                />
                <span className="option-icon" aria-hidden="true">
                  <Icon name="mail" size={25} />
                </span>
                <span>
                  <strong>Regretfully declines</strong>
                  <small>Sending love from afar</small>
                </span>
              </label>
            </div>
          </fieldset>

          {attending && (
            <div className="guest-count-block">
              <p className="field-label">
                How many family members will attend, including yourself?
              </p>
              <p className="age-group-intro">
                Please count every person once according to their age on
                December 13, 2026.
              </p>
              <div className="age-counter-grid">
                <AgeCounter
                  id="adult-count"
                  label="Adults"
                  sublabel="12 years old & above"
                  value={form.adult_count}
                  max={EVENT.maxAttendeesPerFamily}
                  onChange={(value) =>
                    setForm((previous) => ({ ...previous, adult_count: value }))
                  }
                />
                <AgeCounter
                  id="kid-count"
                  label="Kids"
                  sublabel="3–11 years old"
                  value={form.kid_count}
                  max={EVENT.maxAttendeesPerFamily}
                  onChange={(value) =>
                    setForm((previous) => ({ ...previous, kid_count: value }))
                  }
                />
                <AgeCounter
                  id="infant-count"
                  label="Infants"
                  sublabel="0–2 years old"
                  value={form.infant_count}
                  max={EVENT.maxAttendeesPerFamily}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      infant_count: value,
                      infant_seat_meal_count: Math.min(
                        Number(previous.infant_seat_meal_count) || 0,
                        Number(value) || 0
                      ),
                    }))
                  }
                />
              </div>
              {Number(form.infant_count) > 0 && (
                <div className="infant-special">
                  <AgeCounter
                    id="infant-special-count"
                    label="Infants needing a seat or meal"
                    sublabel="Of the infants above, how many need their own seat and/or kiddie meal?"
                    value={form.infant_seat_meal_count}
                    max={Number(form.infant_count)}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        infant_seat_meal_count: value,
                      }))
                    }
                  />
                </div>
              )}
              <div className="age-summary">
                <span>Total family members attending</span>
                <strong>
                  {Number.isFinite(totalAttendees(form))
                    ? totalAttendees(form)
                    : "—"}
                </strong>
              </div>
              <p className="age-policy-note">
                Infants aged 0–2 are usually excluded from package headcounts
                unless they need a separate seat or meal. The organizer will
                confirm the venue's final policy.
              </p>
            </div>
          )}

          <label className="field-label" htmlFor="baby-message">
            A little message for Baby Ryn{" "}
            <span className="optional">(optional)</span>
          </label>
          <textarea
            id="baby-message"
            className="text-input message-input"
            rows="3"
            maxLength={500}
            value={form.message}
            placeholder="Wishes, prayers, or just a little hello..."
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                message: event.target.value,
              }))
            }
          />
          {error && (
            <p role="alert" className="field-error form-error">
              {error}
            </p>
          )}
          <button
            className="button button-primary submit-button"
            disabled={submitting || APP_MODE === "unconfigured"}
            type="submit"
          >
            {submitting ? "Saving your RSVP…" : "Confirm our RSVP"}{" "}
            <Icon name="arrow-right" size={18} />
          </button>
          <p className="form-privacy">
            Your RSVP is shared only with the event organizers.
          </p>
        </form>
      </div>
      <div className="contact-block">
        Questions? Please contact {EVENT.organizerName} at{" "}
        <a href={`tel:${EVENT.organizerPhoneDial}`}>
          {EVENT.organizerPhoneDisplay}
        </a>
        .
      </div>
      <div className="page-actions single-back">
        <button className="button button-ghost" type="button" onClick={onBack}>
          <Icon name="arrow-left" size={18} /> Back
        </button>
      </div>
    </section>
  );
}

function AgeCounter({ id, label, sublabel, value, max, onChange }) {
  const number = Number(value);
  const canDecrease = Number.isInteger(number) && number > 0;
  const canIncrease = Number.isInteger(number) && number >= 0 && number < max;
  return (
    <div className="age-counter-item">
      <div className="age-counter-label">
        <label htmlFor={id}>{label}</label>
        <small>{sublabel}</small>
      </div>
      <div className="counter">
        <button
          type="button"
          aria-label={`Remove one ${label.toLowerCase()}`}
          disabled={!canDecrease}
          onClick={() => onChange(number - 1)}
        >
          <Icon name="minus" size={18} />
        </button>
        <input
          type="number"
          id={id}
          min="0"
          max={max}
          step="1"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={`Add one ${label.toLowerCase()}`}
          disabled={!canIncrease}
          onClick={() => onChange(number + 1)}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

function ThankYou({ form, onReset }) {
  const attending = form.attendance_status === "attending";
  const count = totalAttendees(form);
  return (
    <section className="page-card thanks-card" aria-labelledby="thanks-title">
      <div className="thanks-heart" aria-hidden="true"><Icon name="heart" size={56} /></div>
      <SectionEyebrow>RSVP RECEIVED</SectionEyebrow>
      <h1 id="thanks-title">
        Thank you, <em>{form.representative_name}!</em>
      </h1>
      {attending ? (
        <>
          <p>
            We can't wait to celebrate Baby Ryn's special day with you and your
            loved ones!
          </p>
          <div className="confirmation-box">
            <span>Your family RSVP is confirmed for</span>
            <strong>
              {count} {count === 1 ? "guest" : "guests"}
            </strong>
            <small>
              {Number(form.adult_count)} adults · {Number(form.kid_count)} kids
              · {Number(form.infant_count)} infants
            </small>
            {Number(form.infant_seat_meal_count) > 0 && (
              <small>
                {form.infant_seat_meal_count} infant(s) requesting a seat or
                meal
              </small>
            )}
          </div>
        </>
      ) : (
        <>
          <p>
            Thank you for letting us know. You'll be with us in spirit on Baby
            Ryn's special day.
          </p>
          <div className="confirmation-box">
            <span>Your response has been saved</span>
            <strong>Regretfully declined</strong>
            <small>Sending love your way</small>
          </div>
        </>
      )}
      <div className="thanks-details">
        <strong>Sunday, December 13, 2026</strong>
        <span>10:00 AM · Our Lady of Sacred Heart Parish Cebu</span>
        <span>12:00 PM · Citadines Cebu City</span>
      </div>
      <div className="page-actions centered">
        <button
          className="button button-secondary"
          type="button"
          onClick={onReset}
        >
          Return to invitation <Icon name="arrow-up-right" size={18} />
        </button>
      </div>
      <p className="signoff-script">
        With love, Baby Ryn <Icon name="heart" size={16} />
      </p>
    </section>
  );
}

function OrganizerScreen({ onBack }) {
  const [authState, setAuthState] = useState(
    APP_MODE === "demo"
      ? "ready"
      : APP_MODE === "unconfigured"
      ? "setup"
      : "checking"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [records, setRecords] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const refresh = async () => {
    setLoadError("");
    try {
      setRecords(await loadRsvps());
    } catch (error) {
      setLoadError(error.message);
    }
  };

  useEffect(() => {
    let active = true;
    if (APP_MODE === "demo") {
      refresh();
      return () => {
        active = false;
      };
    }
    if (APP_MODE === "unconfigured")
      return () => {
        active = false;
      };
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          if (active) setAuthState("login");
          return;
        }
        const allowed = await organizerAllowed(data.user.id);
        if (active) {
          if (allowed) {
            setAuthState("ready");
            await refresh();
          } else {
            await supabase.auth.signOut();
            setAuthState("login");
          }
        }
      } catch {
        if (active) {
          setAuthState("login");
          setAuthError(
            "Could not restore your organizer session. Please sign in."
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setAuthError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error)
        throw new Error(
          "Sign-in failed. Please check your email and password."
        );
      const allowed = await organizerAllowed(data.user?.id);
      if (!allowed) {
        await supabase.auth.signOut();
        throw new Error(
          "This account is not authorized as an event organizer."
        );
      }
      setPassword("");
      setAuthState("ready");
      await refresh();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setRecords([]);
      setAuthState("login");
    } finally {
      setBusy(false);
    }
  };

  const stats = useMemo(() => rsvpStats(records), [records]);
  const filtered = useMemo(
    () =>
      records.filter((row) => {
        const categoryMatches =
          filter === "all" ||
          (filter === "godparents"
            ? row.guest_type === "godparent"
            : row.attendance_status === filter);
        const searchMatches = row.representative_name
          .toLocaleLowerCase("en-PH")
          .includes(query.trim().toLocaleLowerCase("en-PH"));
        return categoryMatches && searchMatches;
      }),
    [records, filter, query]
  );

  if (authState === "checking")
    return (
      <section className="page-card organizer-card">
        <h1>Organizer view</h1>
        <p className="center-muted">Checking your session…</p>
      </section>
    );
  if (authState === "setup")
    return (
      <section className="page-card organizer-card organizer-login">
        <SectionEyebrow>FOR THE PARENTS</SectionEyebrow>
        <h1>Organizer view</h1>
        <p>
          Supabase is not configured for this deployment. Please follow the
          README before using the organizer dashboard.
        </p>
        <button className="button button-secondary" onClick={onBack}>
          <Icon name="arrow-left" size={16} /> Back to invitation
        </button>
      </section>
    );
  if (authState === "login")
    return (
      <section
        className="page-card organizer-card organizer-login"
        aria-labelledby="login-title"
      >
        <SectionEyebrow>FOR THE PARENTS & ORGANIZERS</SectionEyebrow>
        <div className="organizer-icon" aria-hidden="true">
          <Icon name="users" size={30} />
        </div>
        <h1 id="login-title">Welcome, organizers</h1>
        <p>Sign in to see who's celebrating with Baby Ryn.</p>
        <form onSubmit={login} className="organizer-login-form">
          <label className="field-label" htmlFor="organizer-email">
            Email address
          </label>
          <input
            id="organizer-email"
            type="email"
            className="text-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <label className="field-label" htmlFor="organizer-password">
            Password
          </label>
          <input
            id="organizer-password"
            type="password"
            className="text-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {authError && (
            <p className="field-error" role="alert">
              {authError}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="button button-primary"
          >
            {busy ? "Signing in…" : "Sign in securely"}{" "}
            <Icon name="arrow-right" size={18} />
          </button>
        </form>
        <button className="button button-ghost" onClick={onBack}>
          <Icon name="arrow-left" size={16} /> Back to invitation
        </button>
      </section>
    );

  return (
    <section
      className="page-card organizer-card organizer-dashboard"
      aria-labelledby="dashboard-title"
    >
      <div className="dashboard-header">
        <div>
          <SectionEyebrow>FOR THE PARENTS & ORGANIZERS</SectionEyebrow>
          <h1 id="dashboard-title">
            Our guest list <Icon name="heart" size={16} />
          </h1>
          <p>A little overview of who's joining Ryn's big day.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="button button-secondary button-small"
            type="button"
            onClick={refresh}
          >
            <Icon name="refresh" size={17} /> Refresh
          </button>
          {APP_MODE === "live" && (
            <button
              className="button button-ghost button-small"
              type="button"
              onClick={logout}
              disabled={busy}
            >
              Log out
            </button>
          )}
        </div>
      </div>
      {APP_MODE === "demo" && (
        <div className="mode-banner">
          Demo dashboard — records here are only from this browser, and this
          demo view is NOT secured. Configure Supabase for real organizer
          access.
        </div>
      )}
      {loadError && (
        <p className="field-error" role="alert">
          {loadError}
        </p>
      )}
      <div className="stats-grid">
        <div className="stat stat-featured">
          <span className="stat-icon"><Icon name="heart" size={21} /></span>
          <strong>{stats.expectedGuests}</strong>
          <span>All expected guests, infants included</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="utensils" size={21} /></span>
          <strong>{stats.packageHeadcount}</strong>
          <span>Estimated package headcount*</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="user-round" size={21} /></span>
          <strong>{stats.adultGuests}</strong>
          <span>Adults (12+)</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="flower-2" size={21} /></span>
          <strong>{stats.kidGuests}</strong>
          <span>Kids (3–11)</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="baby" size={21} /></span>
          <strong>{stats.infantGuests}</strong>
          <span>Infants (0–2)</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="sparkles" size={21} /></span>
          <strong>{stats.infantsNeedingSeatOrMeal}</strong>
          <span>Infants needing seat / meal</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="mail" size={21} /></span>
          <strong>{stats.responses}</strong>
          <span>RSVP responses</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="check-circle" size={21} /></span>
          <strong>{stats.attendingFamilies}</strong>
          <span>Attending families · {stats.declinedFamilies} declined</span>
        </div>
      </div>
      <p className="dashboard-policy-note">
        *Estimated package headcount = adults + kids + infants requesting their
        own seat or meal. Verify the venue's actual pricing and seating rules.
      </p>
      {stats.uncategorizedGuests > 0 && (
        <p className="deadline-note dashboard-legacy-note">
          {stats.uncategorizedGuests} guest(s) are in RSVPs received before
          age-group tracking. They are included in expected guests but not in
          the category or package totals. Please reconcile these with the
          families.
        </p>
      )}
      <div className="guest-list-head">
        <div>
          <h2>Family responses</h2>
          <p>Each entry represents one family or group.</p>
        </div>
        <span className="result-count">{filtered.length} shown</span>
      </div>
      <div className="dashboard-filters">
        <div className="filters" aria-label="Filter RSVPs">
          {[
            ["all", "All"],
            ["attending", "Attending"],
            ["declined", "Declined"],
            ["godparents", "Godparents"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`filter-pill ${filter === value ? "active" : ""}`}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search-label">
          <span className="sr-only">Search representative name</span>
          <input
            className="text-input search-input"
            value={query}
            placeholder="Search by name…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div className="table-scroll">
        <table className="guest-table age-table">
          <thead>
            <tr>
              <th>Representative</th>
              <th>RSVP</th>
              <th>Total</th>
              <th>Adults 12+</th>
              <th>Kids 3–11</th>
              <th>Infants 0–2</th>
              <th>Infant seat / meal</th>
              <th>Message</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.representative_name}</strong>
                  <small>
                    {row.guest_type === "godparent"
                      ? row.godparent_role
                      : "Regular guest"}
                  </small>
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      row.attendance_status === "attending"
                        ? "status-attending"
                        : "status-declined"
                    }`}
                  >
                    {row.attendance_status === "attending"
                      ? "Attending"
                      : "Declined"}
                  </span>
                </td>
                <td className="cell-number">{row.attendee_count}</td>
                <td className="cell-number">{row.adult_count ?? "—"}</td>
                <td className="cell-number">{row.kid_count ?? "—"}</td>
                <td className="cell-number">{row.infant_count ?? "—"}</td>
                <td className="cell-number">
                  {row.infant_seat_meal_count ?? "—"}
                </td>
                <td className="message-cell">{row.message || "—"}</td>
                <td className="date-cell">
                  {new Date(row.created_at).toLocaleDateString(
                    "en-PH",
                    dateOptions
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={9} className="empty-results">
                  {records.length
                    ? "No responses match this filter."
                    : "No RSVPs yet. New submissions will appear here."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mobile-guest-list" aria-label="Family RSVP responses">
        {filtered.length ? (
          filtered.map((row) => (
            <article className="mobile-guest-card" key={row.id}>
              <div className="mobile-guest-heading">
                <div className="mobile-guest-identity">
                  <strong>{row.representative_name}</strong>
                  <small>
                    {row.guest_type === "godparent"
                      ? row.godparent_role
                      : "Regular guest"}
                  </small>
                </div>
                <span
                  className={`status-pill ${
                    row.attendance_status === "attending"
                      ? "status-attending"
                      : "status-declined"
                  }`}
                >
                  {row.attendance_status === "attending"
                    ? "Attending"
                    : "Declined"}
                </span>
              </div>
              <dl className="mobile-guest-metrics">
                <div className="mobile-guest-total">
                  <dt>Total guests</dt>
                  <dd>{row.attendee_count}</dd>
                </div>
                <div>
                  <dt>Adults (12+)</dt>
                  <dd>{row.adult_count ?? "—"}</dd>
                </div>
                <div>
                  <dt>Kids (3–11)</dt>
                  <dd>{row.kid_count ?? "—"}</dd>
                </div>
                <div>
                  <dt>Infants (0–2)</dt>
                  <dd>{row.infant_count ?? "—"}</dd>
                </div>
                <div>
                  <dt>Infants: seat / meal</dt>
                  <dd>{row.infant_seat_meal_count ?? "—"}</dd>
                </div>
              </dl>
              {row.message && (
                <p className="mobile-guest-message">
                  <span>Message</span>
                  {row.message}
                </p>
              )}
              <p className="mobile-guest-date">
                Submitted{" "}
                {new Date(row.created_at).toLocaleDateString(
                  "en-PH",
                  dateOptions
                )}
              </p>
            </article>
          ))
        ) : (
          <div className="mobile-guest-empty">
            {records.length
              ? "No responses match this filter."
              : "No RSVPs yet. New submissions will appear here."}
          </div>
        )}
      </div>
      <div className="dashboard-bottom">
        <span>Read-only view · No guest editing</span>
        <button className="text-button" onClick={onBack}>
          <Icon name="arrow-left" size={16} /> Back to invitation
        </button>
      </div>
    </section>
  );
}

export default App;
