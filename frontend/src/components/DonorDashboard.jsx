import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./DonorDashboard.css";

/* ---------- demo data (backend e connect korar age porjonto) ---------- */
const initRequests = [
  { id: 1, group: "A+", hospital: "Chattogram Medical Hospital", place: "Panchlaish, Chattogram", units: "2 Units", urgency: "Urgent", time: "2 hours ago", phone: "01711-000001", note: "Patient needs blood for emergency surgery today.", status: "pending" },
  { id: 2, group: "O-", hospital: "Aga Khan Hospital", place: "Kulshi, Chattogram", units: "1 Unit", urgency: "Normal", time: "5 hours ago", phone: "01711-000002", note: "Needed within 2 days for a scheduled procedure.", status: "pending" },
  { id: 3, group: "B+", hospital: "Chittagong General Hospital", place: "Anderkilla, Chattogram", units: "3 Units", urgency: "Urgent", time: "1 day ago", phone: "01711-000003", note: "Accident patient, multiple units required.", status: "pending" },
  { id: 4, group: "A+", hospital: "Max Hospital", place: "Khulshi, Chattogram", units: "1 Unit", urgency: "Normal", time: "2 days ago", phone: "01711-000004", note: "Thalassemia patient, regular transfusion.", status: "pending" }
];
const initHistory = [
  { id: 1, date: "2025-06-12", group: "A+", hospital: "City Hospital, Chattogram" },
  { id: 2, date: "2025-02-15", group: "A+", hospital: "City Hospital" },
  { id: 3, date: "2024-10-10", group: "A+", hospital: "Aga Khan Hospital" },
  { id: 4, date: "2024-06-05", group: "A+", hospital: "Chattogram Medical Hospital" },
  { id: 5, date: "2024-02-02", group: "A+", hospital: "Chittagong General Hospital" }
];
const initAppts = [{ id: 1, date: "2025-06-12", time: "10:00 AM - 11:00 AM", hospital: "City Hospital, Chattogram", place: "Hathazari, Chattogram" }];
const initNotifs = [
  { id: 1, icon: "megaphone", title: "Your donation helped 3 patients!", text: "Thank you for making a difference.", time: "2 hours ago", read: false },
  { id: 2, icon: "calendar", title: "Upcoming donation appointment", text: "12 Jun 2025 at City Hospital, Chattogram", time: "1 day ago", read: false },
  { id: 3, icon: "heart", title: "New blood request matches your profile", text: "A+ blood needed at Chattogram Medical Hospital", time: "2 days ago", read: false }
];
const initChats = [
  { id: 1, name: "City Hospital", role: "Blood bank", msgs: [{ from: "them", text: "Hello Nafisa, your appointment is confirmed for 12 Jun." }, { from: "me", text: "Thank you! I will be there on time." }] },
  { id: 2, name: "Rahim Uddin", role: "Requester", msgs: [{ from: "them", text: "Thank you for accepting my request. Please call me when you arrive." }] },
  { id: 3, name: "BloodConnect Support", role: "Support", msgs: [{ from: "them", text: "Welcome to BloodConnect! Let us know if you need help." }] }
];
const initProfile = { name: "Nafisa Alam", email: "nafisa.alam@example.com", phone: "01712-345678", group: "A+", dob: "1999-03-14", weight: "56", address: "Hathazari, Chattogram" };
const NAV = [["grid", "Dashboard"], ["user", "My Profile"], ["clipboard", "Blood Requests"], ["history", "Donation History"], ["calendar", "Appointments"], ["bell", "Notifications"], ["message", "Messages"], ["settings", "Settings"]];

const d = (s) => new Date(s + "T00:00:00");
const fmt = (s) => d(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtLong = (s) => d(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const reqTitle = (r) => `${r.group} blood needed at ${r.hospital}`;

/* ---------- icons ---------- */
const Icon = ({ name, size = 19 }) => {
  const p = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M8 10h8M8 14h8M8 18h5" /></>,
    history: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6M17 2v6M3 10h18m-11 5 2 2 4-4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6M17 2v6M3 10h18M8 14h2M14 14h2M8 18h2" /></>,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    message: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H9l-5 4Z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
    drop: <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7h.01" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4 4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    megaphone: <path d="M3 11v3h4l8 4V7L7 11Zm15-2a4 4 0 0 1 0 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    send: <path d="m22 2-7 20-4-9-9-4Zm0 0L11 13" />,
    logout: <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    arrow: <path d="m9 6 6 6-6 6" />
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
};

const Brand = () => (
  <Link className="dd-brand" to="/donor-dashboard">
    <svg width="26" height="30" viewBox="0 0 24 28" aria-hidden="true"><path d="M12 1S3 11.5 3 17.5a9 9 0 0 0 18 0C21 11.5 12 1 12 1Z" fill="#d10b2a" /><path d="M8 18a4 4 0 0 0 4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
    <b>BloodConnect</b>
  </Link>
);

/* hands holding a red heart (welcome banner) */
const HandsHeart = () => (
  <svg className="dd-hands" viewBox="0 0 150 110" aria-hidden="true">
    <defs>
      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0243e" /><stop offset="1" stopColor="#b3071f" /></linearGradient>
      <linearGradient id="sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7d3bb" /><stop offset="1" stopColor="#e9ab88" /></linearGradient>
    </defs>
    <path d="M75 78C28 50 36 10 58 10c10 0 17 6 17 13 0-7 7-13 17-13 22 0 30 40-17 68Z" fill="url(#hg)" />
    <path d="M60 18c-8 2-12 8-12 16" stroke="#ff7a8a" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
    <path d="M75 30C66 44 63 48 63 53a12 12 0 0 0 24 0c0-5-3-9-12-23Z" fill="#fff" />
    <path d="M6 70c14-6 30-2 44 9l22 4c9 2 9 14 0 15l-34 3c-14 2-26-4-32-14Z" fill="url(#sk)" />
    <path d="M144 70c-14-6-30-2-44 9l-22 4c-9 2-9 14 0 15l34 3c14 2 26-4 32-14Z" fill="url(#sk)" />
    <path d="M40 92c10 8 26 12 35 12s25-4 35-12" stroke="#d99a78" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
const OutlineHeart = () => (
  <svg className="dd-outline-heart" viewBox="0 0 70 70" aria-hidden="true" fill="none" stroke="#d20b2a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M35 62C8 42 6 22 20 14c8-4 14 0 15 6 1-6 7-10 15-6 14 8 12 28-15 48Z" />
    <path d="M2 36h18l5-9 6 18 5-9h32" />
  </svg>
);

const Modal = ({ title, onClose, children }) => (
  <div className="dd-overlay" onClick={onClose}>
    <div className="dd-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
      <div className="dd-modal-head"><h3>{title}</h3><button onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button></div>
      {children}
    </div>
  </div>
);

function ApptForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="dd-form">
      <label className="dd-field">Hospital<select value={f.hospital} onChange={set("hospital")}>{["City Hospital, Chattogram", "Aga Khan Hospital", "Chattogram Medical Hospital", "Chittagong General Hospital"].map((h) => <option key={h}>{h}</option>)}</select></label>
      <label className="dd-field">Date<input type="date" value={f.date} onChange={set("date")} /></label>
      <label className="dd-field">Time<select value={f.time} onChange={set("time")}>{["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "03:00 PM - 04:00 PM"].map((t) => <option key={t}>{t}</option>)}</select></label>
      <div className="dd-modal-actions"><button className="dd-btn dd-btn-outline" onClick={onCancel}>Cancel</button><button className="dd-btn dd-btn-primary" onClick={() => f.date ? onSubmit(f) : alert("Please choose a date")}>{submitLabel}</button></div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function DonorDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [available, setAvailable] = useState(true);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(false);
  const [requests, setRequests] = useState(initRequests);
  const [history] = useState(initHistory);
  const [appts, setAppts] = useState(initAppts);
  const [notifs, setNotifs] = useState(initNotifs);
  const [chats, setChats] = useState(initChats);
  const [chatId, setChatId] = useState(1);
  const [draft, setDraft] = useState("");
  const [profile, setProfile] = useState(initProfile);
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [prefs, setPrefs] = useState({ email: true, sms: true, urgent: true, visible: true });

  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(t); }, [notice]);

  const unread = notifs.filter((n) => !n.read).length;
  const last = history[0].date;
  const next = new Date(d(last).getTime() + 92 * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const acceptedN = 2 + requests.filter((r) => r.status === "accepted").length;
  const declinedN = 1 + requests.filter((r) => r.status === "declined").length;
  const go = (label) => { setActive(label); setMenu(false); setModal(null); window.scrollTo?.(0, 0); };
  const addNotif = (title, text) => setNotifs((n) => [{ id: Date.now(), icon: "heart", title, text, time: "Just now", read: false }, ...n]);

  const respond = (r, status) => {
    setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    try { localStorage.setItem("bc_last_donor_response", JSON.stringify({ requestId: r.id, status, title: reqTitle(r), at: new Date().toISOString() })); } catch (e) { /* ignore */ }
    if (status === "accepted") { addNotif("Request accepted", reqTitle(r)); setNotice("Request accepted. Recipient response recorded and notification queued."); }
    else setNotice("Request declined.");
    setModal(null);
  };
  const addAppt = (f) => { setAppts((a) => [...a, { id: Date.now(), date: f.date, time: f.time, hospital: f.hospital, place: "Chattogram" }].sort((x, y) => x.date.localeCompare(y.date))); addNotif("Appointment booked", `${fmt(f.date)} at ${f.hospital}`); setNotice("Appointment booked successfully."); setModal(null); };
  const reschedule = (id, f) => { setAppts((a) => a.map((x) => (x.id === id ? { ...x, ...f } : x))); setNotice("Appointment rescheduled."); setModal(null); };
  const cancelAppt = (id) => { setAppts((a) => a.filter((x) => x.id !== id)); setNotice("Appointment cancelled."); setModal(null); };
  const openNotif = (n) => { setNotifs((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x))); };
  const send = () => {
    const t = draft.trim(); if (!t) return;
    setChats((c) => c.map((x) => (x.id === chatId ? { ...x, msgs: [...x.msgs, { from: "me", text: t }] } : x)));
    setDraft("");
    const id = chatId;
    setTimeout(() => setChats((c) => c.map((x) => (x.id === id ? { ...x, msgs: [...x.msgs, { from: "them", text: "Thanks for your message. We will get back to you shortly." }] } : x))), 1200);
  };
  const saveProfile = () => { setEditing(false); setNotice("Profile updated successfully."); };

  const reqButton = (r) => {
    if (r.status !== "pending") return <button className="dd-view" disabled><span className="dd-st">{r.status === "accepted" ? "Accepted" : "Declined"}</span></button>;
    return r.urgency === "Urgent"
      ? <button className="dd-accept" onClick={() => respond(r, "accepted")}>Accept <span>›</span></button>
      : <button className="dd-view" onClick={() => setModal({ type: "request", id: r.id })}>View <span>›</span></button>;
  };
  const viewBtn = (r) => <button className="dd-view" onClick={() => setModal({ type: "request", id: r.id })}>View <span>›</span></button>;

  /* ---------- pages ---------- */
  const Dashboard = (
    <>
      <section className="dd-welcome">
        <div><h1>Welcome Back, {profile.name.split(" ")[0]}!</h1><p>Your kindness helps save lives. Thank you for being a BloodConnect donor.</p></div>
        <div className="dd-welcome-art"><span className="dd-slogan">A Drop<br />Can Change<br />A Life</span><HandsHeart /><OutlineHeart /></div>
      </section>
      <section className="dd-summary-grid">
        <article className="dd-summary dd-pink" onClick={() => go("Donation History")}><span className="dd-summary-icon"><Icon name="drop" size={30} /></span><div><small>Total Donations</small><strong>{history.length}</strong><p>Last donation:<br />{fmtLong(last)}</p></div></article>
        <article className="dd-summary dd-blue" onClick={() => go("Blood Requests")}><span className="dd-summary-icon"><Icon name="mail" size={22} /></span><div><small>Requests Responded</small><strong>{acceptedN + declinedN}</strong><p>{acceptedN} accepted<br />{declinedN} declined</p></div></article>
        <article className="dd-summary dd-yellow" onClick={() => setModal({ type: "lives" })}><span className="dd-summary-icon"><Icon name="people" size={32} /></span><div><small>Lives Impacted</small><strong>{history.length * 3}+</strong><p>Each donation can<br />help up to 3 lives</p></div></article>
        <article className="dd-summary dd-green" onClick={() => go("Appointments")}><span className="dd-summary-icon"><Icon name="calendar" size={30} /></span><div><small>Upcoming Appointment</small><strong className="dd-date">{appts[0] ? fmt(appts[0].date) : "None"}</strong><p>{appts[0] ? appts[0].hospital.replace(", ", ",\u00a0").split(",")[0] + ",\nChattogram" : "Book one now"}</p></div><span className="dd-go"><Icon name="arrow" size={14} /></span></article>
      </section>
      <section className="dd-content-grid">
        <article className="dd-panel dd-requests-panel">
          <div className="dd-panel-heading"><h2>Recent Blood Requests</h2><button onClick={() => go("Blood Requests")}>View All</button></div>
          {requests.slice(0, 3).map((r) => (
            <div className="dd-request-row" key={r.id}>
              <span className="dd-request-drop"><Icon name="drop" size={24} /></span>
              <div className="dd-request-copy"><b>{reqTitle(r)}</b><p>{r.units} <i className="dd-dot">•</i> <span className={r.urgency === "Urgent" ? "dd-urgent" : "dd-normal"}>{r.urgency}</span></p></div>
              <time>{r.time}</time>{reqButton(r)}
            </div>
          ))}
        </article>
        <aside className="dd-panel dd-right-panel">
          <div className="dd-panel-heading"><h2>My Availability</h2><button className={`dd-toggle ${available ? "on" : ""}`} onClick={() => { setAvailable((v) => !v); setNotice(available ? "You are now unavailable for donations." : "You are now available for donations."); }} aria-label="Toggle availability" aria-pressed={available}><span /></button></div>
          <div className="dd-availability-line"><p>Let hospitals know when you can donate.</p></div>
          <div className="dd-panel-divider" />
          <div className="dd-panel-heading"><h2>Eligibility Status</h2><span className="dd-eligible"><Icon name="check" size={13} /> Eligible</span></div>
          <div className="dd-detail-line"><span><Icon name="drop" size={14} />Blood Group</span><b>{profile.group}</b></div>
          <div className="dd-detail-line"><span><Icon name="history" size={14} />Last Donation</span><b>{fmtLong(last)}</b></div>
          <div className="dd-detail-line"><span><Icon name="calendar" size={14} />Next Eligible Date</span><b>{next}</b></div>
          <div className="dd-info-box"><Icon name="info" size={18} /><span>You are eligible to donate again in 92 days.</span></div>
          <div className="dd-panel-divider" />
          <h2 className="dd-quick-title">Quick Actions</h2>
          <div className="dd-quick-actions">
            <button onClick={() => { go("My Profile"); setEditing(true); }}><Icon name="user" size={22} /><span>Update<br />Profile</span></button>
            <button onClick={() => go("Blood Requests")}><Icon name="search" size={22} /><span>Find<br />Requests</span></button>
            <button onClick={() => setModal({ type: "book" })}><Icon name="calendar" size={22} /><span>Book<br />Appointment</span></button>
            <button onClick={() => setModal({ type: "refer" })}><Icon name="plus" size={22} /><span>Refer<br />a Friend</span></button>
          </div>
        </aside>
        <article className="dd-panel dd-bottom-panel">
          <div className="dd-panel-heading"><h2>Upcoming Appointments</h2><button onClick={() => go("Appointments")}>View All</button></div>
          {appts[0] ? (
            <div className="dd-appointment">
              <div className="dd-calendar"><span>{d(appts[0].date).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}</span><b>{d(appts[0].date).getDate()}</b></div>
              <div className="dd-appointment-info"><b>{appts[0].hospital}</b><p><Icon name="clock" size={13} />{appts[0].time}</p><p><Icon name="pin" size={13} />{appts[0].place}</p></div>
              <button onClick={() => setModal({ type: "reschedule", id: appts[0].id })}>Reschedule</button>
            </div>
          ) : <p className="dd-empty">No upcoming appointments. <button className="dd-link" onClick={() => setModal({ type: "book" })}>Book one</button></p>}
        </article>
        <article className="dd-panel dd-bottom-panel">
          <div className="dd-panel-heading"><h2>Donation History</h2><button onClick={() => go("Donation History")}>View All</button></div>
          {history.slice(0, 3).map((h) => <div className="dd-history-row" key={h.id}><span>{fmt(h.date)}</span><b>{h.group}</b><span>{h.hospital}</span><em><Icon name="check" size={11} /> Completed</em></div>)}
        </article>
        <article className="dd-panel dd-bottom-panel">
          <div className="dd-panel-heading"><h2>Recent Notifications</h2><button onClick={() => go("Notifications")}>View All</button></div>
          {notifs.slice(0, 3).map((n) => <div className="dd-notification" key={n.id} onClick={() => { openNotif(n); go("Notifications"); }}><span className="dd-notif-icon"><Icon name={n.icon} size={15} /></span><div><b>{n.title}</b><p>{n.text}</p></div><small>{n.time}</small></div>)}
        </article>
      </section>
    </>
  );

  const Profile = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>My Profile</h1><p>Keep your details up to date so hospitals can reach you.</p></div>
        {editing ? <div className="dd-row"><button className="dd-btn dd-btn-outline" onClick={() => { setProfile(initProfile); setEditing(false); }}>Cancel</button><button className="dd-btn dd-btn-primary" onClick={saveProfile}>Save changes</button></div> : <button className="dd-btn dd-btn-primary" onClick={() => setEditing(true)}>Edit profile</button>}
      </div>
      <div className="dd-panel dd-profile">
        <div className="dd-avatar-col"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt={profile.name} /><b>{profile.name}</b><span className="dd-eligible">Blood group {profile.group}</span></div>
        <div className="dd-form dd-grid2">
          {[["name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["dob", "Date of birth", "date"], ["weight", "Weight (kg)", "number"], ["address", "Address", "text"]].map(([k, l, t]) => (
            <label className="dd-field" key={k}>{l}<input type={t} value={profile[k]} disabled={!editing} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} /></label>
          ))}
          <label className="dd-field">Blood group<select disabled={!editing} value={profile.group} onChange={(e) => setProfile({ ...profile, group: e.target.value })}>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <option key={g}>{g}</option>)}</select></label>
        </div>
      </div>
    </section>
  );

  const shown = requests.filter((r) => filter === "All" || (filter === "Pending" ? r.status === "pending" : r.urgency === filter));
  const Requests = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>Blood Requests</h1><p>Requests that match your blood group and location.</p></div></div>
      <div className="dd-tabs">{["All", "Urgent", "Normal", "Pending"].map((t) => <button key={t} className={filter === t ? "on" : ""} onClick={() => setFilter(t)}>{t}</button>)}</div>
      <div className="dd-panel">
        {shown.length === 0 && <p className="dd-empty">No requests in this filter.</p>}
        {shown.map((r) => (
          <div className="dd-request-row dd-wide" key={r.id}>
            <span className="dd-request-drop"><Icon name="drop" size={24} /></span>
            <div className="dd-request-copy"><b>{reqTitle(r)}</b><p>{r.units} <i className="dd-dot">•</i> <span className={r.urgency === "Urgent" ? "dd-urgent" : "dd-normal"}>{r.urgency}</span> <i className="dd-dot">•</i> {r.place}</p></div>
            <time>{r.time}</time>
            <div className="dd-row">{viewBtn(r)}{r.status === "pending" && <button className="dd-accept" onClick={() => respond(r, "accepted")}>Accept</button>}{r.status === "pending" && <button className="dd-view" onClick={() => respond(r, "declined")}>Decline</button>}{r.status !== "pending" && <span className={`dd-badge ${r.status}`}>{r.status}</span>}</div>
          </div>
        ))}
      </div>
    </section>
  );

  const History = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>Donation History</h1><p>{history.length} donations so far. Thank you!</p></div></div>
      <div className="dd-panel dd-scroll"><table className="dd-table"><thead><tr><th>Date</th><th>Blood group</th><th>Hospital</th><th>Status</th></tr></thead><tbody>
        {history.map((h) => <tr key={h.id}><td>{fmt(h.date)}</td><td><b>{h.group}</b></td><td>{h.hospital}</td><td><em className="dd-done"><Icon name="check" size={11} /> Completed</em></td></tr>)}
      </tbody></table></div>
    </section>
  );

  const Appointments = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>Appointments</h1><p>Your scheduled donation visits.</p></div><button className="dd-btn dd-btn-primary" onClick={() => setModal({ type: "book" })}>Book appointment</button></div>
      <div className="dd-panel">
        {appts.length === 0 && <p className="dd-empty">No upcoming appointments. Book one to continue donating.</p>}
        {appts.map((a) => (
          <div className="dd-appointment dd-wide" key={a.id}>
            <div className="dd-calendar"><span>{d(a.date).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}</span><b>{d(a.date).getDate()}</b></div>
            <div className="dd-appointment-info"><b>{a.hospital}</b><p><Icon name="clock" size={13} />{a.time}</p><p><Icon name="pin" size={13} />{a.place}</p></div>
            <div className="dd-row"><button onClick={() => setModal({ type: "reschedule", id: a.id })}>Reschedule</button><button onClick={() => setModal({ type: "cancel", id: a.id })}>Cancel</button></div>
          </div>
        ))}
      </div>
    </section>
  );

  const Notifications = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>Notifications</h1><p>{unread} unread</p></div><button className="dd-btn dd-btn-outline" onClick={() => { setNotifs((l) => l.map((n) => ({ ...n, read: true }))); setNotice("All notifications marked as read."); }}>Mark all as read</button></div>
      <div className="dd-panel">
        {notifs.map((n) => <div className={`dd-notification dd-wide ${n.read ? "" : "unread"}`} key={n.id} onClick={() => openNotif(n)}><span className="dd-notif-icon"><Icon name={n.icon} size={16} /></span><div><b>{n.title}</b><p>{n.text}</p></div><small>{n.time}</small></div>)}
      </div>
    </section>
  );

  const chat = chats.find((c) => c.id === chatId);
  const Messages = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>Messages</h1><p>Talk to hospitals and requesters.</p></div></div>
      <div className="dd-panel dd-chat">
        <div className="dd-chat-list">{chats.map((c) => <button key={c.id} className={c.id === chatId ? "on" : ""} onClick={() => setChatId(c.id)}><b>{c.name}</b><span>{c.msgs[c.msgs.length - 1].text}</span></button>)}</div>
        <div className="dd-chat-main">
          <div className="dd-chat-title"><b>{chat.name}</b><span>{chat.role}</span></div>
          <div className="dd-chat-body">{chat.msgs.map((m, i) => <div key={i} className={`dd-msg ${m.from}`}>{m.text}</div>)}</div>
          <div className="dd-chat-input"><input value={draft} placeholder="Type a message" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} /><button className="dd-btn dd-btn-primary" onClick={send}><Icon name="send" size={16} /> Send</button></div>
        </div>
      </div>
    </section>
  );

  const Settings = (
    <section className="dd-page">
      <div className="dd-page-head"><div><h1>Settings</h1><p>Choose how BloodConnect contacts you.</p></div></div>
      <div className="dd-panel">
        {[["email", "Email notifications", "Get request and appointment updates by email."], ["sms", "SMS alerts", "Receive urgent requests by text message."], ["urgent", "Urgent requests only", "Only notify me about urgent blood needs."], ["visible", "Show my profile to hospitals", "Hospitals can see your blood group and city."]].map(([k, t, s]) => (
          <div className="dd-setting" key={k}><div><b>{t}</b><p>{s}</p></div><button className={`dd-toggle ${prefs[k] ? "on" : ""}`} aria-pressed={prefs[k]} aria-label={t} onClick={() => { setPrefs({ ...prefs, [k]: !prefs[k] }); setNotice(`${t} ${prefs[k] ? "turned off" : "turned on"}.`); }}><span /></button></div>
        ))}
        <div className="dd-setting"><div><b>Password</b><p>Change your account password.</p></div><button className="dd-btn dd-btn-outline" onClick={() => setModal({ type: "password" })}>Change password</button></div>
        <div className="dd-setting"><div><b>Delete account</b><p>This removes your donor profile.</p></div><button className="dd-btn dd-btn-danger" onClick={() => setModal({ type: "delete" })}>Delete account</button></div>
      </div>
    </section>
  );

  const pages = { Dashboard, "My Profile": Profile, "Blood Requests": Requests, "Donation History": History, Appointments, Notifications, Messages, Settings };
  const mr = modal && modal.id ? requests.find((r) => r.id === modal.id) : null;
  const ma = modal && modal.id ? appts.find((a) => a.id === modal.id) : null;

  return (
    <div className="dd-shell">
      <aside className="dd-sidebar">
        <Brand />
        <nav className="dd-side-nav" aria-label="Donor menu">
          {NAV.map(([icon, label]) => (
            <button key={label} className={active === label ? "selected" : ""} onClick={() => go(label)}><Icon name={icon} size={18} /><span>{label}</span>{label === "Notifications" && unread > 0 && <i>{unread}</i>}</button>
          ))}
        </nav>
        <Link className="dd-logout" to="/"><Icon name="logout" size={19} />Logout</Link>
      </aside>
      <main className="dd-main">
        <header className="dd-topbar">
          <div className="dd-top-actions">
            <button className="dd-bell" aria-label="Notifications" onClick={() => go("Notifications")}><Icon name="bell" size={21} />{unread > 0 && <i>{unread}</i>}</button>
            <div className="dd-user-wrap">
              <button className="dd-user" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt={profile.name} />
                <div><b>{profile.name}</b><span>Donor</span></div><span className="dd-chevron">⌄</span>
              </button>
              {menu && <div className="dd-menu" role="menu"><button onClick={() => go("My Profile")}>My Profile</button><button onClick={() => go("Settings")}>Settings</button><Link to="/">Logout</Link></div>}
            </div>
          </div>
        </header>
        {notice && <div className="dd-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Close">×</button></div>}
        {pages[active]}
      </main>

      {modal?.type === "request" && mr && (
        <Modal title={reqTitle(mr)} onClose={() => setModal(null)}>
          <div className="dd-detail-line"><span>Units needed</span><b>{mr.units}</b></div>
          <div className="dd-detail-line"><span>Urgency</span><b className={mr.urgency === "Urgent" ? "dd-urgent" : "dd-normal"}>{mr.urgency}</b></div>
          <div className="dd-detail-line"><span>Location</span><b>{mr.place}</b></div>
          <div className="dd-detail-line"><span>Contact</span><b>{mr.phone}</b></div>
          <p className="dd-note">{mr.note}</p>
          <div className="dd-modal-actions">{mr.status === "pending" ? <><button className="dd-btn dd-btn-outline" onClick={() => respond(mr, "declined")}>Decline</button><button className="dd-btn dd-btn-primary" onClick={() => respond(mr, "accepted")}>Accept request</button></> : <span className={`dd-badge ${mr.status}`}>{mr.status}</span>}</div>
        </Modal>
      )}
      {modal?.type === "book" && <Modal title="Book appointment" onClose={() => setModal(null)}><ApptForm initial={{ hospital: "City Hospital, Chattogram", date: "", time: "10:00 AM - 11:00 AM" }} submitLabel="Book appointment" onSubmit={addAppt} onCancel={() => setModal(null)} /></Modal>}
      {modal?.type === "reschedule" && ma && <Modal title="Reschedule appointment" onClose={() => setModal(null)}><ApptForm initial={{ hospital: ma.hospital, date: ma.date, time: ma.time }} submitLabel="Save new time" onSubmit={(f) => reschedule(ma.id, f)} onCancel={() => setModal(null)} /></Modal>}
      {modal?.type === "cancel" && ma && <Modal title="Cancel appointment?" onClose={() => setModal(null)}><p className="dd-note">{ma.hospital} on {fmt(ma.date)} will be cancelled.</p><div className="dd-modal-actions"><button className="dd-btn dd-btn-outline" onClick={() => setModal(null)}>Keep it</button><button className="dd-btn dd-btn-danger" onClick={() => cancelAppt(ma.id)}>Cancel appointment</button></div></Modal>}
      {modal?.type === "refer" && <Modal title="Refer a friend" onClose={() => setModal(null)}><p className="dd-note">Share this link. Every friend who donates helps save more lives.</p><div className="dd-copy"><input readOnly value="https://bloodconnect.app/join?ref=nafisa" /><button className="dd-btn dd-btn-primary" onClick={() => { try { navigator.clipboard.writeText("https://bloodconnect.app/join?ref=nafisa"); } catch (e) { /* ignore */ } setNotice("Referral link copied."); setModal(null); }}>Copy link</button></div></Modal>}
      {modal?.type === "lives" && <Modal title="Lives impacted" onClose={() => setModal(null)}><p className="dd-note">You have made {history.length} donations. Each donation can help up to 3 patients, so you have helped about {history.length * 3} people.</p><div className="dd-modal-actions"><button className="dd-btn dd-btn-primary" onClick={() => setModal(null)}>Close</button></div></Modal>}
      {modal?.type === "password" && <Modal title="Change password" onClose={() => setModal(null)}><div className="dd-form"><label className="dd-field">Current password<input type="password" /></label><label className="dd-field">New password<input type="password" /></label><div className="dd-modal-actions"><button className="dd-btn dd-btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="dd-btn dd-btn-primary" onClick={() => { setModal(null); setNotice("Password updated."); }}>Update password</button></div></div></Modal>}
      {modal?.type === "delete" && <Modal title="Delete account?" onClose={() => setModal(null)}><p className="dd-note">This is a demo. No data will be deleted.</p><div className="dd-modal-actions"><button className="dd-btn dd-btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="dd-btn dd-btn-danger" onClick={() => { setModal(null); setNotice("Demo only: account not deleted."); }}>Delete</button></div></Modal>}
    </div>
  );
}