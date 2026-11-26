export const SKIN_TONES = ["#f8d9c0", "#efc19f", "#e0a97d", "#c98b5f", "#a9683f", "#8a4f2d", "#6b3a22", "#4a2818"];
export const HAIR_STYLES = ["short", "fade", "bob", "long", "curly", "bun", "ponytail", "bald"];
export const HAIR_COLORS = ["#241812", "#3d2618", "#5a3822", "#7b4a2a", "#a56b3c", "#c9975a", "#1b1b1f", "#8c3b2a", "#b8b2a8", "#6a4b8a"];
export const EYE_COLORS = ["#3b2a20", "#3f6b4f", "#3b6ea5", "#6b8fa8", "#7a5a3a", "#4a4a4a"];
export const OUTFIT_COLORS = ["#2e86ab", "#e4572e", "#6a4c93", "#2a9d8f", "#e9c46a", "#3d5a80", "#c9184a", "#495057", "#8ac926", "#ff8fab"];
export const BACKGROUNDS = ["#dff3ee", "#e7ecff", "#ffe8ef", "#fff2d9", "#e8f5df", "#f0e7ff", "#e4f1f8", "#ffe9d6"];

export function randomAppearance(gender = "female") {
  const femme = gender === "female";
  const styles = femme
    ? ["bob", "long", "curly", "bun", "ponytail", "short"]
    : ["short", "fade", "curly", "bald", "short", "fade"];
  return {
    skin: pick(SKIN_TONES),
    hair: pick(styles),
    hairColor: pick(HAIR_COLORS),
    eyes: pick(EYE_COLORS),
    outfit: pick(OUTFIT_COLORS),
    bg: pick(BACKGROUNDS),
    glasses: Math.random() < 0.14,
    beard: !femme && Math.random() < 0.22
  };
}

function pick(a) {
  return a[Math.floor(Math.random() * a.length)];
}

let uid = 0;

export function avatarSVG(app = {}, opts = {}) {
  const size = opts.size || 80;
  const a = {
    skin: app.skin || SKIN_TONES[1],
    hair: app.hair || "short",
    hairColor: app.hairColor || HAIR_COLORS[1],
    eyes: app.eyes || EYE_COLORS[0],
    outfit: app.outfit || OUTFIT_COLORS[0],
    bg: app.bg || BACKGROUNDS[0],
    glasses: !!app.glasses,
    beard: !!app.beard
  };
  const id = `av${++uid}`;
  const mood = opts.mood || "happy";
  const dead = opts.dead;
  const ring = opts.ring;
  const mouth = mood === "sad"
    ? `<path d="M52 73 Q60 67 68 73" fill="none" stroke="#7a3b32" stroke-width="2.2" stroke-linecap="round"/>`
    : mood === "neutral"
      ? `<path d="M53 72 L67 72" fill="none" stroke="#7a3b32" stroke-width="2.2" stroke-linecap="round"/>`
      : `<path d="M52 70 Q60 78 68 70" fill="none" stroke="#7a3b32" stroke-width="2.2" stroke-linecap="round"/>`;

  const hairBack = hairBackSVG(a);
  const hairFront = hairFrontSVG(a);
  const glasses = a.glasses ? `
    <g fill="none" stroke="#3a3a3a" stroke-width="1.6">
      <rect x="42" y="51" width="15" height="11" rx="4"/>
      <rect x="63" y="51" width="15" height="11" rx="4"/>
      <path d="M57 56 L63 56"/>
      <path d="M42 55 L37 53"/>
      <path d="M78 55 L83 53"/>
    </g>` : "";
  const beard = a.beard ? `
    <path d="M40 63 Q42 82 60 84 Q78 82 80 63 Q76 74 60 76 Q44 74 40 63 Z" fill="${a.hairColor}" opacity="0.9"/>
    <path d="M50 70 Q60 74 70 70" fill="none" stroke="#5c3227" stroke-width="1.2" opacity="0.5"/>` : "";

  return `<svg class="avatar-svg" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Character avatar" style="display:block">
    <defs>
      <clipPath id="${id}clip"><circle cx="60" cy="60" r="60"/></clipPath>
      <radialGradient id="${id}bg" cx="35%" cy="25%" r="85%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="${a.bg}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}shirt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${lighten(a.outfit, 12)}"/>
        <stop offset="100%" stop-color="${a.outfit}"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#${id}clip)" ${dead ? 'filter="grayscale(1)" opacity="0.85"' : ""}>
      <rect width="120" height="120" fill="${a.bg}"/>
      <rect width="120" height="120" fill="url(#${id}bg)"/>
      <circle cx="18" cy="22" r="14" fill="#ffffff" opacity="0.22"/>
      <circle cx="104" cy="34" r="20" fill="#ffffff" opacity="0.16"/>
      <circle cx="92" cy="10" r="7" fill="#ffffff" opacity="0.25"/>
      ${hairBack}
      <path d="M15 121 C17 99 33 87 60 87 C87 87 103 99 105 121 Z" fill="url(#${id}shirt)"/>
      <path d="M46 87 Q60 100 74 87 L78 92 Q60 108 42 92 Z" fill="#ffffff" opacity="0.22"/>
      <rect x="53" y="74" width="14" height="17" rx="6" fill="${darken(a.skin, 8)}"/>
      <circle cx="35" cy="57" r="5" fill="${a.skin}"/>
      <circle cx="85" cy="57" r="5" fill="${a.skin}"/>
      <path d="M36 48 C36 29 46 21 60 21 C74 21 84 29 84 48 L84 57 C84 73 73 84 60 84 C47 84 36 73 36 57 Z" fill="${a.skin}"/>
      <path d="M36 56 C38 74 48 84 60 84 C72 84 82 74 84 56 C82 69 73 77 60 77 C47 77 38 69 36 56 Z" fill="${darken(a.skin, 7)}" opacity="0.5"/>
      <ellipse cx="44" cy="66" rx="5.5" ry="3.2" fill="#e8756a" opacity="0.22"/>
      <ellipse cx="76" cy="66" rx="5.5" ry="3.2" fill="#e8756a" opacity="0.22"/>
      <g>
        <ellipse cx="50" cy="55" rx="5.4" ry="4.5" fill="#ffffff"/>
        <ellipse cx="70" cy="55" rx="5.4" ry="4.5" fill="#ffffff"/>
        <circle cx="50.5" cy="55.2" r="2.9" fill="${a.eyes}"/>
        <circle cx="70.5" cy="55.2" r="2.9" fill="${a.eyes}"/>
        <circle cx="50.5" cy="55.2" r="1.3" fill="#151515"/>
        <circle cx="70.5" cy="55.2" r="1.3" fill="#151515"/>
        <circle cx="51.6" cy="54" r="0.9" fill="#ffffff"/>
        <circle cx="71.6" cy="54" r="0.9" fill="#ffffff"/>
      </g>
      <path d="M44 48 Q50 45 56 48" fill="none" stroke="${darken(a.hairColor, 6)}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M64 48 Q70 45 76 48" fill="none" stroke="${darken(a.hairColor, 6)}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M59 57 Q57 63 59 64 Q61 65 63 63" fill="none" stroke="${darken(a.skin, 18)}" stroke-width="1.5" stroke-linecap="round"/>
      ${mouth}
      ${beard}
      ${hairFront}
      ${glasses}
    </g>
    ${ring ? `<circle cx="60" cy="60" r="57.5" fill="none" stroke="${ring}" stroke-width="3"/>` : ""}
  </svg>`;
}

function hairBackSVG(a) {
  switch (a.hair) {
    case "long":
      return `<path d="M29 47 C27 22 43 13 60 13 C77 13 93 22 91 47 L94 96 C88 104 80 107 74 103 L70 70 L50 70 L46 103 C40 107 32 104 26 96 Z" fill="${a.hairColor}"/>`;
    case "bob":
      return `<path d="M31 46 C29 23 44 14 60 14 C76 14 91 23 89 46 L90 73 C90 81 84 85 80 80 L78 62 L42 62 L40 80 C36 85 30 81 30 73 Z" fill="${a.hairColor}"/>`;
    case "curly":
      return `<g fill="${a.hairColor}">
        <circle cx="36" cy="35" r="10"/><circle cx="46" cy="24" r="11"/><circle cx="60" cy="19" r="12"/>
        <circle cx="74" cy="24" r="11"/><circle cx="84" cy="35" r="10"/><circle cx="88" cy="48" r="9"/>
        <circle cx="32" cy="48" r="9"/><circle cx="34" cy="60" r="8"/><circle cx="86" cy="60" r="8"/>
      </g>`;
    case "bun":
      return `<circle cx="60" cy="14" r="9" fill="${a.hairColor}"/><path d="M33 47 C32 26 45 18 60 18 C75 18 88 26 87 47 L88 56 L32 56 Z" fill="${a.hairColor}"/>`;
    case "ponytail":
      return `<path d="M84 36 C98 40 103 54 99 70 C97 80 90 85 85 82 C92 68 91 54 82 47 Z" fill="${a.hairColor}"/><path d="M31 47 C29 25 44 15 60 15 C76 15 91 25 89 47 L90 57 L30 57 Z" fill="${a.hairColor}"/>`;
    case "bald":
      return `<path d="M34 48 C34 42 36 38 39 35 L39 52 L35 58 Z M86 48 C86 42 84 38 81 35 L81 52 L85 58 Z" fill="${a.hairColor}" opacity="0.8"/>`;
    default:
      return "";
  }
}

function hairFrontSVG(a) {
  switch (a.hair) {
    case "short":
      return `<path d="M35 49 C33 27 45 18 60 18 C75 18 87 27 85 49 C82 36 73 30 60 30 C47 30 38 36 35 49 Z" fill="${a.hairColor}"/>
        <path d="M35 46 L38 64 L42 62 L39 44 Z M85 46 L82 64 L78 62 L81 44 Z" fill="${a.hairColor}"/>`;
    case "fade":
      return `<path d="M37 45 C36 29 46 21 60 21 C74 21 84 29 83 45 C80 35 72 31 60 31 C48 31 40 35 37 45 Z" fill="${a.hairColor}"/>
        <path d="M37 42 L37 48 L40 46 Z M83 42 L83 48 L80 46 Z" fill="${a.hairColor}"/>`;
    case "bob":
      return `<path d="M34 47 C33 28 45 20 60 20 C75 20 87 28 86 47 C82 36 73 32 60 32 C47 32 38 36 34 47 Z" fill="${a.hairColor}"/>
        <path d="M36 46 C44 40 50 40 58 42 L57 33 C48 33 40 38 36 46 Z" fill="${lighten(a.hairColor, 8)}"/>`;
    case "long":
      return `<path d="M33 47 C31 25 45 16 60 16 C75 16 89 25 87 47 C82 36 73 32 60 32 C47 32 38 36 33 47 Z" fill="${a.hairColor}"/>
        <path d="M36 44 C43 40 50 41 57 43 L55 34 C47 34 40 38 36 44 Z" fill="${lighten(a.hairColor, 7)}"/>`;
    case "curly":
      return `<g fill="${a.hairColor}">
        <circle cx="43" cy="33" r="7"/><circle cx="53" cy="27" r="8"/><circle cx="64" cy="26" r="8"/>
        <circle cx="75" cy="31" r="7"/><circle cx="39" cy="42" r="6"/><circle cx="81" cy="42" r="6"/>
      </g>`;
    case "bun":
      return `<path d="M35 47 C34 28 45 20 60 20 C75 20 86 28 85 47 C81 36 72 32 60 32 C48 32 39 36 35 47 Z" fill="${a.hairColor}"/>`;
    case "ponytail":
      return `<path d="M34 47 C33 27 45 18 60 18 C75 18 87 27 86 47 C82 35 73 31 60 31 C47 31 38 35 34 47 Z" fill="${a.hairColor}"/>
        <path d="M38 44 C46 39 53 40 59 42 L57 33 C49 33 42 37 38 44 Z" fill="${lighten(a.hairColor, 7)}"/>`;
    case "bald":
      return "";
    default:
      return "";
  }
}

function clamp255(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function parseHex(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function toHex(rgb) { return "#" + rgb.map(v => clamp255(v).toString(16).padStart(2, "0")).join(""); }
export function lighten(hex, amt) { const [r, g, b] = parseHex(hex); return toHex([r + amt, g + amt, b + amt]); }
export function darken(hex, amt) { const [r, g, b] = parseHex(hex); return toHex([r - amt, g - amt, b - amt]); }
