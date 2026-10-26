import React, { useEffect, useMemo, useRef, useState } from "react";
import { getDonorContact, searchDonors, sendMessage } from "../services/donorApi.js";
import "./FindDonor.css";

const EMERGENCY_NUMBER = "1664"; // emergency helpline er number ekhane bodlano jay

/* ---------- place -> lat/lng (donor er city text theke approximate pin) ---------- */
const PLACES = {
  chattogram: [22.3569, 91.7832], pahartali: [22.383, 91.799], hathazari: [22.4967, 91.8085],
  halishahar: [22.3306, 91.7819], "chattogram medical": [22.3591, 91.8319], khulshi: [22.3592, 91.8113],
  panchlaish: [22.3637, 91.8183], agrabad: [22.3235, 91.8113], kotwali: [22.336, 91.834],
  bakalia: [22.36, 91.848], chandgaon: [22.3828, 91.8537], anderkilla: [22.3376, 91.8344],
  dhaka: [23.8103, 90.4125], sylhet: [24.8949, 91.8687], rajshahi: [24.3745, 88.6042], habiganj: [24.3749, 91.4155]
};
const CTG = ["chattogram", "pahartali", "hathazari", "halishahar", "chattogram medical", "khulshi", "panchlaish", "agrabad", "kotwali", "bakalia", "chandgaon", "anderkilla"];
const LOCATION_PLACES = { Chattogram: CTG, Dhaka: ["dhaka"], Sylhet: ["sylhet"], Rajshahi: ["rajshahi"] };
const PLACE_KEYS = Object.keys(PLACES).sort((a, b) => b.length - a.length);
const DEFAULT_FILTERS = { group: "All", location: "Chattogram", area: "All areas", distance: "100", availability: "any" };

const findPlace = (text = "") => { const t = text.toLowerCase(); return PLACE_KEYS.find((k) => t.includes(k)) || null; };
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const coordsFor = (d) => {
  const key = findPlace(d.city);
  if (!key) return null;
  const h = hash(d.id); // same donor sob somoy same jaygay thake, pin overlap kore na
  return [PLACES[key][0] + ((h % 100) / 100 - 0.5) * 0.02, PLACES[key][1] + (((h >> 7) % 100) / 100 - 0.5) * 0.02];
};
const km = (a, b) => {
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};
const lastText = (iso) => {
  if (!iso) return "No donation yet";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};
const initialsAvatar = (name = "?") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#ffe3e7"/><text x="60" y="78" font-family="Arial" font-size="52" font-weight="700" text-anchor="middle" fill="#c90a28">${(name.trim()[0] || "?").toUpperCase().replace(/[<>&]/g, "")}</text></svg>`)}`;

/* ---------- Leaflet (CDN theke load hoy, tai package.json e kichu add korte hoy na) ---------- */
let leafletPromise;
const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      js.onload = () => resolve(window.L); js.onerror = () => { leafletPromise = null; reject(new Error("Map failed to load")); };
      document.head.appendChild(js);
    });
  }
  return leafletPromise;
};
const PIN_SVG = '<svg width="25" height="25" viewBox="0 0 24 24" fill="#d20a2a" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2" fill="#fff"/></svg>';
const pinIcon = (L, exact) =>
  L.divIcon({ className: `fd-leaflet-pin${exact ? "" : " fd-pin-approx"}`, html: PIN_SVG, iconSize: [25, 25], iconAnchor: [12, 24], popupAnchor: [0, -22] });
const popupEl = (d, userPos) => {
  const box = document.createElement("div"); box.className = "fd-pop";
  const img = document.createElement("img"); img.src = d.photo; img.alt = "";
  const wrap = document.createElement("span");
  const b = document.createElement("b"); b.textContent = d.name;
  const s1 = document.createElement("small"); s1.textContent = `${d.group} · ${d.available ? "Available" : "Unavailable"}`;
  const s2 = document.createElement("small"); s2.className = "fd-pop-loc"; s2.textContent = d.exact ? "Exact location" : "Approximate area";
  wrap.append(b, s1, s2);
  if (userPos && d.coords) {
    const s3 = document.createElement("small"); s3.className = "fd-pop-loc"; s3.textContent = `${km(userPos, d.coords).toFixed(1)} km away`;
    wrap.append(s3);
  }
  if (d.coords) {
    const a = document.createElement("a"); a.className = "fd-pop-link"; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.href = `https://www.google.com/maps/dir/?api=1&destination=${d.coords[0]},${d.coords[1]}`; a.textContent = "Get directions";
    wrap.append(a);
  }
  box.append(img, wrap);
  return box;
};

/* ---------- boro map (View Map button) ---------- */
function BigMap({ rows, userPos, onLocate, onClose }) {
  const el = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    let map, cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current).setView(PLACES.chattogram, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(map);
      const pts = [];
      rows.forEach((d) => {
        if (!d.coords) return;
        L.marker(d.coords, { icon: pinIcon(L, d.exact) }).bindPopup(popupEl(d, userPos)).addTo(map);
        pts.push(d.coords);
      });
      if (userPos) {
        L.circleMarker(userPos, { radius: 8, color: "#fff", weight: 2, fillColor: "#1a73e8", fillOpacity: 1 }).bindPopup("You are here").addTo(map);
        pts.push(userPos);
      }
      if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
      setTimeout(() => map.invalidateSize(), 100);
    }).catch(() => {});
    return () => { cancelled = true; if (map) map.remove(); };
  }, [rows, userPos]);
  const count = rows.filter((d) => d.coords).length;
  return <div className="fd-bigmap-overlay" onClick={onClose}>
    <div className="fd-bigmap" role="dialog" aria-modal="true" aria-label="Donor locations map" onClick={(e) => e.stopPropagation()}>
      <div className="fd-bigmap-head">
        <h3>Donor Locations</h3><span>{count} on map</span>
        <div className="fd-bigmap-actions"><button className="fd-bigmap-btn" onClick={onLocate}>{userPos ? "Update my location" : "Use my location"}</button><button className="fd-bigmap-close" onClick={onClose} aria-label="Close map">×</button></div>
      </div>
      <div ref={el} className="fd-bigmap-canvas" />
    </div>
  </div>;
}

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

export default function FindDonor() {
  const [group, setGroup] = useState("A+");
  const [location, setLocation] = useState("Chattogram");
  const [area, setArea] = useState("Pahartali");
  const [distance, setDistance] = useState("10");
  const [availability, setAvailability] = useState("yes");
  const [sort, setSort] = useState("nearest");
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [bigMap, setBigMap] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  /* ---------- backend: donor list ---------- */
  useEffect(() => {
    let alive = true;
    const f = appliedFilters;
    setLoading(true); setError("");
    searchDonors({
      bloodGroup: f.group === "All" ? "" : f.group,
      city: f.area === "All areas" ? "" : f.area,
      available: f.availability === "yes" ? "true" : f.availability === "no" ? "false" : "all",
      limit: 50
    })
      .then((r) => { if (alive) setDonors(r.donors); })
      .catch((e) => { if (alive) { setError(e.message); setDonors([]); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [appliedFilters]);

  const rows = useMemo(() => {
    const f = appliedFilters;
    const places = LOCATION_PLACES[f.location] || [];
    const origin = userPos || PLACES[places[0]];
    let list = donors.map((d) => {
      const exact = d.lat != null && d.lng != null;
      const coords = exact ? [d.lat, d.lng] : coordsFor(d);
      return { exact, id: d.id, name: d.name, group: d.bloodGroup, location: d.city || "Location not set", city: d.city, available: d.isAvailable, last: lastText(d.lastDonationDate), photo: d.avatar || initialsAvatar(d.name), coords, dist: coords && origin ? km(origin, coords) : null };
    });
    list = list.filter((d) => places.includes(findPlace(d.city)));
    if (f.distance !== "100") list = list.filter((d) => d.dist !== null && d.dist <= Number(f.distance));
    if (sort === "nearest") list = [...list].sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9));
    if (sort === "group") list = [...list].sort((a, b) => a.group.localeCompare(b.group));
    return list;
  }, [donors, appliedFilters, sort, userPos]);

  /* ---------- map ---------- */
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView(PLACES.chattogram, 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
      setMapReady(true);
    }).catch(() => { if (!cancelled) setMapFailed(true); });
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; setMapReady(false); } };
  }, []);

  useEffect(() => {
    const L = window.L, map = mapRef.current, layer = layerRef.current;
    if (!mapReady || !L || !map || !layer) return;
    layer.clearLayers();
    const pts = [];
    rows.forEach((d) => {
      if (!d.coords) return;
      L.marker(d.coords, { icon: pinIcon(L, d.exact) }).bindPopup(popupEl(d, userPos)).addTo(layer);
      pts.push(d.coords);
    });
    if (pts.length) map.fitBounds(pts, { padding: [30, 30], maxZoom: 13 });
    else map.setView(PLACES.chattogram, 11);
  }, [rows, mapReady, userPos]);

  const locateMe = () => {
    if (!navigator.geolocation) return window.alert("Your browser does not support location.");
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => window.alert("Could not get your location. Please allow location access in the browser."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ---------- contact / message ---------- */
  const loggedIn = () => localStorage.getItem("bc_logged_in") === "true";
  const needLogin = () => { window.alert("Please log in to contact a donor."); window.location.href = "/login"; };

  const callDonor = async (e, d) => {
    e.preventDefault();
    if (!loggedIn()) return needLogin();
    try {
      const c = await getDonorContact(d.id);
      if (!c.phone) throw new Error("This donor has not added a phone number.");
      window.location.href = `tel:${c.phone}`;
    } catch (err) { window.alert(err.message); }
  };
  const openModal = (e, d, mode) => {
    e?.preventDefault();
    if (!loggedIn()) return needLogin();
    setModal({ donor: d, mode, contact: null, cerr: "", text: "", note: "", busy: false });
    if (mode === "contact") {
      getDonorContact(d.id)
        .then((c) => setModal((m) => m && { ...m, contact: c }))
        .catch((err) => setModal((m) => m && { ...m, cerr: err.message }));
    }
  };
  const submitMessage = async () => {
    const text = modal.text.trim();
    if (!text) return setModal((m) => ({ ...m, note: "Write a message first." }));
    setModal((m) => ({ ...m, busy: true, note: "" }));
    try {
      await sendMessage(modal.donor.id, text);
      setModal((m) => ({ ...m, busy: false, text: "", note: "Message sent. The donor will see it in their dashboard." }));
    } catch (err) { setModal((m) => ({ ...m, busy: false, note: err.message })); }
  };

  return <div className="fd-page">
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
          <div className="fd-section-heading"><div className="fd-title-count"><h2>Available Donors</h2><span>{loading ? "Loading..." : `${rows.length} found`}</span></div><label className="fd-sort">Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="nearest">Nearest First</option><option value="group">Blood Group</option></select></label></div>
          {rows.map(d => <article className="fd-donor-row" key={d.id}>
            <div className="fd-avatar"><img src={d.photo} alt=""/><span><Icon name="check" size={10}/></span></div>
            <div className="fd-donor-info"><div className="fd-donor-name">{d.name}<span className="fd-blood-tag">{d.group}</span></div><p><Icon name="pin" size={13}/>{d.location}</p><p><Icon name="calendar" size={13}/>Last donation: {d.last}</p></div>
            <span className={`fd-status ${d.available ? "" : "fd-status-off"}`}><i/>{d.available ? "Available Now" : "Unavailable"}</span>
            <div className="fd-row-actions"><a href="#" onClick={(e)=>callDonor(e, d)} aria-label="Call donor"><Icon name="phone" size={18}/></a><a href="#" onClick={(e)=>openModal(e, d, "message")} aria-label="Message donor"><Icon name="message" size={18}/></a><button onClick={()=>openModal(null, d, "contact")}>Contact</button></div>
          </article>)}
          {!loading && rows.length === 0 && <div className="fd-empty">{error || "No donors found for these filters. Try another blood group or area."}</div>}
        </section>
      </div>

      <aside className="fd-side-column">
        <section className="fd-side-card fd-urgent-card"><div className="fd-urgent-top"><span className="fd-side-icon"><Icon name="siren" size={28}/></span><div><h3>Need Urgent Blood?</h3><p>Use filters to find available donors near your location quickly.</p></div></div><a className="fd-emergency" href={`tel:${EMERGENCY_NUMBER}`}><span className="fd-phone-circle"><Icon name="phone" size={20}/></span><div><small>In a life-threatening situation?</small><strong>Call Emergency: {EMERGENCY_NUMBER}</strong></div></a></section>
        <section className="fd-side-card fd-map-card"><div className="fd-side-title"><span className="fd-pin-icon"><Icon name="pin" size={25}/></span><h3>Donor Locations</h3><button onClick={()=>setBigMap(true)}>View Map</button></div><div className="fd-map-art fd-live"><div ref={mapEl} className="fd-leaflet" />{mapFailed && <div className="fd-map-fail">Map could not load. Check your internet connection.</div>}</div></section>
      </aside>
    </main>

    {bigMap && <BigMap rows={rows} userPos={userPos} onLocate={locateMe} onClose={() => setBigMap(false)} />}

    {modal && <div className="fd-modal-overlay" onClick={() => setModal(null)}>
      <div className="fd-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{modal.mode === "contact" ? "Contact" : "Message"} {modal.donor.name}</h3>
        {modal.mode === "contact" && <div className="fd-modal-contact">
          {modal.cerr ? <p className="fd-modal-err">{modal.cerr}</p>
            : modal.contact ? <><p><b>Phone:</b> {modal.contact.phone || "Not provided"}</p><p><b>City:</b> {modal.contact.city || "-"}</p>{modal.contact.phone && <a className="fd-modal-call" href={`tel:${modal.contact.phone}`}>Call now</a>}</>
            : <p>Loading contact...</p>}
        </div>}
        <textarea value={modal.text} maxLength={1000} placeholder="Write a message to this donor" onChange={(e) => setModal((m) => ({ ...m, text: e.target.value }))} />
        {modal.note && <p className="fd-modal-note">{modal.note}</p>}
        <div className="fd-modal-actions"><button className="fd-modal-cancel" onClick={() => setModal(null)}>Close</button><button className="fd-primary-btn" disabled={modal.busy} onClick={submitMessage}>{modal.busy ? "Sending..." : "Send message"}</button></div>
      </div>
    </div>}
  </div>;
}