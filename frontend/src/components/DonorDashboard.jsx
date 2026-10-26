import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import welcomeArt from "../assets/welcome-art.png";
import { getMyDonor, getMyHistory, getConversations, getMyRequests, getThread, respondToRequest, sendMessage, setMyAvailability, setMyAvatar, setMyLocation, updateMyDonor } from "../services/donorApi.js";
import "./DonorDashboard.css";

/* ---------- demo data (backend e connect korar age porjonto) ---------- */
/* Appointments / notifications / chats ekhono demo (onno endpoint lagbe). Blood requests ekhon real. */
const initAppts = [{ id: 1, date: "2025-06-12", time: "10:00 AM - 11:00 AM", hospital: "City Hospital, Chattogram", place: "Hathazari, Chattogram" }];
const initNotifs = [
  { id: 1, icon: "megaphone", title: "Your donation helped 3 patients!", text: "Thank you for making a difference.", time: "2 hours ago", read: false },
  { id: 2, icon: "calendar", title: "Upcoming donation appointment", text: "12 Jun 2025 at City Hospital, Chattogram", time: "1 day ago", read: false },
  { id: 3, icon: "heart", title: "New blood request matches your profile", text: "A+ blood needed at Chattogram Medical Hospital", time: "2 days ago", read: false }
];
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
const emptyProfile = { name: "", email: "", phone: "", group: "", dob: "", weight: "", address: "" };
const NAV = [["grid", "Dashboard"], ["user", "My Profile"], ["clipboard", "Blood Requests"], ["history", "Donation History"], ["calendar", "Appointments"], ["bell", "Notifications"], ["message", "Messages"], ["settings", "Settings"]];

const d = (s) => new Date(s + "T00:00:00");
const fmt = (s) => (s ? d(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const fmtLong = (s) => (s ? d(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "-");
const ago = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(m, 1)} min ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hours ago` : `${Math.floor(h / 24)} days ago`;
};
/* backend request ke dashboard er request shape e convert kore */
const toRequest = (r) => ({
  id: r.id,
  group: r.bloodGroup,
  hospital: r.hospitalName,
  place: r.hospitalLocation,
  units: `${r.units} ${r.units > 1 ? "Units" : "Unit"}`,
  urgency: r.urgency === "Normal" ? "Normal" : "Urgent",
  time: ago(r.createdAt),
  phone: r.contact,
  note: r.details || `Blood needed by ${new Date(r.dateNeeded).toLocaleDateString("en-GB")}.`,
  status: r.myResponse || "pending"
});
const reqTitle = (r) => `${r.group} blood needed at ${r.hospital}`;

/* backend er donor object ke dashboard er profile shape e convert kore */
const toProfile = (me) => ({
  name: me.name || "",
  email: me.email || "",
  phone: me.phone || "",
  group: me.bloodGroup || "",
  dob: me.dateOfBirth ? me.dateOfBirth.slice(0, 10) : "",
  weight: me.weightKg ? String(me.weightKg) : "",
  address: me.address || me.city || ""
});

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
    <svg width="24" height="29" viewBox="0 0 24 28" aria-hidden="true"><path d="M12 1S3 11.5 3 17.5a9 9 0 0 0 18 0C21 11.5 12 1 12 1Z" fill="#d10b2a" /><path d="M8 18a4 4 0 0 0 4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
    <b><span>Blood</span>Connect</b>
  </Link>
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
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [appts, setAppts] = useState(initAppts);
  const [notifs, setNotifs] = useState(initNotifs);
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [draft, setDraft] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [avatar, setAvatar] = useState("");
  const [myLoc, setMyLoc] = useState(null);
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [prefs, setPrefs] = useState({ email: true, sms: true, urgent: true, visible: true });

  useEffect(() => { const o = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = o; }; }, []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(t); }, [notice]);

  /* ---------- backend: donor data load ---------- */
  const loadDonor = async () => {
    const [me, hist, reqs] = await Promise.all([getMyDonor(), getMyHistory(), getMyRequests().catch(() => [])]);
    setRequests(reqs.map(toRequest));
    const p = toProfile(me);
    setProfile(p);
    setSavedProfile(p);
    setAvailable(me.isAvailable);
    setAvatar(me.avatar || "");
    setMyLoc(me.location || null);
    setStats(me.stats);
    setHistory(hist.map((h) => ({ id: h.id, date: h.date.slice(0, 10), group: h.bloodGroup || me.bloodGroup || "", hospital: h.hospitalName })));
  };
  useEffect(() => {
    let alive = true;
    loadDonor().catch((e) => { if (alive) setNotice(e.message); });
    return () => { alive = false; };
  }, []);

  /* ---------- backend: messages ---------- */
  const loadChats = async () => {
    const list = await getConversations();
    setChats((prev) => list.map((c) => {
      const old = prev.find((p) => p.id === c.userId);
      return { id: c.userId, name: c.name, role: c.role, loaded: !!old?.loaded, msgs: old?.loaded ? old.msgs : [{ from: c.lastFromMe ? "me" : "them", text: c.lastMessage }] };
    }));
    setChatId((cur) => cur || (list[0] ? list[0].userId : null));
  };
  const loadThread = async (id) => {
    const msgs = await getThread(id);
    setChats((c) => c.map((x) => (x.id === id ? { ...x, loaded: true, msgs: msgs.map((m) => ({ from: m.mine ? "me" : "them", text: m.text })) } : x)));
  };
  useEffect(() => {
    if (active !== "Messages") return;
    const tick = () => { loadChats().catch(() => {}); if (chatId) loadThread(chatId).catch(() => {}); };
    tick();
    const t = setInterval(tick, 5000);
    return () => clearInterval(t);
  }, [active, chatId]);

  const toggleAvailable = async () => {
    const nextVal = !available;
    setAvailable(nextVal);
    try {
      await setMyAvailability(nextVal);
      setNotice(nextVal ? "You are now available for donations." : "You are now unavailable for donations.");
    } catch (e) { setAvailable(!nextVal); setNotice(e.message); }
  };

  const unread = notifs.filter((n) => !n.read).length;
  const last = stats?.lastDonationDate ? stats.lastDonationDate.slice(0, 10) : history[0]?.date || null;
  const isEligible = stats ? stats.isEligible : true;
  const next = stats?.nextEligibleDate ? fmtLong(stats.nextEligibleDate.slice(0, 10)) : "Now";
  const acceptedN = requests.filter((r) => r.status === "accepted").length;
  const declinedN = requests.filter((r) => r.status === "declined").length;
  const lives = stats ? stats.livesImpacted : history.length * 3;
  const go = (label) => { setActive(label); setMenu(false); setModal(null); window.scrollTo?.(0, 0); };
  const addNotif = (title, text) => setNotifs((n) => [{ id: Date.now(), icon: "heart", title, text, time: "Just now", read: false }, ...n]);

  const respond = async (r, status) => {
    try { await respondToRequest(r.id, status); } catch (e) { setNotice(e.message); setModal(null); return; }
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
  const send = async () => {
    const t = draft.trim(); if (!t || !chatId) return;
    try { await sendMessage(chatId, t); setDraft(""); await loadThread(chatId); } catch (e) { setNotice(e.message); }
  };
  const saveProfile = async () => {
    const payload = { address: profile.address, dateOfBirth: profile.dob, weightKg: profile.weight };
    if (profile.phone) payload.phone = profile.phone;
    if (profile.group) payload.bloodGroup = profile.group;
    try {
      const me = await updateMyDonor(payload);
      const p = toProfile(me);
      setProfile(p);
      setSavedProfile(p);
      setStats(me.stats);
      setEditing(false);
      setNotice("Profile updated successfully.");
    } catch (e) { setNotice(e.message); }
  };

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const size = 256, canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const m = Math.min(img.width, img.height);
      canvas.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
      URL.revokeObjectURL(url);
      try { setAvatar(await setMyAvatar(canvas.toDataURL("image/jpeg", 0.8))); setNotice("Profile photo updated."); }
      catch (err) { setNotice(err.message); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); setNotice("Could not read this image."); };
    img.src = url;
  };

  const shareLocation = () => {
    if (!navigator.geolocation) return setNotice("Your browser does not support location.");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try { setMyLoc(await setMyLocation(p.coords.latitude, p.coords.longitude)); setNotice("Location saved. It will show on the Find Donor map."); }
        catch (e) { setNotice(e.message); }
      },
      () => setNotice("Could not get your location. Please allow location access in the browser."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const removeLocation = async () => {
    try { await setMyLocation(null, null); setMyLoc(null); setNotice("Location removed from the map."); } catch (e) { setNotice(e.message); }
  };

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
      <section className="dd-top-grid"><div className="dd-left-col">
      <div className="dd-summary-grid">
        <article className="dd-summary dd-pink" onClick={() => go("Donation History")}><span className="dd-summary-icon"><Icon name="drop" size={30} /></span><div><small>Total Donations</small><strong>{stats ? stats.totalDonations : history.length}</strong><p>Last donation:<br />{fmtLong(last)}</p></div></article>
        <article className="dd-summary dd-blue" onClick={() => go("Blood Requests")}><span className="dd-summary-icon"><Icon name="mail" size={22} /></span><div><small>Requests Responded</small><strong>{acceptedN + declinedN}</strong><p>{acceptedN} accepted<br />{declinedN} declined</p></div></article>
        <article className="dd-summary dd-yellow" onClick={() => setModal({ type: "lives" })}><span className="dd-summary-icon"><Icon name="people" size={32} /></span><div><small>Lives Impacted</small><strong>{lives}+</strong><p>Each donation can<br />help up to 3 lives</p></div></article>
        <article className="dd-summary dd-green" onClick={() => go("Appointments")}><span className="dd-summary-icon"><Icon name="calendar" size={30} /></span><div><small>Upcoming Appointment</small><strong className="dd-date">{appts[0] ? fmt(appts[0].date) : "None"}</strong><p>{appts[0] ? appts[0].hospital.replace(", ", ",\u00a0").split(",")[0] + ",\nChattogram" : "Book one now"}</p></div><span className="dd-go"><Icon name="arrow" size={14} /></span></article>
      </div>
        <article className="dd-panel dd-requests-panel">
          <div className="dd-panel-heading"><h2>Recent Blood Requests</h2><button onClick={() => go("Blood Requests")}>View All</button></div>
          <div className="dd-request-list">
          {requests.slice(0, 3).map((r) => (
            <div className="dd-request-row" key={r.id}>
              <span className="dd-request-drop"><Icon name="drop" size={24} /></span>
              <div className="dd-request-copy"><b>{reqTitle(r)}</b><p>{r.units} <i className="dd-dot">•</i> <span className={r.urgency === "Urgent" ? "dd-urgent" : "dd-normal"}>{r.urgency}</span></p></div>
              <time>{r.time}</time>{reqButton(r)}
            </div>
          ))}
          </div>
        </article>
        </div>
        <aside className="dd-panel dd-right-panel">
          <div className="dd-panel-heading"><h2>My Availability</h2><button className={`dd-toggle ${available ? "on" : ""}`} onClick={toggleAvailable} aria-label="Toggle availability" aria-pressed={available}><span /></button></div>
          <div className="dd-availability-line"><p>Let hospitals know when you can donate.</p></div>
          <div className="dd-panel-divider" />
          <div className="dd-panel-heading"><h2>Eligibility Status</h2><span className="dd-eligible"><Icon name="check" size={13} /> {isEligible ? "Eligible" : "Not yet eligible"}</span></div>
          <div className="dd-detail-line"><span><Icon name="drop" size={14} />Blood Group</span><b>{profile.group || "-"}</b></div>
          <div className="dd-detail-line"><span><Icon name="history" size={14} />Last Donation</span><b>{fmtLong(last)}</b></div>
          <div className="dd-detail-line"><span><Icon name="calendar" size={14} />Next Eligible Date</span><b>{next}</b></div>
          <div className="dd-info-box"><Icon name="info" size={18} /><span>{isEligible ? "You are eligible to donate now." : `You are eligible to donate again in ${stats?.daysUntilEligible ?? 0} days.`}</span></div>
          <div className="dd-panel-divider" />
          <h2 className="dd-quick-title">Quick Actions</h2>
          <div className="dd-quick-actions">
            <button onClick={() => { go("My Profile"); setEditing(true); }}><Icon name="user" size={22} /><span>Update<br />Profile</span></button>
            <button onClick={() => go("Blood Requests")}><Icon name="search" size={22} /><span>Find<br />Requests</span></button>
            <button onClick={() => setModal({ type: "book" })}><Icon name="calendar" size={22} /><span>Book<br />Appointment</span></button>
            <button onClick={() => setModal({ type: "refer" })}><Icon name="plus" size={22} /><span>Refer<br />a Friend</span></button>
          </div>
        </aside>
      </section>
      <section className="dd-bottom-grid">
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
          {history.length === 0 && <p className="dd-empty">No donations recorded yet.</p>}
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
        {editing ? <div className="dd-row"><button className="dd-btn dd-btn-outline" onClick={() => { setProfile(savedProfile); setEditing(false); }}>Cancel</button><button className="dd-btn dd-btn-primary" onClick={saveProfile}>Save changes</button></div> : <button className="dd-btn dd-btn-primary" onClick={() => setEditing(true)}>Edit profile</button>}
      </div>
      <div className="dd-panel dd-profile">
        <div className="dd-avatar-col"><img src={avatar || DEFAULT_AVATAR} alt={profile.name} /><b>{profile.name}</b><span className="dd-eligible">Blood group {profile.group}</span><label className="dd-btn dd-btn-outline" style={{ cursor: "pointer" }}>Change photo<input type="file" accept="image/*" hidden onChange={pickAvatar} /></label><button className="dd-btn dd-btn-outline" onClick={myLoc ? removeLocation : shareLocation}>{myLoc ? "Remove my map location" : "Share my location on map"}</button></div>
        <div className="dd-form dd-grid2">
          {[["name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["dob", "Date of birth", "date"], ["weight", "Weight (kg)", "number"], ["address", "Address", "text"]].map(([k, l, t]) => (
            <label className="dd-field" key={k}>{l}<input type={t} value={profile[k]} disabled={!editing || k === "name" || k === "email"} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} /></label>
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
        {!chat ? <div className="dd-chat-main"><p className="dd-empty">No messages yet. Requesters can message you from the Find Donor page.</p></div> : <div className="dd-chat-main">
          <div className="dd-chat-title"><b>{chat.name}</b><span>{chat.role}</span></div>
          <div className="dd-chat-body">{chat.msgs.map((m, i) => <div key={i} className={`dd-msg ${m.from}`}>{m.text}</div>)}</div>
          <div className="dd-chat-input"><input value={draft} placeholder="Type a message" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} /><button className="dd-btn dd-btn-primary" onClick={send}><Icon name="send" size={16} /> Send</button></div>
        </div>}
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
        <header className="dd-topbar hero">
              {active === "Dashboard" && <div className="dd-hero-text"><h1>Welcome Back, {profile.name.split(" ")[0]}!</h1><p>Your kindness helps save lives. Thank you for being a BloodConnect donor.</p></div>}
              <img className="dd-welcome-img" src={welcomeArt} alt="A drop can change a life" />
            
          <div className="dd-top-actions">
            <button className="dd-bell" aria-label="Notifications" onClick={() => go("Notifications")}><Icon name="bell" size={21} />{unread > 0 && <i>{unread}</i>}</button>
            <div className="dd-user-wrap">
              <button className="dd-user" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
                <img src={avatar || DEFAULT_AVATAR} alt={profile.name} />
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
      {modal?.type === "refer" && <Modal title="Refer a friend" onClose={() => setModal(null)}><p className="dd-note">Share this link. Every friend who donates helps save more lives.</p><div className="dd-copy"><input readOnly value="https://bloodconnect.app/join?ref=donor" /><button className="dd-btn dd-btn-primary" onClick={() => { try { navigator.clipboard.writeText("https://bloodconnect.app/join?ref=donor"); } catch (e) { /* ignore */ } setNotice("Referral link copied."); setModal(null); }}>Copy link</button></div></Modal>}
      {modal?.type === "lives" && <Modal title="Lives impacted" onClose={() => setModal(null)}><p className="dd-note">You have made {stats ? stats.totalDonations : history.length} donations. Each donation can help up to 3 patients, so you have helped about {lives} people.</p><div className="dd-modal-actions"><button className="dd-btn dd-btn-primary" onClick={() => setModal(null)}>Close</button></div></Modal>}
      {modal?.type === "password" && <Modal title="Change password" onClose={() => setModal(null)}><div className="dd-form"><label className="dd-field">Current password<input type="password" /></label><label className="dd-field">New password<input type="password" /></label><div className="dd-modal-actions"><button className="dd-btn dd-btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="dd-btn dd-btn-primary" onClick={() => { setModal(null); setNotice("Password updated."); }}>Update password</button></div></div></Modal>}
      {modal?.type === "delete" && <Modal title="Delete account?" onClose={() => setModal(null)}><p className="dd-note">This is a demo. No data will be deleted.</p><div className="dd-modal-actions"><button className="dd-btn dd-btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="dd-btn dd-btn-danger" onClick={() => { setModal(null); setNotice("Demo only: account not deleted."); }}>Delete</button></div></Modal>}
    </div>
  );
}