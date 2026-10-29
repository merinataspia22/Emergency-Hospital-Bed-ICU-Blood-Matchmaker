import { useState, useEffect } from "react";
import { useStore, syncPartner } from "../services/bloodBankStore";
import { P } from "./bbIcons";
import { useAuth } from "../auth/AuthContext";
import { getMyStock, setGroupUnits } from "../api/bloodBankApi";
import "./BloodBankDashboard.css";

const Ic = ({ n }) => <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[n] }} />;
const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const OWN = "cmch", HOSP = "Chattogram Medical College Hospital";
const now = Date.now();
const EMPTY_STOCK = { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "O+": 0, "O-": 0, "AB+": 0, "AB-": 0 };
const SEED_REQ = [
  ["O+", "Rahim Uddin", "Chattogram Medical College", 3, "Surgery (Emergency)", "Urgent", 10],
  ["A+", "Shabana Khatun", "Aga Khan Hospital", 2, "Postpartum Hemorrhage", "High", 28],
  ["B-", "Imran Hossain", "Parkview Hospital", 1, "Accident Case", "Normal", 60],
  ["AB+", "Farhana Islam", "City Hospital", 3, "Cancer Treatment", "Normal", 120],
].map(([bloodGroup, patientName, hospital, units, details, urgency, m], i) => ({ id: "s" + i, patientName, bloodGroup, units, hospital, details, urgency, status: "Pending", createdAt: now - m * 6e4 }));
const SEED_XM = [["Nasir Ahmed", "A+", 2, "Pending"], ["Lamia Akter", "O-", 1, "Pending"], ["Sajid Khan", "B+", 3, "In Progress"], ["Ruksana Begum", "O+", 2, "Pending"], ["Tanvir Hasan", "AB-", 1, "In Progress"], ["Mst. Salma", "A-", 2, "Pending"]].map(([patient, group, units, status], i) => ({ id: "x" + i, patient, group, units, status }));
const SEED_APPT = [["Nafisa Alam", "A+", "12 Jun 2025, 10:00 AM", "0171XXXXXXX", "Confirmed"], ["Tawhid Hasan", "O+", "12 Jun 2025, 12:30 PM", "0182XXXXXXX", "Confirmed"], ["Sadia Rahman", "B+", "13 Jun 2025, 09:00 AM", "0167XXXXXXX", "Pending"], ["Arif Hossain", "O-", "13 Jun 2025, 11:00 AM", "0193XXXXXXX", "Confirmed"]].map(([name, bloodGroup, datetime, contact, status], i) => ({ id: "a" + i, name, bloodGroup, datetime, contact, status }));
const SEED_BEDS = [{ id: OWN, name: HOSP, area: "Chawkbazar, Chattogram", general: 70, icu: 14, generalTotal: 240, icuTotal: 60, blood: "Available", phone: "031-642100", hours: "24 Hours Open" }];
const NAV = [["Dashboard", "grid"], ["Blood Inventory", "drop"], ["Blood Requests", "doc"], ["Donor Appointments", "cal"], ["Hospital Beds", "bed", "/hospital-beds"], ["Donors", "users", "/find-donor"], ["Hospitals", "hosp", "/hospital-beds"], ["Reports", "chart"], ["Notifications", "bell"], ["Settings", "gear"]];
const VIEWS = { Dashboard: "dash", "Blood Requests": "requests", "Donor Appointments": "appts" };
const C = [60, 80, 65, 100, 120, 105, 130, 115, 125, 145, 140, 185], U = [28, 40, 32, 58, 68, 72, 90, 78, 84, 95, 92, 125];
const colors = ["#c98", "#a87", "#d9a", "#8ab", "#b96", "#9b8"];
const ini = (n) => n.replace(/^(Dr\.|Mst\.)\s*/, "").split(" ").map((w) => w[0]).join("").slice(0, 2);
const ago = (t) => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "just now" : m < 60 ? `${m} minutes ago` : m < 1440 ? `${Math.round(m / 60)} hours ago` : `${Math.round(m / 1440)} days ago`; };
const lvl = (u = "") => (/urgent|emergency/i.test(u) ? "urgent" : /high/i.test(u) ? "high" : "normal");

function Trend() {
  const W = 420, H = 210, L = 32, R = 8, T = 8, B = 26;
  const x = (i) => L + (i * (W - L - R)) / 11, y = (v) => T + (1 - v / 200) * (H - T - B);
  const ln = (a) => a.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const ar = (a) => `${ln(a)} L${x(11)} ${y(0)} L${x(0)} ${y(0)}Z`;
  return (
    <svg id="chart" viewBox="0 0 420 210" role="img" aria-label="Inventory trends, units collected and used over 30 days">
      {[0, 50, 100, 150, 200].map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#eceef2" /><text x={L - 6} y={y(v) + 3} textAnchor="end">{v}</text></g>)}
      {["1 Jun", "8 Jun", "15 Jun", "22 Jun", "30 Jun"].map((d, i) => <text key={d} x={L + (i * (W - L - R)) / 4} y={H - 6} textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{d}</text>)}
      <path d={ar(U)} fill="#f4a3ab" opacity=".18" /><path d={ar(C)} fill="#d71a2c" opacity=".18" />
      <path d={ln(U)} fill="none" stroke="#f4a3ab" strokeWidth="2" /><path d={ln(C)} fill="none" stroke="#d71a2c" strokeWidth="2" />
      {C.map((v, i) => <circle key={"c" + i} cx={x(i)} cy={y(v)} r="3" fill="#d71a2c" />)}
      {U.map((v, i) => <circle key={"u" + i} cx={x(i)} cy={y(v)} r="3" fill="#f4a3ab" />)}
    </svg>
  );
}

function Modal({ title, onClose, onSave, children }) {
  return (
    <div className="ov" onClick={onClose}>
      <form className="md" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <h3>{title}</h3><div className="mf">{children}</div>
        <div className="ma"><button type="button" className="btn out" onClick={onClose}>Cancel</button><button className="btn">Save</button></div>
      </form>
    </div>
  );
}

export default function BloodBankDashboard() {
  const { user, logout } = useAuth();
  const [stock, setStockState] = useState(EMPTY_STOCK);
  const [stockReady, setStockReady] = useState(false);
  const [reqs, setReqs] = useStore("bc_blood_requests", SEED_REQ);
  const [xm, setXm] = useStore("bc_crossmatch", SEED_XM);
  const [beds, setBeds] = useStore("bc_hospital_beds", SEED_BEDS);
  const [appts, setAppts] = useStore("bc_appointments", SEED_APPT);
  const [modal, setModal] = useState(null), [draft, setDraft] = useState({}), [msg, setMsg] = useState(""), [q, setQ] = useState("");
  const [view, setView] = useState("dash"), [rf, setRf] = useState("All"), [af, setAf] = useState("All");
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  // Blood stock now comes from the database (backend), not localStorage.
  useEffect(() => {
    let off = false;
    getMyStock()
      .then((d) => { if (!off) { setStockState({ ...EMPTY_STOCK, ...d.stock }); setStockReady(true); } })
      .catch((e) => { if (!off) toast(e.message || "Could not load blood stock"); });
    return () => { off = true; };
  }, []);

  // Saves only the changed groups to the database, then updates the screen.
  const persistStock = async (next) => {
    const changed = GROUPS.filter((g) => (Number(next[g]) || 0) !== (Number(stock[g]) || 0));
    if (!changed.length) return true;
    try {
      await Promise.all(changed.map((g) => setGroupUnits(g, Number(next[g]) || 0)));
      setStockState({ ...stock, ...next });
      return true;
    } catch (e) {
      toast(e.message || "Could not save blood stock");
      return false;
    }
  };

  const own = beds.find((b) => b.id === OWN) || SEED_BEDS[0];
  const total = own.generalTotal + own.icuTotal, avail = own.general + own.icu, occ = total - avail, pct = Math.round((occ / total) * 100);
  // Page 4 (Hospital Beds) er "Blood Support" + Page 10 (Admin) er Hospital Partners er sathe sync
  useEffect(() => {
    if (!stockReady) return;
    const units = GROUPS.reduce((t, g) => t + (Number(stock[g]) || 0), 0);
    const blood = units >= 200 ? "Available" : units > 0 ? "Limited" : "Unavailable";
    syncPartner({ name: HOSP, location: "Chattogram", phone: "031-642100", status: "Active", updatedAt: Date.now() });
    if (own.blood !== blood || !beds.some((b) => b.id === OWN)) {
      const next = { ...own, blood };
      setBeds(beds.some((b) => b.id === OWN) ? beds.map((b) => (b.id === OWN ? next : b)) : [...beds, next]);
    }
  }, [stock, beds, stockReady]);

  const visible = [...reqs].filter((r) => r.status !== "Rejected" && (!q || (r.patientName + r.hospital).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  const approve = (r) => {
    const have = Number(stock[r.bloodGroup]) || 0, need = Number(r.units) || 1;
    setReqs(reqs.map((x) => (x.id === r.id ? { ...x, status: "Approved", approvedBy: HOSP, approvedAt: Date.now() } : x)));
    setXm([...xm, { id: "x" + Date.now(), patient: r.patientName, group: r.bloodGroup, units: Number(r.units) || 1, status: "Pending" }]);
    toast(have < need ? `Approved, kintu ${r.bloodGroup} stock kom (${have} unit)` : "Request approved, cross-match e gelo");
  };
  const xmAct = async (r) => {
    if (r.status === "Pending") { setXm(xm.map((x) => (x.id === r.id ? { ...x, status: "In Progress" } : x))); return toast("Cross-match started"); }
    if (!(await persistStock({ ...stock, [r.group]: Math.max(0, (stock[r.group] || 0) - r.units) }))) return;
    setXm(xm.map((x) => (x.id === r.id ? { ...x, status: "Completed" } : x)));
    toast(`${r.units} unit ${r.group} stock theke kombe gelo`);
  };
  const confirmAppt = (a) => { setAppts(appts.map((x) => (x.id === a.id ? { ...x, status: "Confirmed" } : x))); toast("Appointment confirmed"); };
  const reject = (r) => { setReqs(reqs.map((x) => (x.id === r.id ? { ...x, status: "Rejected" } : x))); toast("Request rejected"); };
  const cancelAppt = (a) => { setAppts(appts.map((x) => (x.id === a.id ? { ...x, status: "Cancelled" } : x))); toast("Appointment cancelled"); };
  const goto = (v) => { setView(v); window.scrollTo({ top: 0 }); };

  // Full lists for the Blood Requests / Donor Appointments pages
  const reqStatus = (r) => r.status || "Pending";
  const needle = q.toLowerCase();
  const allReqs = [...reqs].sort((a, b) => b.createdAt - a.createdAt).filter((r) => !needle || (r.patientName + r.hospital + r.bloodGroup).toLowerCase().includes(needle));
  const shownReqs = allReqs.filter((r) => rf === "All" || reqStatus(r) === rf);
  const allAppts = appts.filter((a) => !needle || (a.name + a.bloodGroup + a.contact).toLowerCase().includes(needle));
  const shownAppts = allAppts.filter((a) => af === "All" || a.status === af);
  const cnt = (list, f, st) => (st === "All" ? list.length : list.filter((x) => f(x) === st).length);

  const openStock = () => { setDraft({ ...stock }); setModal("stock"); };
  const openBeds = () => { setDraft({ general: own.general, icu: own.icu }); setModal("beds"); };
  const saveStock = async () => {
    const s = {}; GROUPS.forEach((g) => (s[g] = Math.max(0, Math.floor(Number(draft[g]) || 0))));
    if (await persistStock(s)) { setModal(null); toast("Blood stock updated"); }
  };
  const saveBeds = () => {
    const general = Math.min(own.generalTotal, Math.max(0, Number(draft.general) || 0)), icu = Math.min(own.icuTotal, Math.max(0, Number(draft.icu) || 0));
    const next = { ...own, general, icu };
    setBeds(beds.some((b) => b.id === OWN) ? beds.map((b) => (b.id === OWN ? next : b)) : [...beds, next]);
    setModal(null); toast("Bed availability updated");
  };
  const quick = [["Update Blood Stock", "db", openStock], ["Approve Blood Request", "doc", () => goto("requests")], ["Manage Hospital Beds", "bed", openBeds], ["View Reports", "report"], ["Manage Donors", "users"], ["Send Notifications", "send"]];

  return (
    <div className="bbd">
      <header className="top">
        <a className="logo" href="/"><span className="drop" />Blood<b>Connect</b></a>
        <label className="search"><Ic n="search" /><input type="search" placeholder="Search donors, requests, hospitals..." aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <button className="bell" aria-label="Notifications"><Ic n="bell" /><em>3</em></button>
        <div className="user"><span className="av" style={{ background: "#c98" }}>{ini(user?.name || "Blood Bank")}</span><div><strong>{user?.name || "Blood Bank Officer"}</strong><small>Blood Bank Officer</small></div></div>
      </header>
      <div className="shell">
        <nav className="side" aria-label="Main">
          {NAV.map(([l, i, href]) => <a key={l} href={href || "#"} className={VIEWS[l] === view ? "on" : ""} onClick={(e) => { if (!href) { e.preventDefault(); if (VIEWS[l]) goto(VIEWS[l]); else if (l === "Blood Inventory") openStock(); else toast(l + " page coming soon"); } }}><Ic n={i} />{l}</a>)}
          <div className="promo"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 40s-14-8-14-18a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 10-14 18-14 18z" fill="#d71a2c" /><path d="M32 22s4 4 4 7a4 4 0 0 1-8 0c0-3 4-7 4-7z" fill="#fff" /><path d="M8 44c6 0 10 4 14 8l10 2 12-4c4-1 8 1 8 4" fill="none" stroke="#e8a77a" strokeWidth="5" strokeLinecap="round" /></svg><strong>Together<span>We Save Lives</span></strong><hr /></div>
          <a href="/login" onClick={logout} style={{ marginTop: 6, color: "var(--red)" }}><Ic n="out" />Logout</a>
        </nav>

        {view === "dash" ? <main className="grid">
          <section className="card inv">
            <div className="ch"><h2><i className="red"><Ic n="drop" /></i>Blood Inventory</h2><button className="pill" onClick={openStock}><Ic n="db" />Update Stock</button></div>
            <div className="tiles">{GROUPS.map((g) => <div key={g} className={"tile" + (g.includes("-") ? " neg" : "")}><div className="t"><svg viewBox="0 0 22 28" aria-hidden="true"><path d="M11 0s11 12 11 19a11 11 0 0 1-22 0C0 12 11 0 11 0z" /></svg><div><span className="g">{g}</span><b>{stock[g] ?? 0}</b><span>Units</span></div></div></div>)}</div>
          </section>

          <section className="card trend">
            <div className="ch"><h2>Inventory Trends <small>(Last 30 Days)</small></h2></div>
            <div className="legend"><span><i className="dot d1" />Units Collected</span><span><i className="dot d2" />Units Used</span></div>
            <Trend />
          </section>

          <section className="card beds">
            <div className="ch"><h2><i className="red"><Ic n="bed" /></i>Hospital Bed Occupancy</h2></div>
            <div className="donutwrap">
              <svg viewBox="0 0 120 120" className="donut" role="img" aria-label={`${pct} percent occupied`}>
                <circle cx="60" cy="60" r="46" fill="none" stroke="#fbc9cd" strokeWidth="16" />
                <circle cx="60" cy="60" r="46" fill="none" stroke="#d71a2c" strokeWidth="16" strokeDasharray={`${(289 * pct) / 100} 289`} transform="rotate(-90 60 60)" />
                <text x="60" y="58" textAnchor="middle" className="big">{pct}%</text><text x="60" y="74" textAnchor="middle" className="sm">Occupied</text>
              </svg>
              <ul className="keys"><li><i className="dot d1" />Occupied<b>{occ}</b></li><li><i className="dot d2" />Available<b>{avail}</b></li><li><i className="dot d3" />Total Beds<b>{total}</b></li></ul>
            </div>
            <a className="manage" onClick={openBeds}><Ic n="bed" />Manage Hospital Beds<Ic n="arrow" /></a>
          </section>

          <section className="card req" id="bb-req">
            <div className="ch"><h2><i className="red"><Ic n="cal" /></i>Incoming Blood Requests</h2><a href="#" className="va" onClick={(e) => { e.preventDefault(); goto("requests"); }}>View All</a></div>
            <ul className="rlist">
              {visible.length === 0 && <li className="empty">Kono request nei</li>}
              {visible.map((r) => <li key={r.id}><div className="bg">{r.bloodGroup}</div><div><strong>{r.patientName}</strong><span className="h">{r.hospital}</span><small>{r.units} Unit{r.units > 1 ? "s" : ""}{r.details ? " • " + r.details : ""}{" • In stock: " + (stock[r.bloodGroup] ?? 0)}</small></div><span className={"tag " + lvl(r.urgency)}>{r.urgency || "Normal"}</span><span className="ago">{ago(r.createdAt)}</span>
                {r.status === "Approved" ? <button className="btn done"><Ic n="check" />Approved</button> : <button className="btn" onClick={() => approve(r)}><Ic n="check" />Approve</button>}</li>)}
            </ul>
          </section>

          <section className="card xm">
            <div className="ch"><h2><i className="red"><Ic n="flask" /></i>Pending Cross-Match</h2><a href="#" className="va">View All</a></div>
            <div className="tw"><table><thead><tr><th>Patient Name</th><th>Blood Group</th><th>Units</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{xm.slice(-6).map((r) => <tr key={r.id}><td>{r.patient}</td><td>{r.group}</td><td>{r.units}</td><td><span className={"tag " + (r.status === "Pending" ? "pending" : r.status === "Completed" ? "ok" : "prog")}>{r.status}</span></td>
                <td>{r.status === "Completed" ? null : <button className={"btn" + (r.status === "Pending" ? "" : " out")} onClick={() => xmAct(r)}>{r.status === "Pending" ? "Process" : "Complete"}</button>}</td></tr>)}</tbody></table></div>
          </section>

          <section className="card appt">
            <div className="ch"><h2><i className="red"><Ic n="cal" /></i>Upcoming Donor Appointments</h2><a href="#" className="va" onClick={(e) => { e.preventDefault(); goto("appts"); }}>View All</a></div>
            <div className="tw"><table><thead><tr><th>Name</th><th>Blood Group</th><th>Date & Time</th><th>Contact</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{appts.slice(0, 4).map((a, i) => <tr key={a.id}><td><span className="nm"><span className="av" style={{ background: colors[i % 6] }}>{ini(a.name)}</span>{a.name}</span></td><td>{a.bloodGroup}</td><td>{a.datetime}</td><td>{a.contact}</td><td><span className={"tag " + (a.status === "Confirmed" ? "ok" : "pending")}>{a.status}</span></td>
                <td>{a.status === "Pending" ? <button className="btn" onClick={() => confirmAppt(a)}>Confirm</button> : <button className="btn out">View</button>}</td></tr>)}</tbody></table></div>
          </section>

          <section className="card qa">
            <div className="ch"><h2><i className="red"><Ic n="gear" /></i>Quick Actions</h2></div>
            <div className="qgrid">{quick.map(([l, i, fn]) => <button key={l} onClick={fn || (() => toast(l + " coming soon"))}><span className="red"><Ic n={i} /></span>{l}</button>)}</div>
          </section>
        </main> : view === "requests" ? (
          <main className="page">
            <section className="card">
              <div className="ch"><h2><i className="red"><Ic n="doc" /></i>Blood Requests</h2><button className="pill" onClick={() => goto("dash")}>Back to Dashboard</button></div>
              <div className="tabs" role="tablist">{["All", "Pending", "Approved", "Rejected"].map((st) => <button key={st} role="tab" aria-selected={rf === st} className={rf === st ? "on" : ""} onClick={() => setRf(st)}>{st}<em>{cnt(allReqs, reqStatus, st)}</em></button>)}</div>
              <ul className="rlist">
                {shownReqs.length === 0 && <li className="empty">Kono request nei</li>}
                {shownReqs.map((r) => <li key={r.id}><div className="bg">{r.bloodGroup}</div><div><strong>{r.patientName}</strong><span className="h">{r.hospital}</span><small>{r.units} Unit{r.units > 1 ? "s" : ""}{r.details ? " • " + r.details : ""}{" • In stock: " + (stock[r.bloodGroup] ?? 0)}</small></div><span className={"tag " + lvl(r.urgency)}>{r.urgency || "Normal"}</span><span className="ago">{ago(r.createdAt)}</span>
                  <div className="acts">{reqStatus(r) === "Approved" ? <button className="btn done"><Ic n="check" />Approved</button> : reqStatus(r) === "Rejected" ? <span className="tag urgent">Rejected</span> : <><button className="btn" onClick={() => approve(r)}><Ic n="check" />Approve</button><button className="btn out" onClick={() => reject(r)}>Reject</button></>}</div></li>)}
              </ul>
            </section>
          </main>
        ) : (
          <main className="page">
            <section className="card">
              <div className="ch"><h2><i className="red"><Ic n="cal" /></i>Donor Appointments</h2><button className="pill" onClick={() => goto("dash")}>Back to Dashboard</button></div>
              <div className="tabs" role="tablist">{["All", "Pending", "Confirmed", "Cancelled"].map((st) => <button key={st} role="tab" aria-selected={af === st} className={af === st ? "on" : ""} onClick={() => setAf(st)}>{st}<em>{cnt(allAppts, (a) => a.status, st)}</em></button>)}</div>
              <div className="tw"><table><thead><tr><th>Name</th><th>Blood Group</th><th>Date & Time</th><th>Contact</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {shownAppts.length === 0 && <tr><td colSpan="6" className="empty">Kono appointment nei</td></tr>}
                  {shownAppts.map((a, i) => <tr key={a.id}><td><span className="nm"><span className="av" style={{ background: colors[i % 6] }}>{ini(a.name)}</span>{a.name}</span></td><td>{a.bloodGroup}</td><td>{a.datetime}</td><td>{a.contact}</td><td><span className={"tag " + (a.status === "Confirmed" ? "ok" : a.status === "Cancelled" ? "urgent" : "pending")}>{a.status}</span></td>
                    <td><div className="acts">{a.status === "Pending" && <button className="btn" onClick={() => confirmAppt(a)}>Confirm</button>}{a.status !== "Cancelled" && <button className="btn out" onClick={() => cancelAppt(a)}>Cancel</button>}</div></td></tr>)}
                </tbody></table></div>
            </section>
          </main>
        )}
      </div>

      {modal === "stock" && <Modal title="Update Blood Stock" onClose={() => setModal(null)} onSave={saveStock}>{GROUPS.map((g) => <label key={g}>{g} (units)<input type="number" min="0" value={draft[g] ?? 0} onChange={(e) => setDraft({ ...draft, [g]: e.target.value })} /></label>)}</Modal>}
      {modal === "beds" && <Modal title="Manage Hospital Beds" onClose={() => setModal(null)} onSave={saveBeds}>
        <label>General beds available (max {own.generalTotal})<input type="number" min="0" max={own.generalTotal} value={draft.general} onChange={(e) => setDraft({ ...draft, general: e.target.value })} /></label>
        <label>ICU beds available (max {own.icuTotal})<input type="number" min="0" max={own.icuTotal} value={draft.icu} onChange={(e) => setDraft({ ...draft, icu: e.target.value })} /></label></Modal>}
      <div className={"toast" + (msg ? " show" : "")} role="status">{msg}</div>
    </div>
  );
}