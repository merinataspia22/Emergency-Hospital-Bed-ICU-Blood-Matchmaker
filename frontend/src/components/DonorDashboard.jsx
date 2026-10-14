import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./DonorDashboard.css";

const requests = [
  { id: 1, group: "A+", title: "A+ blood needed at Chattogram Medical Hospital", units: "2 Units", urgency: "Urgent", time: "2 hours ago" },
  { id: 2, group: "O-", title: "O- blood needed at Aga Khan Hospital", units: "1 Unit", urgency: "Normal", time: "5 hours ago" },
  { id: 3, group: "B+", title: "B+ blood needed at Chittagong General Hospital", units: "3 Units", urgency: "Urgent", time: "1 day ago" }
];

const Icon = ({ name, size = 19 }) => {
  const p = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10h8M8 14h8M8 18h5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    message: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H9l-5 4Z"/><path d="M8 8h8M8 12h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z"/></>,
    drop: <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4 4"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
};
const Brand = () => <Link className="dd-brand" to="/donor-dashboard"><span><Icon name="drop" size={31}/></span><b>BloodConnect</b></Link>;

export default function DonorDashboard() {
  const [available, setAvailable] = useState(true);
  const [removed, setRemoved] = useState([]);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState("Dashboard");
  const nav = [["grid","Dashboard"],["user","My Profile"],["clipboard","Blood Requests"],["calendar","Donation History"],["calendar","Appointments"],["bell","Notifications"],["message","Messages"],["settings","Settings"]];
  const visibleRequests = requests.filter(r => !removed.includes(r.id));
  const selectNav = (label) => { setActive(label); if (label !== "Dashboard") setNotice(`${label} selected`); else setNotice(""); };

  return <div className="dd-shell">
    <aside className="dd-sidebar"><Brand/><nav className="dd-side-nav" aria-label="Donor menu">{nav.map(([icon,label])=><button key={label} className={active===label?"selected":""} onClick={()=>selectNav(label)}><Icon name={icon} size={18}/><span>{label}</span>{label==="Notifications"&&<i>3</i>}</button>)}</nav><Link className="dd-logout" to="/"><span>⇥</span>Logout</Link></aside>
    <main className="dd-main">
      <header className="dd-topbar"><div className="dd-mobile-brand"><Brand/></div><div className="dd-top-actions"><button className="dd-bell" aria-label="Notifications" onClick={()=>setNotice("You have 3 notifications.")}><Icon name="bell" size={20}/><i>3</i></button><div className="dd-user"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Nafisa Alam"/><div><b>Nafisa Alam</b><span>Donor</span></div><span className="dd-chevron">⌄</span></div></div></header>
      <section className="dd-welcome"><div><h1>Welcome Back, Nafisa!</h1><p>Your kindness helps save lives. Thank you for being a BloodConnect donor.</p></div><div className="dd-welcome-art"><span>A Drop<br/>Can Change<br/>A Life</span><div className="dd-welcome-drop"><Icon name="drop" size={65}/></div><i>♡</i><b/></div></section>
      {notice && <div className="dd-notice" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Close">×</button></div>}
      <section className="dd-summary-grid">
        <article className="dd-summary dd-pink"><span className="dd-summary-icon"><Icon name="drop" size={28}/></span><div><small>Total Donations</small><strong>5</strong><p>Last donation:<br/>12 Jun 2025</p></div></article>
        <article className="dd-summary dd-blue"><span className="dd-summary-icon"><Icon name="clipboard" size={25}/></span><div><small>Requests Responded</small><strong>3</strong><p>2 accepted<br/>1 declined</p></div></article>
        <article className="dd-summary dd-yellow"><span className="dd-summary-icon"><Icon name="people" size={28}/></span><div><small>Lives Impacted</small><strong>15+</strong><p>Each donation can<br/>help up to 3 lives</p></div></article>
        <article className="dd-summary dd-green"><span className="dd-summary-icon"><Icon name="calendar" size={27}/></span><div><small>Upcoming Appointment</small><strong className="dd-date">12 Jun 2025</strong><p>City Hospital,<br/>Chattogram</p></div></article>
      </section>
      <section className="dd-content-grid">
        <article className="dd-panel dd-requests-panel"><div className="dd-panel-heading"><h2>Recent Blood Requests</h2><button onClick={()=>{setActive("Blood Requests");setNotice("Showing matching requests from the demo request list.");}}>View All</button></div>
          {visibleRequests.map(r=><div className="dd-request-row" key={r.id}><span className="dd-request-drop"><Icon name="drop" size={27}/></span><div className="dd-request-copy"><b>{r.title}</b><p>{r.units}<span className={r.urgency==="Urgent"?"dd-urgent":"dd-normal"}> · {r.urgency}</span></p></div><time>{r.time}</time><button className={r.urgency==="Urgent"?"dd-accept":"dd-view"} onClick={()=>{if(removed.includes(r.id)){setNotice("You already responded to this request.");}else if(r.urgency==="Urgent"){setRemoved(old=>[...old,r.id]);localStorage.setItem("bc_last_donor_response",JSON.stringify({requestId:r.id,status:"accepted",title:r.title,at:new Date().toISOString()}));setNotice("Request accepted. Recipient response recorded and notification queued.");}else{setNotice(`Request: ${r.title}`);}}}>{r.urgency==="Urgent"?"Accept":"View"} <span>›</span></button></div>)}
        </article>
        <aside className="dd-panel dd-right-panel">
          <div className="dd-panel-heading"><h2>My Availability</h2><button className={`dd-toggle ${available?"on":""}`} onClick={()=>setAvailable(v=>!v)} aria-label="Toggle availability" aria-pressed={available}><span/></button></div><div className="dd-availability-line"><p>Let hospitals know when you can donate.</p><span className={`dd-availability-pill ${available?"":"off"}`}><i/>{available?"Available":"Unavailable"}</span></div>
          <div className="dd-panel-divider"/>
          <div className="dd-panel-heading"><h2>Eligibility Status</h2><span className="dd-eligible"><Icon name="check" size={13}/> Eligible</span></div>
          <div className="dd-detail-line"><span><Icon name="drop" size={14}/>Blood Group</span><b>A+</b></div><div className="dd-detail-line"><span><Icon name="calendar" size={14}/>Last Donation</span><b>12 June 2025</b></div><div className="dd-detail-line"><span><Icon name="calendar" size={14}/>Next Eligible Date</span><b>12 September 2025</b></div>
          <div className="dd-info-box"><Icon name="info" size={18}/><span>You are eligible to donate again in 92 days.</span></div>
          <div className="dd-panel-divider"/>
          <h2 className="dd-quick-title">Quick Actions</h2><div className="dd-quick-actions"><button onClick={()=>setNotice("Update Profile")}><Icon name="user" size={22}/><span>Update<br/>Profile</span></button><Link to="/find-donor"><Icon name="search" size={22}/><span>Find<br/>Requests</span></Link><button onClick={()=>setNotice("Book Appointment")}><Icon name="calendar" size={22}/><span>Book<br/>Appointment</span></button><button onClick={()=>setNotice("Refer a friend")}><Icon name="people" size={22}/><span>Refer<br/>a friend</span></button></div>
        </aside>
        <article className="dd-panel dd-bottom-panel"><div className="dd-panel-heading"><h2>Upcoming Appointments</h2><button onClick={()=>setNotice("Upcoming appointments")}>View All</button></div><div className="dd-appointment"><div className="dd-calendar"><b>12</b><span>JUN</span></div><div className="dd-appointment-info"><b>City Hospital, Chattogram</b><p><Icon name="clock" size={13}/>10:00 AM - 11:00 AM</p><p><Icon name="pin" size={13}/>Hathazari, Chattogram</p></div><button onClick={()=>setNotice("Reschedule appointment")}>Reschedule</button></div></article>
        <article className="dd-panel dd-bottom-panel"><div className="dd-panel-heading"><h2>Donation History</h2><button onClick={()=>setNotice("Donation history")}>View All</button></div>{[["12 Jun 2025","A+","City Hospital"],["15 Feb 2025","A+","City Hospital"],["10 Oct 2024","A+","Aga Khan Hospital"]].map((r,i)=><div className="dd-history-row" key={i}><span>{r[0]}</span><b>{r[1]}</b><span>{r[2]}</span><em><Icon name="check" size={11}/> Completed</em></div>)}</article>
        <article className="dd-panel dd-bottom-panel"><div className="dd-panel-heading"><h2>Recent Notifications</h2><button onClick={()=>{setActive("Notifications");setNotice("Recent notifications");}}>View All</button></div><div className="dd-notification"><span className="dd-notif-icon"><Icon name="heart" size={17}/></span><div><b>Your donation helped 3 patients!</b><p>Thank you for making a difference.</p><small>2 hours ago</small></div></div><div className="dd-notification"><span className="dd-notif-icon"><Icon name="calendar" size={17}/></span><div><b>Upcoming donation appointment</b><p>12 Jun 2025 at City Hospital, Chattogram</p><small>1 day ago</small></div></div><div className="dd-notification"><span className="dd-notif-icon"><Icon name="people" size={17}/></span><div><b>New blood request matches your profile</b><p>A+ blood needed at Chattogram Medical Hospital</p><small>2 days ago</small></div></div></article>
      </section>
    </main>
  </div>;
}
