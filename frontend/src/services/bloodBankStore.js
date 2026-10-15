// Shared localStorage layer (backend ashle eikhane API call boshabe).
// KEYS (team er shobai same key use korbe):
//  bc_blood_requests    -> Page 3 (Request Blood) push kore; Page 9 approve kore; Page 8 status dekhay
//  bc_blood_stock       -> Page 9 update kore
//  bc_hospital_beds     -> Page 9 update kore (general, icu, blood support); Page 4 (Hospital Beds) read kore
//  bc_appointments      -> Page 7 (Donor Dashboard) push kore; Page 9 confirm kore
//  bc_hospital_partners -> Page 9 sync kore (public info only: name, location, phone, status); Page 3 Nearby Blood Banks + Page 10 (Admin) read kore
//  bc_crossmatch        -> Page 9 internal
import { useState, useEffect } from "react";

export const read = (key, seed) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : seed; } catch { return seed; }
};

export function useStore(key, seed) {
  const [v, setV] = useState(() => read(key, seed));
  useEffect(() => {
    const f = (e) => { if (e.key === key) setV(read(key, seed)); };
    window.addEventListener("storage", f);
    return () => window.removeEventListener("storage", f);
  }, [key]);
  const set = (n) => {
    try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
    setV(n);
  };
  return [v, set];
}

export function syncPartner(p) {
  const k = "bc_hospital_partners", l = read(k, []);
  const i = l.findIndex((x) => x.name === p.name);
  const n = i < 0 ? [...l, p] : l.map((x, j) => (j === i ? { ...x, ...p } : x));
  try { localStorage.setItem(k, JSON.stringify(n)); } catch {}
}