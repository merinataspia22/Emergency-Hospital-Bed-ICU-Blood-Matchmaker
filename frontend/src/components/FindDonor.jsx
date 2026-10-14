import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./FindDonor.css";

const donors = [
  { id: 1, name: "Tawhid Hasan", group: "A+", location: "Pahartali, Chattogram", area: "Pahartali", last: "3 months ago", distance: 2.1, available: true, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
  { id: 2, name: "Nafisa Alam", group: "O+", location: "Hathazari, Chattogram", area: "Hathazari", last: "1 month ago", distance: 4.3, available: true, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
  { id: 3, name: "Arif Hossain", group: "B+", location: "Chattogram Medical, Chattogram", area: "Chattogram Medical", last: "5 months ago", distance: 5.8, available: true, photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80" },
  { id: 4, name: "Sadia Rahman", group: "A-", location: "Pahartali, Chattogram", area: "Pahartali", last: "2 months ago", distance: 3.4, available: true, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" },
  { id: 5, name: "Minhaj Uddin", group: "O+", location: "Halishahar, Chattogram", area: "Halishahar", last: "4 months ago", distance: 7.2, available: true, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" }
];

const Icon = ({ name, size = 18 }) => {
  const paths = {
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4 4"/></>,
    phone: <path d="M7 3H4.5a1.5 1.5 0 0 0-1.5 1.7A16.5 16.5 0 0 0 19.3 21a1.5 1.5 0 0 0 1.7-1.5V17l-4.6-2-1.8 2.2a13 13 0 0 1-5.8-5.8L11 9.6 9 5Z"/>,
    message: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H9l-5 4Z"/><path d="M8 8h8M8 12h6"/></>,
    siren: <><path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4 17h16v3H4zM12 1v2M3.5 5 5 6.5M20.5 5 19 6.5M2 11h2M20 11h2"/><path d="m12 7-2 4h3l-1 3 3-5h-3z"/></>,
    drop: <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h3M7 17h6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function Brand() {
  return <Link className="fd-brand" to="/" aria-label="BloodConnect home"><span className="fd-brand-mark"><Icon name="drop" size={31}/></span><span><b>Blood</b>Connect</span></Link>;
}

export default function FindDonor() {
  const [group, setGroup] = useState("A+");
  const [location, setLocation] = useState("Chattogram");
  const [area, setArea] = useState("Pahartali");
  const [distance, setDistance] = useState("10");
  const [availability, setAvailability] = useState("yes");
  const [sort, setSort] = useState("nearest");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [donorAvailable, setDonorAvailable] = useState(() => {
    const saved = localStorage.getItem("bc_donor_available");
    return saved === null ? true : saved === "true";
  });
  useEffect(() => {
    const syncAvailability = () => {
      const saved = localStorage.getItem("bc_donor_available");
      setDonorAvailable(saved === null ? true : saved === "true");
    };
    window.addEventListener("focus", syncAvailability);
    window.addEventListener("storage", syncAvailability);
    return () => {
      window.removeEventListener("focus", syncAvailability);
      window.removeEventListener("storage", syncAvailability);
    };
  }, []);

  const filtered = useMemo(() => {
    // Match the reference: the initial list shows donors; filters apply after Search Donors.
    const f = appliedFilters || { group: "All", area: "All areas", distance: "100", availability: "any", location: "Chattogram" };
    let list = donors.filter(d => (f.group === "All" || d.group === f.group) &&
      (f.area === "All areas" || d.area === f.area) && d.distance <= Number(f.distance) &&
      (f.availability === "any" || (f.availability === "yes" ? d.available : !d.available)));
    if (sort === "nearest") list = [...list].sort((a,b) => a.distance-b.distance);
    if (sort === "group") list = [...list].sort((a,b) => a.group.localeCompare(b.group));
    return f.location === "Chattogram" ? list : [];
  }, [appliedFilters, sort, donorAvailable]);

  return <div className="fd-page">
    <header className="fd-navbar">
      <Brand />
      <nav className="fd-navlinks"><Link to="/">Home</Link><Link to="/#about">About</Link><Link className="active" to="/find-donor">Find Donor</Link><Link to="/request-blood">Request Blood</Link><Link to="/hospital-beds">Hospital Beds</Link><Link to="/#contact">Contact</Link></nav>
      <div className="fd-nav-actions"><button className="fd-search-circle" aria-label="Search"><Icon name="search" size={18}/></button><Link className="fd-login" to="/login">Login</Link><Link className="fd-signup" to="/register">Sign Up</Link></div>
    </header>

    <main className="fd-layout">
      <div className="fd-main-column">
        <section className="fd-hero">
          <div className="fd-hero-copy"><h1>Find Blood Donors</h1><p>Search for verified blood donors near you and help save lives.</p></div>
          <div className="fd-hero-art" aria-hidden="true"><span className="fd-heart">♥</span><span className="fd-large-drop"><Icon name="drop" size={78}/></span><span className="fd-outline-heart">♡</span><i /></div>
        </section>

        <section className="fd-filter-card" aria-label="Find donors filters">
          <label>Blood Group<select value={group} onChange={e=>setGroup(e.target.value)}>{["A+","A-","B+","B-","AB+","AB-","O+","O-","All"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Location<select value={location} onChange={e=>setLocation(e.target.value)}>{["Chattogram","Dhaka","Sylhet","Rajshahi"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Area / District<select value={area} onChange={e=>setArea(e.target.value)}>{["Pahartali","Hathazari","Chattogram Medical","Halishahar","All areas"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Distance<select value={distance} onChange={e=>setDistance(e.target.value)}><option value="5">Within 5 km</option><option value="10">Within 10 km</option><option value="25">Within 25 km</option><option value="100">Any distance</option></select></label>
          <label>Availability<select value={availability} onChange={e=>setAvailability(e.target.value)}><option value="yes">Available Now</option><option value="no">Unavailable</option><option value="any">Any Status</option></select></label>
          <button className="fd-primary-btn" onClick={()=>setAppliedFilters({ group, location, area, distance, availability })}><Icon name="search" size={16}/> Search Donors</button>
        </section>

        <section className="fd-donor-card">
          <div className="fd-section-heading"><div className="fd-title-count"><h2>Available Donors</h2><span>{appliedFilters ? filtered.length : 24} found</span></div><label className="fd-sort">Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="nearest">Nearest First</option><option value="group">Blood Group</option></select></label></div>
          {filtered.map(d => <article className="fd-donor-row" key={d.id}>
            <div className="fd-avatar"><img src={d.photo} alt=""/><span><Icon name="check" size={10}/></span></div>
            <div className="fd-donor-info"><div className="fd-donor-name">{d.name}<span className="fd-blood-tag">{d.group}</span></div><p><Icon name="pin" size={13}/>{d.location}</p><p><Icon name="calendar" size={13}/>Last donation: {d.last}</p></div>
            <span className={`fd-status ${d.available ? "" : "fd-status-off"}`}><i/>{d.available ? "Available Now" : "Unavailable"}</span>
            <div className="fd-row-actions"><a href="tel:+8801700000000" aria-label="Call donor"><Icon name="phone" size={18}/></a><a href="mailto:donor@example.com" aria-label="Message donor"><Icon name="message" size={18}/></a><button onClick={()=>{ if (localStorage.getItem("bc_logged_in") !== "true") { window.alert("Please log in to contact a donor."); window.location.href = "/login"; } else { window.location.href = `mailto:donor@example.com?subject=${encodeURIComponent(`BloodConnect contact request for ${d.name}`)}`; } }}>Contact</button></div>
          </article>)}
          {filtered.length === 0 && <div className="fd-empty">No donors found for these filters. Try another blood group or area.</div>}
        </section>
      </div>

      <aside className="fd-side-column">
        <section className="fd-side-card fd-urgent-card"><div className="fd-urgent-top"><span className="fd-side-icon"><Icon name="siren" size={28}/></span><div><h3>Need Urgent Blood?</h3><p>Use filters to find available donors near your location quickly.</p></div></div><div className="fd-emergency"><span className="fd-phone-circle"><Icon name="phone" size={20}/></span><div><small>In a life-threatening situation?</small><strong>Call Emergency: 1664</strong></div></div></section>
        <section className="fd-side-card fd-map-card"><div className="fd-side-title"><span className="fd-pin-icon"><Icon name="pin" size={25}/></span><h3>Donor Locations</h3><button onClick={()=>{setLocation("Chattogram");setArea("All areas");setAppliedFilters({group:"All",location:"Chattogram",area:"All areas",distance:"100",availability:"any"});}}>View Map</button></div><div className="fd-map-art"><div className="fd-map-water"/><div className="fd-map-road fd-road-a"/><div className="fd-map-road fd-road-b"/><div className="fd-map-road fd-road-c"/><span className="fd-map-label label-chattogram">Chattogram</span><span className="fd-map-label label-pahartali">Pahartali</span><span className="fd-map-label label-hathazari">Hathazari</span><span className="fd-map-pin pin-a"><Icon name="pin" size={25}/></span><span className="fd-map-pin pin-b"><Icon name="pin" size={25}/></span><span className="fd-map-pin pin-c"><Icon name="pin" size={25}/></span><span className="fd-map-pin pin-d"><Icon name="pin" size={25}/></span><div className="fd-map-popup"><img src={donors[1].photo} alt=""/><span><b>Nafisa Alam</b><small>A+ · Available</small></span></div></div></section>
      </aside>
    </main>
  </div>;
}
