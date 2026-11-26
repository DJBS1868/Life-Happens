const P = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none"/>',
  school: '<path d="M2.5 9.2 12 4l9.5 5.2L12 14.4 2.5 9.2Z"/><path d="M6 11.2v4.2c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8v-4.2"/><path d="M21 9.5v5"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18M10.5 12.5v2h3v-2"/>',
  home: '<path d="m3.5 10.8 8.5-7 8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  heart: '<path d="M20.4 5.7a5.1 5.1 0 0 0-7.2 0L12 6.9l-1.2-1.2a5.1 5.1 0 1 0-7.2 7.2L12 21l8.4-8.1a5.1 5.1 0 0 0 0-7.2Z"/>',
  heartFilled: '<path d="M20.4 5.7a5.1 5.1 0 0 0-7.2 0L12 6.9l-1.2-1.2a5.1 5.1 0 1 0-7.2 7.2L12 21l8.4-8.1a5.1 5.1 0 0 0 0-7.2Z" fill="currentColor" stroke="none"/>',
  dots: '<circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  chevronLeft: '<path d="m15 5-7 7 7 7"/>',
  chevronDown: '<path d="m5 9 7 7 7-7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M14.8 9.5c-.6-1-1.6-1.5-2.8-1.5-1.7 0-2.8.9-2.8 2.2 0 1.4 1.2 1.9 2.8 2.2 1.7.3 2.8.8 2.8 2.2 0 1.4-1.2 2.2-2.9 2.2-1.4 0-2.5-.5-3.1-1.6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none"/>',
  arrowLeft: '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5A3.5 3.5 0 0 1 16.5 11"/><path d="M12 13v4M8 21h8M9.5 17h5"/>',
  star: '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z"/>',
  starFilled: '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z" fill="currentColor" stroke="none"/>',
  warning: '<path d="M12 4 2.8 20h18.4L12 4Z"/><path d="M12 9.5v5"/><circle cx="12" cy="17.4" r=".9" fill="currentColor" stroke="none"/>',
  volume: '<path d="M4 9.5h3l4-3.5v12l-4-3.5H4Z"/><path d="M15 8.5a5 5 0 0 1 0 7M17.7 6a8.5 8.5 0 0 1 0 12"/>',
  vibrate: '<rect x="7.5" y="3.5" width="9" height="17" rx="2.5"/><path d="M4 9v6M20 9v6M2 11v2M22 11v2"/>',
  trash: '<path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M6.5 7l.8 13h9.4l.8-13M10 11v5M14 11v5"/>',
  save: '<path d="M5 4h11l3 3v13H5V4Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.4c2 .8 3.5 2.8 3.5 5.6"/>',
  baby: '<circle cx="12" cy="9" r="5"/><path d="M10 8.5h.01M14 8.5h.01M10.5 11c.5.7 1 1 1.5 1s1-.3 1.5-1"/><path d="M6 21c.5-4 2.8-6 6-6s5.5 2 6 6"/>',
  ring: '<circle cx="12" cy="14.5" r="6.5"/><path d="m8 7 4-4 4 4-4 3.5L8 7Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
  sparkle: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="M19 16.5 19.7 19l2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.5Z"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M7 16v-4M11 16V8M15 16v-6M19 16V6"/>',
  bank: '<path d="m3 9 9-5 9 5H3Z"/><path d="M5 9v8M9 9v8M15 9v8M19 9v8M3 20h18"/>',
  car: '<path d="m4 12 1.5-4.5A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.5L20 12"/><path d="M3 12h18v5H3v-5Z"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',
  plane: '<path d="M21 4 3 11l7 2 2 7 3-6 6-10Z"/><path d="m10 13 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2"/><circle cx="9" cy="9.5" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="9.5" r=".9" fill="currentColor" stroke="none"/>',
  brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6A3 3 0 0 0 8 18a3 3 0 0 0 4 2.5V4.5A3 3 0 0 0 9.5 4Z"/><path d="M14.5 4a3 3 0 0 1 3 3 3 3 0 0 1 1.5 5.6A3 3 0 0 1 16 18a3 3 0 0 1-4 2.5V4.5A3 3 0 0 1 14.5 4Z"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="12" rx="2"/><path d="M3.5 12.5h17M12 8.5V21"/><path d="M12 8.5C10 8.5 7 8 7 5.8 7 4.2 8.2 3.5 9.3 3.5c1.8 0 2.7 2.3 2.7 5ZM12 8.5c2 0 5-.5 5-2.7 0-1.6-1.2-2.3-2.3-2.3-1.8 0-2.7 2.3-2.7 5Z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  mapPin: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  logout: '<path d="M14 4H5v16h9M10 12h11M17 8l4 4-4 4"/>',
  refresh: '<path d="M20 7v5h-5"/><path d="M19.2 12a7.5 7.5 0 1 0-1.6 5.4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>',
  dot: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
  more: '<path d="M4 7h16M4 12h16M4 17h10"/>'
};

export function icon(name, size = 24, cls = "") {
  const p = P[name] || P.dot;
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

export function logoMark(size = 30) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 5C13.5 5 5 11.5 5 21c0 5.3 3.1 9.5 8.3 12.4L11 43l10-5.2c1 .1 2 .2 3 .2 10.5 0 19-6.5 19-16S34.5 5 24 5Z" fill="#fff"/>
    <path d="M31.2 14.8a5 5 0 0 0-7 0L24 15l-.2-.2a5 5 0 1 0-7 7L24 29l7.2-7.2a5 5 0 0 0 0-7Z" fill="#e8241c"/>
  </svg>`;
}
