import { SKIN_TONES, HAIR_COLORS, HAIR_STYLES, EYE_COLORS, CLOTHES, rand, randInt, chance } from './data.js';

let uidCounter = 0;
function uid() { return 'a' + (++uidCounter); }

export function randomAvatar(gender = 'female') {
  return {
    skin: randInt(0, SKIN_TONES.length - 1),
    hair: randInt(0, HAIR_STYLES.length - 1),
    hairColor: randInt(0, HAIR_COLORS.length - 1),
    eye: randInt(0, EYE_COLORS.length - 1),
    facialHair: gender === 'male' ? rand(['none', 'none', 'none', 'stache', 'goatee', 'beard']) : 'none',
    glasses: chance(0.14),
    freckles: chance(0.22),
    earrings: gender === 'female' ? chance(0.55) : false,
    clothes: randInt(0, CLOTHES.length - 1),
    gender,
  };
}

export function shade(hex, amt = -18) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function mix(hex, target, t = 0.5) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(target.slice(1), 16);
  const k = Math.max(0, Math.min(1, t));
  const r = Math.round(((a >> 16) & 255) * (1 - k) + ((b >> 16) & 255) * k);
  const g = Math.round(((a >> 8) & 255) * (1 - k) + ((b >> 8) & 255) * k);
  const bl = Math.round((a & 255) * (1 - k) + (b & 255) * k);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}

function babyHair(hair, hi) {
  return `<g fill="${hair}">
    <path d="M49 26 C51 15 66 13 71 23 C65 18 56 18 49 26 Z"/>
    <path d="M58 14 C60 8 66 7 69 11 C65 11 62 13 60 17 Z"/>
  </g><path d="M53 18 C56 13 63 12 67 16" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
}

function wrinklesFor(age, skin) {
  if (age == null || age < 45) return '';
  const t = Math.min(1, (age - 45) / 40);
  const stroke = shade(skin.shade, -16);
  return `<g fill="none" stroke="${stroke}" stroke-linecap="round" opacity="${(0.18 + t * 0.34).toFixed(2)}">
    <path d="M45 40.5 Q51.5 38.4 58 40.5" stroke-width="1"/>
    <path d="M62 40.5 Q68.5 38.4 75 40.5" stroke-width="1"/>
    ${age >= 58 ? '<path d="M45 44 Q51.5 42.2 58 44" stroke-width=".9"/><path d="M62 44 Q68.5 42.2 75 44" stroke-width=".9"/>' : ''}
    <path d="M39 54 Q36.6 56.4 39.2 58.8" stroke-width=".9"/>
    <path d="M81 54 Q83.4 56.4 80.8 58.8" stroke-width=".9"/>
    <path d="M51.5 68.6 Q53.6 74 51.4 77.6" stroke-width="1"/>
    <path d="M68.5 68.6 Q66.4 74 68.6 77.6" stroke-width="1"/>
  </g>`;
}

function ageSpotsFor(age, skin) {
  if (age == null || age < 64) return '';
  return `<g fill="${shade(skin.shade, -18)}" opacity=".32">
    <circle cx="40.5" cy="62" r="1.25"/><circle cx="45" cy="48.5" r=".9"/>
    <circle cx="78.5" cy="64" r="1.1"/><circle cx="74" cy="47.5" r="1"/>
    <circle cx="43" cy="71" r=".8"/><circle cx="76.5" cy="70.5" r=".8"/>
  </g>`;
}

function hairBack(style, hair, hi) {
  switch (style) {
    case 4: // long
      return `<path d="M29 50 C29 22 42 12 60 12 C78 12 91 22 91 50 L94 90 C94 97 86 98 83 91 L80 48 C74 38 46 38 40 48 L37 91 C34 98 26 97 26 90 Z" fill="${hair}"/><path d="M37 48 C38 38 46 33 52 33 L52 82 C46 82 40 78 38 70 Z" fill="${hi}" opacity=".25"/>`;
    case 5: // bob
      return `<path d="M30 50 C30 24 42 14 60 14 C78 14 90 24 90 50 L90 71 C90 79 82 81 79 72 L78 46 C72 37 48 37 42 46 L41 72 C38 81 30 79 30 71 Z" fill="${hair}"/>`;
    case 6: // ponytail
      return `<ellipse cx="93" cy="66" rx="10" ry="17" fill="${hair}"/><ellipse cx="91" cy="52" rx="7" ry="6" fill="${hi}" opacity=".3"/><rect x="84" y="47" width="8" height="5" rx="2.5" fill="#d8a94a"/>`;
    case 3: // afro
      return `<circle cx="60" cy="35" r="31" fill="${hair}"/><circle cx="33" cy="52" r="10" fill="${hair}"/><circle cx="87" cy="52" r="10" fill="${hair}"/>`;
    case 9: // bun
      return `<circle cx="60" cy="13" r="11" fill="${hair}"/><rect x="53" y="20" width="14" height="5" rx="2.5" fill="${hi}" opacity=".5"/>`;
    default:
      return '';
  }
}

function hairFront(style, hair, hi) {
  switch (style) {
    case 0:
      return `<path d="M32 51 C31 29 43 16 60 16 C77 16 89 29 88 51 C86 38 78 31 68 30 C60 29 55 33 48 31 C40 29 35 38 32 51 Z" fill="${hair}"/>
        <path d="M33 50 C35 40 40 35 46 33 C42 40 40 46 39 53 Z" fill="${hi}" opacity=".28"/>
        <path d="M32 50 C31 56 32 61 33 64 L36 64 C35 59 35 54 36 49 Z" fill="${hair}"/>
        <path d="M88 50 C89 56 88 61 87 64 L84 64 C85 59 85 54 84 49 Z" fill="${hair}"/>`;
    case 1:
      return `<path d="M33 49 C33 28 44 18 60 18 C76 18 87 28 87 49 C84 37 74 31 60 31 C46 31 36 37 33 49 Z" fill="${hair}" opacity=".92"/>
        <path d="M38 39 C44 33 51 31 60 31 C69 31 76 33 82 39 C74 35 66 34 60 34 C54 34 46 35 38 39 Z" fill="${hi}" opacity=".25"/>`;
    case 2:
      return `<g fill="${hair}">
        <circle cx="36" cy="45" r="8"/><circle cx="38" cy="33" r="9"/><circle cx="48" cy="25" r="10"/>
        <circle cx="60" cy="21" r="11"/><circle cx="72" cy="25" r="10"/><circle cx="82" cy="33" r="9"/>
        <circle cx="84" cy="45" r="8"/><circle cx="45" cy="34" r="8"/><circle cx="60" cy="31" r="9"/><circle cx="75" cy="34" r="8"/>
      </g><g fill="${hi}" opacity=".25"><circle cx="46" cy="24" r="4"/><circle cx="63" cy="20" r="4"/><circle cx="77" cy="28" r="3.5"/></g>`;
    case 3:
      return `<path d="M31 47 C32 29 45 20 60 20 C75 20 88 29 89 47 C84 36 74 32 60 32 C46 32 36 36 31 47 Z" fill="${hair}"/>
        <path d="M40 27 C47 22 53 20 60 20 C67 20 73 22 80 27 C72 24 66 23 60 23 C54 23 48 24 40 27 Z" fill="${hi}" opacity=".22"/>`;
    case 4:
      return `<path d="M31 48 C32 28 44 17 60 17 C76 17 88 28 89 48 C86 36 78 30 68 31 C60 32 56 36 47 33 C39 31 34 38 31 48 Z" fill="${hair}"/>
        <path d="M34 45 C38 34 46 29 54 29 C48 34 44 40 42 49 Z" fill="${hi}" opacity=".24"/>`;
    case 5:
      return `<path d="M31 49 C31 27 43 15 60 15 C77 15 89 27 89 49 C85 37 76 31 66 32 C58 33 54 38 46 34 C39 31 34 38 31 49 Z" fill="${hair}"/>
        <path d="M35 44 C39 34 47 30 54 30 C48 35 45 41 43 49 Z" fill="${hi}" opacity=".24"/>`;
    case 6:
      return `<path d="M32 49 C31 28 43 16 60 16 C77 16 89 28 88 49 C86 37 77 30 67 31 C59 32 55 36 47 33 C39 30 35 38 32 49 Z" fill="${hair}"/>
        <path d="M34 45 C38 35 45 31 52 31 C46 36 43 42 41 50 Z" fill="${hi}" opacity=".22"/>`;
    case 7:
      return `<ellipse cx="47" cy="25" rx="11" ry="5" fill="#fff" opacity=".10"/>`;
    case 8:
      return `<path d="M51 14 C54 10 66 10 69 14 L74 36 C67 31 53 31 46 36 Z" fill="${hair}"/>
        <path d="M54 14 L58 32 C56 31 53 31 50 32 Z" fill="${hi}" opacity=".35"/>
        <path d="M34 48 C34 30 45 22 60 22 C75 22 86 30 86 48 C83 37 73 33 60 33 C47 33 37 37 34 48 Z" fill="${hair}" opacity=".22"/>`;
    case 9:
      return `<path d="M32 50 C31 29 43 16 60 16 C77 16 89 29 88 50 C86 38 78 32 68 31 C60 30 55 34 48 31 C40 29 35 38 32 50 Z" fill="${hair}"/>
        <path d="M35 45 C39 35 46 31 53 31 C47 36 44 42 42 50 Z" fill="${hi}" opacity=".22"/>`;
    case 10:
      return `<path d="M31 50 C31 28 44 15 60 15 C76 15 89 28 89 50 C86 40 81 37 76 39 C71 41 70 32 64 33 C58 34 58 40 52 39 C45 38 44 34 38 39 C35 42 33 45 31 50 Z" fill="${hair}"/>
        <path d="M35 45 C40 35 46 31 53 31 C47 36 44 42 42 50 Z" fill="${hi}" opacity=".2"/>`;
    default:
      return '';
  }
}

export function avatarSVG(a, opts = {}) {
  const age = Number.isFinite(opts.age) ? opts.age : null;
  const skin = SKIN_TONES[a.skin] || SKIN_TONES[0];
  const hair = HAIR_COLORS[a.hairColor] || HAIR_COLORS[0];
  const eye = EYE_COLORS[a.eye] || EYE_COLORS[0];
  const clothes = CLOTHES[a.clothes] || CLOTHES[0];
  const id = uid();
  const hue = (a.skin * 47 + a.hairColor * 29 + 180) % 360;
  const bg1 = `hsl(${hue} 26% 26%)`;
  const bg2 = `hsl(${(hue + 34) % 360} 30% 16%)`;
  const gid = 'g' + id;

  // Age shapes the character: babies have a wisp of hair, children lose the
  // beard, adults keep their chosen look, and elders gray and wrinkle.
  const gray = age == null ? 0 : age < 42 ? 0 : Math.min(1, (age - 42) / 38);
  const hairBase = gray ? mix(hair.base, '#c3c7cc', gray) : hair.base;
  const hairHi = gray ? mix(hair.hi, '#f0f2f4', gray) : hair.hi;
  const isBaby = age != null && age < 3;
  const isChild = age != null && age < 13;
  const beard = isChild ? 'none' : a.facialHair;
  const browColor = shade(hairBase, -8);

  const eyebrows = `<path d="M42 45.5 Q48.5 42 55 45.5" fill="none" stroke="${browColor}" stroke-width="${isBaby ? 1.5 : 2.7}" stroke-linecap="round" opacity="${isBaby ? .55 : 1}"/>
    <path d="M65 45.5 Q71.5 42 78 45.5" fill="none" stroke="${browColor}" stroke-width="${isBaby ? 1.5 : 2.7}" stroke-linecap="round" opacity="${isBaby ? .55 : 1}"/>`;

  const eyes = `<g>
      <ellipse cx="48.5" cy="56" rx="5.6" ry="6.1" fill="#fff"/>
      <ellipse cx="71.5" cy="56" rx="5.6" ry="6.1" fill="#fff"/>
      <circle cx="49.2" cy="56.4" r="3.15" fill="${eye.base}"/>
      <circle cx="72.2" cy="56.4" r="3.15" fill="${eye.base}"/>
      <circle cx="49.2" cy="56.4" r="1.55" fill="#120c08"/>
      <circle cx="72.2" cy="56.4" r="1.55" fill="#120c08"/>
      <circle cx="50.4" cy="55.1" r="1.05" fill="#fff"/>
      <circle cx="73.4" cy="55.1" r="1.05" fill="#fff"/>
      <path d="M42.9 53.2 Q48.5 50.2 54.1 53.2" fill="none" stroke="${skin.shade}" stroke-width="1.3" opacity=".8"/>
      <path d="M65.9 53.2 Q71.5 50.2 77.1 53.2" fill="none" stroke="${skin.shade}" stroke-width="1.3" opacity=".8"/>
    </g>`;

  const nose = `<path d="M60.5 58.5 Q58.6 64.6 61.8 66.2" fill="none" stroke="${shade(skin.shade, -8)}" stroke-width="2" stroke-linecap="round"/>
    <path d="M58.6 66.1 Q61 67.4 63.4 66.1" fill="none" stroke="${shade(skin.shade, -8)}" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>`;

  const mouth = a.gender === 'female'
    ? `<path d="M50.5 73.4 Q60 69.8 69.5 73.4 Q60 82.4 50.5 73.4 Z" fill="#a74a4c"/>
       <path d="M53 73.8 Q60 76.6 67 73.8" fill="none" stroke="#7d3336" stroke-width="1.2" opacity=".7"/>
       <path d="M55 76.2 Q60 79.2 65 76.2" fill="none" stroke="#e79a96" stroke-width="1.1" opacity=".6"/>`
    : `<path d="M51 73.5 Q60 80.6 69 73.5" fill="none" stroke="#8a4038" stroke-width="2.7" stroke-linecap="round"/>
       <path d="M53.5 74.3 Q60 78.8 66.5 74.3" fill="none" stroke="#fff" stroke-width="1.3" opacity=".55"/>`;

  const facial = (() => {
    if (beard === 'stache') return `<path d="M49 70.4 Q54.5 66.6 60 69.4 Q65.5 66.6 71 70.4 Q65.5 72.5 60 70.8 Q54.5 72.5 49 70.4 Z" fill="${hairBase}"/>`;
    if (beard === 'goatee') return `<path d="M49 70.4 Q54.5 66.6 60 69.4 Q65.5 66.6 71 70.4 Q65.5 72.5 60 70.8 Q54.5 72.5 49 70.4 Z" fill="${hairBase}"/>
      <path d="M53.5 80 Q60 83.4 66.5 80 Q65.5 88 60 89 Q54.5 88 53.5 80 Z" fill="${hairBase}"/>`;
    if (beard === 'beard') return `<path d="M33 55 C33 78 44 91 60 91 C76 91 87 78 87 55 C84 71 75 80 60 80 C45 80 36 71 33 55 Z" fill="${hairBase}"/>
      <path d="M49 70.4 Q54.5 66.6 60 69.4 Q65.5 66.6 71 70.4 Q65.5 72.5 60 70.8 Q54.5 72.5 49 70.4 Z" fill="${hairBase}"/>`;
    return '';
  })();

  const glasses = a.glasses ? `<g fill="rgba(255,255,255,.12)" stroke="#2a2d31" stroke-width="2.1">
      <rect x="38.8" y="49.4" width="19.4" height="13.6" rx="5.2"/>
      <rect x="61.8" y="49.4" width="19.4" height="13.6" rx="5.2"/>
      <path d="M58.2 55.6 Q60 54.4 61.8 55.6" fill="none"/>
      <path d="M38.8 54.4 L33.8 52.6" fill="none" stroke-linecap="round"/>
      <path d="M81.2 54.4 L86.2 52.6" fill="none" stroke-linecap="round"/>
    </g>` : '';

  const freckles = a.freckles ? `<g fill="${shade(skin.shade, -12)}" opacity=".55">
      <circle cx="43" cy="66" r=".8"/><circle cx="46.5" cy="67.6" r=".8"/><circle cx="40.5" cy="68.3" r=".7"/>
      <circle cx="76.5" cy="66" r=".8"/><circle cx="73.5" cy="67.8" r=".8"/><circle cx="79" cy="68.3" r=".7"/>
    </g>` : '';

  const earrings = a.earrings ? `<circle cx="33.8" cy="65" r="2.1" fill="#ffd34d" stroke="#a87b00" stroke-width=".7"/>
    <circle cx="86.2" cy="65" r="2.1" fill="#ffd34d" stroke="#a87b00" stroke-width=".7"/>` : '';

  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Character avatar">
    <defs>
      <radialGradient id="${gid}" cx="35%" cy="24%" r="90%">
        <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
      </radialGradient>
    </defs>
    <rect width="120" height="120" fill="url(#${gid})"/>
    <circle cx="60" cy="60" r="60" fill="none"/>
    ${isBaby ? babyHair(hairBase, hairHi) : hairBack(a.hair, hairBase, hairHi)}
    <path d="M15 122 C17 102 30 90 47 87 L73 87 C90 90 103 102 105 122 Z" fill="${clothes}"/>
    <path d="M47 87 C50 95 55 100 60 100 C65 100 70 95 73 87 L67 87 C65 91 62 94 60 94 C58 94 55 91 53 87 Z" fill="${shade(clothes, 18)}"/>
    <path d="M51 76 L51 88 C51 93 56 96 60 96 C64 96 69 93 69 88 L69 76 Z" fill="${skin.shade}"/>
    <path d="M51 79 C55 84 65 84 69 79 L69 76 L51 76 Z" fill="${shade(skin.shade, -8)}" opacity=".55"/>
    <ellipse cx="34.5" cy="59" rx="5.6" ry="7" fill="${skin.base}"/>
    <ellipse cx="85.5" cy="59" rx="5.6" ry="7" fill="${skin.base}"/>
    <ellipse cx="34.5" cy="59" rx="2.4" ry="3.4" fill="${skin.shade}"/>
    <ellipse cx="85.5" cy="59" rx="2.4" ry="3.4" fill="${skin.shade}"/>
    <path d="M60 17 C78 17 89 31 89 52 C89 74 77 88 60 88 C43 88 31 74 31 52 C31 31 42 17 60 17 Z" fill="${skin.base}"/>
    <path d="M60 17 C69 17 76 20 81 27 C75 24 69 22 62 22 C50 22 40 27 34 36 C36 26 46 17 60 17 Z" fill="${skin.light}" opacity=".35"/>
    <ellipse cx="43" cy="67" rx="5.4" ry="3.2" fill="#e8836f" opacity="${isBaby ? .3 : .18}"/>
    <ellipse cx="77" cy="67" rx="5.4" ry="3.2" fill="#e8836f" opacity="${isBaby ? .3 : .18}"/>
    ${isBaby ? '' : hairFront(a.hair, hairBase, hairHi)}
    ${eyebrows}
    ${eyes}
    ${nose}
    ${mouth}
    ${facial}
    ${wrinklesFor(age, skin)}
    ${glasses}
    ${freckles}
    ${ageSpotsFor(age, skin)}
    ${earrings}
    <path d="M60 19 C56 19 52 21 49 24" fill="none" stroke="${skin.light}" stroke-width="2" opacity=".18" stroke-linecap="round"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Flags — tiny vector flags so they render identically on every device
// ---------------------------------------------------------------------------
export function flagSVG(code) {
  const wrap = inner => `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">${inner}</svg>`;
  const h = (...c) => c.map((col, i) => `<rect y="${(20 / c.length) * i}" width="30" height="${20 / c.length + .2}" fill="${col}"/>`).join('');
  const v = (...c) => c.map((col, i) => `<rect x="${(30 / c.length) * i}" width="${30 / c.length + .2}" height="20" fill="${col}"/>`).join('');
  const star = (x, y, r = 1.2, fill = '#fff') => `<polygon points="${Array.from({ length: 10 }, (_, i) => {
    const ang = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * .45 : r;
    return `${x + Math.cos(ang) * rr},${y + Math.sin(ang) * rr}`;
  }).join(' ')}" fill="${fill}"/>`;
  switch (code) {
    case 'US': {
      let s = '';
      for (let i = 0; i < 13; i++) s += `<rect y="${i * 20 / 13}" width="30" height="${20 / 13 + .1}" fill="${i % 2 ? '#fff' : '#b22234'}"/>`;
      s += `<rect width="13" height="${20 * 7 / 13}" fill="#3c3b6e"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) s += `<circle cx="${1.5 + c * 2.5 + (r % 2) * 1.25}" cy="${1.4 + r * 2.2}" r=".62" fill="#fff"/>`;
      return wrap(s);
    }
    case 'GB':
      return wrap(`<rect width="30" height="20" fill="#012169"/>
        <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" stroke-width="4"/>
        <path d="M0 0 L30 20 M30 0 L0 20" stroke="#c8102e" stroke-width="1.7"/>
        <path d="M15 0 V20 M0 10 H30" stroke="#fff" stroke-width="6"/>
        <path d="M15 0 V20 M0 10 H30" stroke="#c8102e" stroke-width="3.4"/>`);
    case 'CA':
      return wrap(`<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#d52b1e"/><rect x="22.5" width="7.5" height="20" fill="#d52b1e"/>
        <path d="M15 4.2 L16.2 7.1 L19.2 6.2 L17.6 8.8 L20.4 9.4 L17.3 10.6 L18.4 12.4 L15.9 11.9 L16.2 15.2 L15 13.6 L13.8 15.2 L14.1 11.9 L11.6 12.4 L12.7 10.6 L9.6 9.4 L12.4 8.8 L10.8 6.2 L13.8 7.1 Z" fill="#d52b1e"/>`);
    case 'AU':
      return wrap(`<rect width="30" height="20" fill="#012169"/>
        <path d="M0 0 L13 8 M13 0 L0 8" stroke="#fff" stroke-width="2.4"/><path d="M6.5 0 V8 M0 4 H13" stroke="#fff" stroke-width="3.4"/><path d="M6.5 0 V8 M0 4 H13" stroke="#c8102e" stroke-width="1.7"/>
        ${star(6.5, 14.5, 1.4)}${star(21, 5, 1.1)}${star(25, 10, 1)}${star(20, 15.5, 1.1)}${star(25.5, 17, .9)}`);
    case 'DE': return wrap(h('#000', '#dd0000', '#ffce00'));
    case 'FR': return wrap(v('#002395', '#fff', '#ed2939'));
    case 'ES': return wrap(`<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>`);
    case 'IT': return wrap(v('#009246', '#fff', '#ce2b37'));
    case 'NL': return wrap(h('#ae1c28', '#fff', '#21468b'));
    case 'SE': return wrap(`<rect width="30" height="20" fill="#006aa7"/><path d="M10 0 V20 M0 10 H30" stroke="#fecc00" stroke-width="4"/>`);
    case 'NO': return wrap(`<rect width="30" height="20" fill="#ba0c2f"/><path d="M10 0 V20 M0 10 H30" stroke="#fff" stroke-width="5"/><path d="M10 0 V20 M0 10 H30" stroke="#00205b" stroke-width="2.6"/>`);
    case 'CH': return wrap(`<rect width="30" height="20" fill="#d52b1e"/><path d="M13 5 H17 V8.5 H20.5 V12.5 H17 V16 H13 V12.5 H9.5 V8.5 H13 Z" fill="#fff"/>`);
    case 'JP': return wrap(`<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.4" fill="#bc002d"/>`);
    case 'KR':
      return wrap(`<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="4.4" fill="#cd2e3a"/><path d="M15 5.6 A4.4 4.4 0 0 0 15 14.4 A2.2 2.2 0 0 0 15 10 A2.2 2.2 0 0 1 15 5.6" fill="#0047a0"/>
        <g stroke="#111" stroke-width=".8"><path d="M5.2 5.6 L8 4.4 M5.2 5.6 L8 4.4 M6.4 8 L9.2 6.8 M6.4 8 L9.2 6.8"/></g>`);
    case 'IN':
      return wrap(`<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#ff9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/><circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".8"/><circle cx="15" cy="10" r=".5" fill="#000080"/>`);
    case 'BR':
      return wrap(`<rect width="30" height="20" fill="#009c3b"/><path d="M15 3 L27 10 L15 17 L3 10 Z" fill="#ffdf00"/><circle cx="15" cy="10" r="3.4" fill="#002776"/><path d="M11.8 9.2 Q15 11.8 18.2 8.6" stroke="#fff" stroke-width=".8" fill="none"/>`);
    case 'MX':
      return wrap(`<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#006847"/><rect x="20" width="10" height="20" fill="#ce1126"/><circle cx="15" cy="10" r="2" fill="#8a5a2b"/>`);
    case 'NG': return wrap(v('#008751', '#fff', '#008751'));
    case 'ZA':
      return wrap(`<rect width="30" height="20" fill="#007a4d"/><rect width="30" height="7.5" fill="#de3831"/><rect y="12.5" width="30" height="7.5" fill="#002395"/><path d="M0 0 L14 10 L0 20 Z" fill="#000"/><path d="M0 2.5 L11 10 L0 17.5" stroke="#ffb612" stroke-width="2.2" fill="none"/><path d="M0 5 L8 10 L0 15" stroke="#fff" stroke-width="2" fill="none"/>`);
    case 'PH':
      return wrap(`<rect width="30" height="10" fill="#0038a8"/><rect y="10" width="30" height="10" fill="#ce1126"/><path d="M0 0 L13 10 L0 20 Z" fill="#fff"/><circle cx="4.2" cy="10" r="1.5" fill="#fcd116"/>`);
    case 'SG':
      return wrap(`<rect width="30" height="10" fill="#ed2939"/><rect y="10" width="30" height="10" fill="#fff"/><path d="M9 4.2 A3.4 3.4 0 1 0 9 9.4 A2.6 2.6 0 1 1 9 4.2" fill="#fff"/><g fill="#fff">${star(11.5, 4.6, .7)}${star(13.3, 6.4, .7)}${star(11.5, 8.2, .7)}${star(9.7, 6.4, .7)}</g>`);
    case 'EG':
      return wrap(`<rect width="30" height="6.67" fill="#ce1126"/><rect y="6.67" width="30" height="6.66" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#000"/><path d="M15 8.3 L16 10.6 L18 10.6 L16.5 12 L17 14 L15 12.8 L13 14 L13.5 12 L12 10.6 L14 10.6 Z" fill="#c09300"/>`);
    default:
      return wrap(`<rect width="30" height="20" fill="#46515c"/><text x="15" y="14" font-size="9" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">${code}</text>`);
  }
}

export function flagFor(country) { return flagSVG(country.code); }
