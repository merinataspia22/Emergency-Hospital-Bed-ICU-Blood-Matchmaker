import React from 'react';

const shapes = {
  droplet: <path d="M12 2C8 7 5 11 5 15a7 7 0 0 0 14 0c0-4-3-8-7-13Z" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m8.5 12 2.5 2.5 4.7-5"/></>,
  siren: <><path d="M5 17h14M7 17v-6a5 5 0 0 1 10 0v6M4 21h16M12 1v2M3.5 4.5 5 6M20.5 4.5 19 6"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM17 6a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/></>,
  hospital: <><path d="M4 22V5h16v17M9 22v-5h6v5M10 9h4M12 7v4M7 14h2M15 14h2"/></>,
  inventory: <><path d="M7 4h10v17H7zM9 2h6M10 9h4M12 7v4M10 16h4"/></>,
  clipboard: <><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M5 5 19 19M19 5 5 19" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  check: <path d="m4 12 5 5L20 6" />,
  phone: <path d="M4 3h4l2 5-2.5 2a17 17 0 0 0 6.5 6.5L16 14l5 2v4c0 1-1 2-2 2C9 22 2 15 2 5c0-1 1-2 2-2Z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></>,
  map: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  play: <path d="m9 6 10 6-10 6V6Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
  spark: <path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z" />,
  lock: <><rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
};
export default function Icon({ name = 'heart', size = 22, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.heart}</svg>;
}
