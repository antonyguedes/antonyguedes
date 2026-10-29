// Generates the static animated SVGs used by the README.
// Usage: node scripts/build-assets.mjs
import {
  C, MONO_ADVANCE, FONT_DISPLAY, FONT_MONO, fontFaces, esc, glow, rng, r2, timeline, write,
  sparkle, pyreflyDefs, pyreflies, windowDefs, windowFrame, windowSheen,
} from './lib.mjs';

// Dense canopy: overlapping blobs with a teal rim light along the silhouette,
// sprinkled with glitter and a few softly pulsing glows inside.
function canopy(rand, { x0, x1, top, base, n, specks = 0, glows = 0, shade = ['#0a2733', '#0c2d3b', '#0e3343'], rim = C.azure }) {
  const blobs = [];
  for (let k = 0; k < n; k++) {
    const x = x0 + rand() * (x1 - x0), yt = top(x), r = 12 + rand() * 30;
    const y = Math.min(yt + r * 0.7 + rand() * Math.max(base - yt - r, 0), base + 6);
    blobs.push([r2(x), r2(y), r2(r)]);
  }
  const body = blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade[Math.floor(rand() * shade.length)]}"/>`).join('');
  const rimL = blobs.map(([x, y, r]) => `<circle cx="${r2(x - 2.5)}" cy="${r2(y - 3.5)}" r="${r}"/>`).join('');
  const glitter = Array.from({ length: specks }, () => {
    const [bx, by, br] = blobs[Math.floor(rand() * blobs.length)];
    const a = rand() * Math.PI * 2, d = rand() * br * 0.9;
    const c = rand() > 0.85 ? C.silver : rand() > 0.4 ? C.frost : C.aqua;
    const tw = rand() < 0.3
      ? `<animate attributeName="opacity" values="0.2;1;0.2" dur="${r2(2 + rand() * 4)}s" begin="${r2(-rand() * 6)}s" repeatCount="indefinite"/>`
      : '';
    return `<circle cx="${r2(bx + Math.cos(a) * d)}" cy="${r2(by + Math.sin(a) * d)}" r="${r2(0.5 + rand() * 1.1)}" fill="${c}">${tw}</circle>`;
  }).join('');
  const inner = Array.from({ length: glows }, () => {
    const [bx, by, br] = blobs[Math.floor(rand() * blobs.length)];
    return `<circle cx="${bx}" cy="${by}" r="${r2(br * 0.8)}" fill="${C.aqua}" opacity="0.3" filter="url(#soft)"><animate attributeName="opacity" values="0.15;0.5;0.15" dur="${r2(4 + rand() * 4)}s" begin="${r2(-rand() * 8)}s" repeatCount="indefinite"/></circle>`;
  }).join('');
  return `<g filter="url(#leafy)"><g fill="${rim}" opacity="0.7">${rimL}</g><g>${body}</g></g><g>${inner}</g><g>${glitter}</g>`;
}

// Gnarled tree with a braided trunk whose arms and crown of crystal leaves
// cradle a golden orb. Drawn in local units (base at 0,0, ~150 tall) and scaled.
function orbTree(rand, x, base, s, flip = 1) {
  const d = r2(3 + rand() * 3), b = r2(-rand() * 6);
  const petal = (angle, len, w, front) => {
    const sway = r2(2 + rand() * 4), sd = r2(3 + rand() * 3);
    return `<g transform="rotate(${r2(angle)})"><path d="M0 0 Q${r2(w)} ${r2(-len * 0.45)} 0 ${r2(-len)} Q${r2(-w * 0.6)} ${r2(-len * 0.5)} 0 0Z" fill="url(#petal)" stroke="${C.frost}" stroke-opacity="${front ? 0.7 : 0.4}" stroke-width="0.7">` +
      `<animateTransform attributeName="transform" type="rotate" values="${-sway};${sway};${-sway}" dur="${sd}s" begin="${r2(-rand() * 4)}s" repeatCount="indefinite"/></path></g>`;
  };
  const back = [-96, -72, -50, -28, -8, 14, 36, 58, 80, 100].map((a) => petal(a + (rand() - 0.5) * 10, 30 + rand() * 20, 9 + rand() * 5, false)).join('');
  const front = [-128, -150, 130, 152].map((a) => petal(a, 20 + rand() * 6, 7, true)).join('');
  const roots = [[-1, 58, 6], [-1, 40, 10], [-1, 24, 12], [1, 26, 11], [1, 44, 8], [1, 62, 5]].map(([sx, len, dy]) =>
    `<path d="M${sx * 14} -10 Q${sx * len * 0.55} ${-dy - 4} ${sx * len} ${r2(dy * 0.5)}" stroke="url(#trunk)" stroke-width="${r2(3 + dy * 0.35)}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${sx * 14} -12 Q${sx * len * 0.55} ${-dy - 6} ${sx * len} ${r2(dy * 0.5 - 1.5)}" stroke="${C.aqua}" stroke-opacity="0.5" stroke-width="0.9" fill="none"/>`,
  ).join('');
  const strand = (o, c, op, w) =>
    `<path d="M${-14 * o} -4 C${16 * o} -30 ${-18 * o} -58 ${10 * o} -86 C${20 * o} -98 ${-6 * o} -104 ${4 * o} -112" stroke="${c}" stroke-opacity="${op}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${base}) scale(${r2(s * flip)} ${s})">
  ${roots}
  <path d="M-28 0 C-14 -10 -10 -24 -15 -42 C-20 -62 -6 -78 -15 -104 L15 -104 C8 -80 22 -62 16 -42 C12 -24 16 -10 28 0Z" fill="url(#trunk)" stroke="${C.aqua}" stroke-opacity="0.45" stroke-width="1"/>
  ${strand(1, C.aqua, 0.6, 2)}${strand(-1, C.leaf, 0.35, 1.6)}${strand(0.5, '#061722', 0.8, 3)}
  <path d="M-12 -100 C-30 -108 -40 -124 -34 -142" stroke="url(#trunk)" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M12 -100 C30 -110 42 -124 36 -140" stroke="url(#trunk)" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M-12 -101 C-30 -109 -40 -125 -34 -143" stroke="${C.aqua}" stroke-opacity="0.5" stroke-width="1" fill="none"/>
  <g transform="translate(0 -108)">${back}</g>
  <g transform="translate(0 -122)">
    <circle r="62" fill="url(#lanternHalo)"><animate attributeName="r" values="54;70;54" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>
    <circle r="15" fill="${C.bloom}" filter="url(#g4)"/>
    <circle r="10" fill="${C.gold}"/>
    <circle cx="-3" cy="-3" r="5" fill="#fff"/>
  </g>
  <g transform="translate(0 -108)">${front}</g>
</g>`;
}

// Glowing cyan crystals on the water, denser near the shore.
const waterCrystals = (rand, n, x0, x1, y0, y1) => Array.from({ length: n }, () => {
  const x = r2(x0 + rand() * (x1 - x0)), y = r2(y0 + Math.pow(rand(), 2.6) * (y1 - y0)), h = r2(3 + rand() * 7), w = r2(1.2 + rand() * 1.4);
  return `<g><path d="M${x} ${r2(y - h)}L${r2(x + w)} ${y}L${r2(x - w)} ${y}Z" fill="${rand() > 0.35 ? C.frost : C.snow}" filter="url(#g2)"/>` +
    `<ellipse cx="${x}" cy="${r2(y + h * 0.6)}" rx="${w}" ry="${r2(h * 0.6)}" fill="${C.ice}" opacity="0.3"/>` +
    `<animate attributeName="opacity" values="0.4;1;0.4" dur="${r2(2 + rand() * 4)}s" begin="${r2(-rand() * 6)}s" repeatCount="indefinite"/></g>`;
}).join('');

// White crystal petals drifting down and tumbling.
const petals = (rand, n, W, y1) => Array.from({ length: n }, () => {
  const x = r2(rand() * W), d = r2(9 + rand() * 9), b = r2(-rand() * 18), s = r2(2.5 + rand() * 3.5);
  return `<g opacity="0"><path d="M0 ${-s}L${r2(s * 0.3)} 0L0 ${s}L${r2(-s * 0.3)} 0Z" fill="${C.snow}" filter="url(#g2)"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="${r2(3 + rand() * 4)}s" repeatCount="indefinite"/></path>` +
    `<animateMotion path="M${x} -10 C${r2(x - 60)} ${r2(y1 * 0.3)} ${r2(x + 30)} ${r2(y1 * 0.6)} ${r2(x - 80)} ${y1}" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>` +
    `<animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.1;0.85;1" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></g>`;
}).join('');

// Crescent moon with mottled surface and faint earthshine.
const moon = (x, y, r) => `<g transform="translate(${x} ${y})">
  <circle r="${r * 2.4}" fill="url(#moonHalo)"><animate attributeName="opacity" values="0.75;1;0.75" dur="7s" repeatCount="indefinite"/></circle>
  <circle r="${r}" fill="${C.moon}" opacity="0.07"/>
  <g mask="url(#crescent)">
    <circle r="${r}" fill="url(#moonFace)"/>
    <rect x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" filter="url(#moonTex)" opacity="0.22"/>
  </g>
</g>`;

// Ethereal cyan/violet energy wisps flowing across the moon: wide soft
// veils underneath, thin bright filaments on top.
function wisps(rand, cx, cy, spread = 1) {
  const strand = (c, wide) => {
    const y = cy - 26 + rand() * 60, len = (300 + rand() * 200) * spread;
    const x0 = cx - len * 0.65, x1 = cx + len * 0.35;
    const path = `M${r2(x0)} ${r2(y + 30)} C${r2(x0 + len * 0.3)} ${r2(y - 50 - rand() * 30)} ${r2(x0 + len * 0.6)} ${r2(y + 50 + rand() * 20)} ${r2(x1)} ${r2(y - 30)}`;
    const w = wide ? r2(8 + rand() * 14) : r2(0.8 + rand() * 1.6), dur = r2(8 + rand() * 6);
    return `<path d="${path}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${r2(wide ? 0.3 + rand() * 0.25 : 0.55 + rand() * 0.4)}" stroke-dasharray="${r2(len * 0.55)} ${r2(len * 0.2)}" filter="url(#${wide ? 'wisp' : 'g2'})">` +
      `<animate attributeName="stroke-dashoffset" values="0;${-r2(len * 0.75)}" dur="${dur}s" repeatCount="indefinite"/>` +
      `<animateTransform attributeName="transform" type="translate" values="0 0;${r2((rand() - 0.5) * 24)} ${r2((rand() - 0.5) * 14)};0 0" dur="${r2(dur * 0.8)}s" repeatCount="indefinite"/></path>`;
  };
  return [C.violet, C.aqua, C.violet, C.ice, C.lilac].map((c) => strand(c, true)).join('') +
    `<circle cx="${cx - 30}" cy="${cy + 10}" r="70" fill="url(#core)"><animate attributeName="r" values="58;80;58" dur="6s" repeatCount="indefinite"/></circle>` +
    [C.snow, C.frost, C.ice, C.snow, C.frost, C.lilac, C.snow, C.ice].map((c) => strand(c, false)).join('');
}

const sceneDefs = (r) => `
<radialGradient id="lanternHalo"><stop offset="0" stop-color="${C.gold}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${C.bloom}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.bloom}" stop-opacity="0"/></radialGradient>
<radialGradient id="moonHalo"><stop offset="0.3" stop-color="${C.frost}" stop-opacity="0.3"/><stop offset="0.6" stop-color="${C.aqua}" stop-opacity="0.1"/><stop offset="1" stop-color="${C.aqua}" stop-opacity="0"/></radialGradient>
<radialGradient id="moonFace" cx="0.35" cy="0.4" r="0.7"><stop offset="0" stop-color="#fbf7ee"/><stop offset="0.7" stop-color="#e2dccb"/><stop offset="1" stop-color="#a9a597"/></radialGradient>
<radialGradient id="core"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="0.4" stop-color="${C.frost}" stop-opacity="0.25"/><stop offset="1" stop-color="${C.frost}" stop-opacity="0"/></radialGradient>
<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b2a38"/><stop offset="0.4" stop-color="#2a6f86"/><stop offset="0.7" stop-color="#174a5e"/><stop offset="1" stop-color="#0a2533"/></linearGradient>
<linearGradient id="wispFade" gradientUnits="userSpaceOnUse" x1="900" y1="0" x2="1010" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="wispMask"><rect width="1400" height="400" fill="url(#wispFade)"/></mask>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<linearGradient id="petal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0e3343"/><stop offset="0.6" stop-color="${C.azure}"/><stop offset="1" stop-color="${C.leaf}"/></linearGradient>
<linearGradient id="ray" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.frost}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.frost}" stop-opacity="0"/></linearGradient>
<mask id="crescent" maskUnits="userSpaceOnUse" x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}">
  <circle r="${r}" fill="#fff"/><circle cx="${r * 0.5}" cy="${r * 0.22}" r="${r * 0.86}" fill="#000"/>
</mask>
<filter id="moonTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="2"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="wisp" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="leafy" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>`;

const rippleFilter = (y, W, h) => `<filter id="ripple" filterUnits="userSpaceOnUse" x="0" y="${y}" width="${W}" height="${h}">
  <feTurbulence type="fractalNoise" baseFrequency="0.004 0.07" numOctaves="2" seed="4">
    <animate attributeName="baseFrequency" values="0.004 0.07;0.006 0.09;0.004 0.07" dur="9s" repeatCount="indefinite"/>
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;

const waterLines = (rand, n, W, y0, gap) => Array.from({ length: n }, (_, i) => {
  const y = y0 + i * gap, w = 120 + rand() * 260, x = rand() * (W - w), d = r2(6 + rand() * 6);
  return `<line y1="${r2(y)}" y2="${r2(y)}" x1="${r2(x)}" x2="${r2(x + w)}" stroke-width="${r2(0.6 + i * 0.12)}" stroke-dasharray="${r2(w / 3)} ${r2(w / 5)}"><animate attributeName="stroke-dashoffset" values="0;${r2(w)}" dur="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.2;0.8;0.2" dur="${d}s" repeatCount="indefinite"/></line>`;
}).join('');

// ───────────────────────────── HEADER ─────────────────────────────
function header() {
  const W = 1200, H = 360, HZ = 262, VX = 600, MR = 60;
  const rand = rng(11);

  const stars = Array.from({ length: 90 }, () => {
    const x = r2(rand() * W), y = r2(rand() * 200);
    return `<circle cx="${x}" cy="${y}" r="${r2(0.4 + rand())}" fill="${rand() > 0.3 ? C.frost : C.leaf}"><animate attributeName="opacity" values="0.1;0.9;0.1" dur="${r2(2 + rand() * 4)}s" begin="${r2(-rand() * 6)}s" repeatCount="indefinite"/></circle>`;
  }).join('');

  const rays = [[1150, 70], [1040, 50], [930, 40]].map(([x, w], i) =>
    `<polygon points="${x},0 ${x + w},0 ${x - 420},${HZ} ${x - 420 - w * 2},${HZ}" fill="url(#ray)"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="${8 + i * 2}s" begin="${-i * 3}s" repeatCount="indefinite"/></polygon>`,
  ).join('');

  const farWoods = canopy(rand, { x0: 0, x1: W, top: (x) => 200 + 18 * Math.sin(x / 70), base: HZ, n: 70, specks: 60, shade: ['#0b2c3a', '#0d3242', '#10384a'], rim: '#2a7f9a' });
  const left = canopy(rand, { x0: -20, x1: 400, top: (x) => 40 + Math.pow(Math.max(x, 0) / 400, 1.6) * 175, base: HZ - 40, n: 110, specks: 220, glows: 4 });
  const right = canopy(rand, { x0: 820, x1: W + 20, top: (x) => 215 - Math.pow(Math.max(x - 820, 0) / 380, 1.2) * 60, base: HZ - 40, n: 90, specks: 180, glows: 3 });
  const trunks = [[40, 1.3], [210, 0.9], [990, 0.85], [1170, 1.25]].map(([x, s]) =>
    `<path transform="translate(${x} ${HZ}) scale(${s})" d="M-12 0 C-4 -30 -16 -60 -8 -100 L8 -100 C18 -60 2 -30 12 0Z" fill="url(#trunk)" opacity="0.9"/>`,
  ).join('');
  const orbTrees = [[130, HZ + 6, 1.05, 1], [372, HZ + 3, 0.55, -1], [832, HZ + 3, 0.55, 1], [1115, HZ + 6, 0.9, -1]]
    .map(([x, y, s, f]) => orbTree(rand, x, y, s, f)).join('');

  const corner = (x, y, sx, sy) => `
<path d="M${x} ${y + sy * 34} V${y} H${x + sx * 34}" fill="none"/>
<path d="M${x + sx * 8} ${y + sy * 20} V${y + sy * 8} H${x + sx * 20}" fill="none" stroke-opacity="0.5"/>
<path transform="translate(${x} ${y})" d="M0 -5L5 0L0 5L-5 0Z" fill="${C.snow}" stroke="none"/>`;

  const title = 'ANTONIO GUEDES';
  const sub = 'FULL STACK  ·  WEB3  ·  DLT  ·  AI';
  const sparkles = [[330, 92, 0], [612, 82, 2.3], [870, 118, 4.1], [455, 128, 5.6]].map(([x, y, b]) =>
    `<g transform="translate(${x} ${y})"><path d="${sparkle(12)}" fill="#fff" filter="url(#g4)" transform="scale(0)">` +
    `<animateTransform attributeName="transform" type="scale" values="0;1.2;0;0" keyTimes="0;0.06;0.14;1" dur="7s" begin="${b}s" repeatCount="indefinite"/></path></g>`,
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Antonio Guedes — Full Stack · Web3 · DLT · AI">
<defs>
<style>
${fontFaces()}
.title{font-family:${FONT_DISPLAY};font-weight:900;font-size:58px;letter-spacing:8px}
.sub{font-family:${FONT_DISPLAY};font-weight:700;font-size:18px;letter-spacing:7px;fill:${C.frost}}
.tag{font-family:${FONT_DISPLAY};font-weight:700;font-size:13px;letter-spacing:5px;fill:${C.gold}}
.hud{font-family:${FONT_DISPLAY};font-weight:700;font-size:12px;letter-spacing:2px;fill:${C.frost}}
.boot{animation:boot 2.4s ease-out both}
@keyframes boot{0%{opacity:0;filter:blur(14px)}100%{opacity:1;filter:blur(0)}}
</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.deep}"/><stop offset="0.55" stop-color="#0c202a"/><stop offset="1" stop-color="#14354a"/>
</linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0d3f6e"/><stop offset="1" stop-color="#05182a"/>
</linearGradient>
<linearGradient id="titleFill" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="${C.frost}"/><stop offset="1" stop-color="${C.ice}"/>
</linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<linearGradient id="orn" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${C.ice}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.snow}"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0"/>
</linearGradient>
<radialGradient id="mist" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.aqua}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.aqua}" stop-opacity="0"/></radialGradient>
<mask id="shineMask">
  <rect x="-200" y="60" width="200" height="90" fill="url(#shine)" transform="skewX(-20)">
    <animate attributeName="x" values="-200;${W + 200}" dur="5s" begin="2.4s" repeatCount="indefinite"/>
  </rect>
</mask>
<clipPath id="lakeClip"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
<clipPath id="subReveal"><rect x="${VX}" y="0" width="0" height="${H}">
  <animate attributeName="x" from="${VX}" to="0" dur="2s" begin="1.4s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
  <animate attributeName="width" from="0" to="${W}" dur="2s" begin="1.4s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
</rect></clipPath>
${rippleFilter(HZ, W, H - HZ)}
${sceneDefs(MR)}
${glow('g2', 2)}${glow('g4', 4)}${glow('g8', 8)}
${pyreflyDefs()}
</defs>

<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars}
${moon(1030, 68, MR)}
<g mask="url(#wispMask)">${wisps(rand, 1040, 110, 0.85)}</g>
${rays}

<g id="woods">
  ${farWoods}
  ${trunks}
  ${left}
  ${right}
  <ellipse cx="${VX}" cy="${HZ - 6}" rx="640" ry="26" fill="url(#mist)"><animate attributeName="rx" values="600;680;600" dur="10s" repeatCount="indefinite"/></ellipse>
  ${orbTrees}
</g>

<!-- lake with rippling reflection and crystals -->
<rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#lake)"/>
<g clip-path="url(#lakeClip)" opacity="0.5" filter="url(#ripple)">
  <use href="#woods" transform="translate(0 ${2 * HZ}) scale(1 -1)"/>
</g>
<g stroke="${C.frost}" stroke-linecap="round" opacity="0.45">${waterLines(rand, 7, W, HZ + 12, 13)}</g>
<line x1="0" y1="${HZ}" x2="${W}" y2="${HZ}" stroke="url(#orn)" stroke-width="1.2" filter="url(#g4)"><animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite"/></line>
${waterCrystals(rand, 80, 10, W - 10, HZ - 2, H - 10)}

${pyreflies(rand, 30, { x0: 0, x1: W, y0: HZ + 10, y1: 20, dMin: 9, dMax: 18, rMin: 0.8, rMax: 2.2 })}
${petals(rand, 24, W + 80, HZ + 20)}

<!-- title -->
<g class="boot">
  <text x="${VX}" y="52" text-anchor="middle" class="tag" filter="url(#g2)">~ A TALE OF CODE AND CHAINS ~</text>
  <text x="${VX}" y="122" text-anchor="middle" class="title" fill="url(#titleFill)" filter="url(#g8)">${title}</text>
  <text x="${VX}" y="122" text-anchor="middle" class="title" fill="#fff" mask="url(#shineMask)">${title}</text>
  ${sparkles}
</g>
<g transform="translate(${VX} 146)">
  <line x1="0" x2="0" stroke="url(#orn)" stroke-width="1.5">
    <animate attributeName="x1" from="0" to="-300" dur="1.6s" begin="1s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
    <animate attributeName="x2" from="0" to="300" dur="1.6s" begin="1s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
  </line>
  <path d="M0 -6L6 0L0 6L-6 0Z" fill="${C.gold}" filter="url(#g4)"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="10s" repeatCount="indefinite"/></path>
</g>
<g clip-path="url(#subReveal)">
  <text x="${VX}" y="180" text-anchor="middle" class="sub" filter="url(#g2)">${esc(sub)}</text>
</g>

<!-- ornate corners + RPG status -->
<g stroke="${C.frost}" stroke-width="1.5" filter="url(#g2)" opacity="0.9">
  ${corner(18, 18, 1, 1)}${corner(W - 18, 18, -1, 1)}${corner(18, H - 18, 1, -1)}${corner(W - 18, H - 18, -1, -1)}
</g>
<g class="hud" opacity="0.9">
  <text x="58" y="${H - 30}">LV <tspan fill="${C.gold}">99</tspan>  ·  DEVELOPER</text>
  <text x="${W - 58}" y="${H - 30}" text-anchor="end">HP <tspan fill="${C.frost}">9999</tspan>/9999  MP <tspan fill="${C.gold}">999</tspan>/999</text>
</g>
</svg>`;
}

// ───────────────────────────── TYPING ─────────────────────────────
function typing() {
  const W = 760, H = 56, FS = 22, CW = FS * MONO_ADVANCE;
  const lines = [
    'Building Galaxies from Scratch',
    'Antonio Guedes',
    "I'm going to become a Software Architect",
    "That's my Coding Way",
  ];
  const TYPE = 0.07, HOLD = 1.8, DEL = 0.03, GAP = 0.35;
  const PREFIX = '» ';
  const spans = lines.map((l) => {
    const n = PREFIX.length + l.length;
    return { l, n, len: n * TYPE + HOLD + l.length * DEL + GAP };
  });
  const DUR = r2(spans.reduce((s, x) => s + x.len, 0));

  let start = 0;
  const groups = spans.map(({ l, n, len }, i) => {
    const x0 = r2((W - n * CW) / 2);
    const ev = [[0, 0]];
    if (start > 0) ev.push([start, 0]);
    // never delete the prefix — only the text after it
    for (let c = 1; c <= n; c++) ev.push([start + c * TYPE, c]);
    const tHold = start + n * TYPE + HOLD;
    for (let c = 1; c <= l.length; c++) ev.push([tHold + c * DEL, n - c]);
    ev.push([start + len - GAP + 0.001, 0]);
    const width = timeline(ev.map(([t, c]) => [r2(t), r2(c * CW)]), DUR);
    const xs = timeline(ev.map(([t, c]) => [r2(t), r2(x0 + c * CW + 2)]), DUR);
    const vis = timeline(
      start > 0
        ? [[0, 'hidden'], [start, 'visible'], [start + len, 'hidden']]
        : [[0, 'visible'], [len, 'hidden']],
      DUR,
    );
    start += len;
    return `<g visibility="hidden">
  <animate attributeName="visibility" calcMode="discrete" values="${vis.values}" keyTimes="${vis.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/>
  <clipPath id="c${i}"><rect x="${x0}" y="0" height="${H}" width="0"><animate attributeName="width" calcMode="discrete" values="${width.values}" keyTimes="${width.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect></clipPath>
  <text x="${x0}" y="36" class="t" clip-path="url(#c${i})"><tspan fill="${C.ice}">${esc(PREFIX)}</tspan><tspan fill="url(#tg)">${esc(l)}</tspan></text>
  <rect y="15" width="3" height="26" rx="1.5" fill="${C.snow}" class="cur" filter="url(#g)"><animate attributeName="x" calcMode="discrete" values="${xs.values}" keyTimes="${xs.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect>
</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(lines.join(' · '))}">
<defs>
<style>
${fontFaces({ display: false })}
.t{font-family:${FONT_MONO};font-size:${FS}px;font-weight:700;font-variant-ligatures:none;white-space:pre}
.cur{animation:blink .8s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
</style>
<linearGradient id="tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.frost}"/><stop offset="0.6" stop-color="${C.ice}"/><stop offset="1" stop-color="${C.lilac}"/></linearGradient>
${glow('g', 2.5)}
</defs>
${groups.join('\n')}
</svg>`;
}

// ──────────────────────────── TERMINAL ────────────────────────────
function terminal() {
  const FS = 14, CW = FS * MONO_ADVANCE, LH = 24, PAD = 44, TOP = 64;
  const K = C.bloom, ID = C.ice, KEY = C.lilac, STR = '#c6ecd9', P = '#8fb3d9';
  // Each line is a list of [text, color] tokens.
  const field = (k, v) => {
    const key = [`  ${k}:`.padEnd(15, ' '), KEY];
    if (Array.isArray(v)) {
      const toks = [['[', P]];
      v.forEach((s, i) => { toks.push([`"${s}"`, STR]); if (i < v.length - 1) toks.push([', ', P]); });
      return [key, ...toks, ['],', P]];
    }
    return [key, [`"${v}"`, STR], [',', P]];
  };
  const code = [
    [['const ', K], ['developer', ID], [' = {', P]],
    field('name', 'Antonio Guedes'),
    field('role', ['Computer Scientist', 'Software Engineer', 'Full Stack Dev']),
    field('formation', 'UFSJ — Universidade Federal de São João del-Rei'),
    field('specialty', 'Hyperledger Tech'),
    field('stack', ['Web', 'Mobile', 'DApps', 'Desktop', 'UI/UX', 'Architecture']),
    field('currentlyOn', 'Web3 & AI Dev @ Aura Kairos Emet — The 1st Veracity Oracle'),
    field('funFact', 'I think in chains — blockchain chains'),
    [['};', P]],
  ];
  const prompt = (cmd) => [['antonio@guedes', C.aqua], [':', P], ['~/profile', C.ice], [' $ ', P], [cmd, C.snow]];
  const PROMPT_LEN = 'antonio@guedes:~/profile $ '.length;
  const rows = [
    { toks: prompt('cat developer.ts'), typeFrom: PROMPT_LEN, speed: 0.08 },
    ...code.map((toks) => ({ toks, typeFrom: 0, speed: 0.012 })),
    { toks: prompt(''), typeFrom: PROMPT_LEN, speed: 0, final: true },
  ];

  const W = 900, H = TOP + rows.length * LH + 28;
  const HOLD = 7;
  let t = 0.6;
  const sched = rows.map((r) => {
    const n = r.toks.reduce((s, [x]) => s + x.length, 0);
    const startT = t;
    const steps = [];
    if (r.typeFrom) steps.push([startT, r.typeFrom]);
    for (let c = r.typeFrom + 1; c <= n; c++) steps.push([startT + (c - r.typeFrom) * r.speed, c]);
    t = steps.length ? steps[steps.length - 1][0] + (r.speed > 0.05 ? 0.5 : 0.12) : t;
    return { n, steps, startT };
  });
  const DUR = r2(t + HOLD);
  const rowY = (i) => TOP + i * LH + 16;

  const body = rows.map((r, i) => {
    const y = rowY(i);
    const { n, steps } = sched[i];
    const ev = [[0, 0], ...steps.map(([tt, c]) => [r2(tt), r2(c * CW)]), [r2(DUR - 0.4), 0]];
    const wt = timeline(ev, DUR);
    const tspans = r.toks.map(([s, col]) => `<tspan fill="${col}">${esc(s)}</tspan>`).join('');
    let cursor = '';
    if (r.final) {
      const vis = timeline([[0, 'hidden'], [r2(steps[0][0]), 'visible'], [r2(DUR - 0.4), 'hidden']], DUR);
      cursor = `<rect x="${PAD + n * CW + 2}" y="${y - 13}" width="${r2(CW)}" height="17" fill="${C.snow}" visibility="hidden" class="cur" filter="url(#g)"><animate attributeName="visibility" calcMode="discrete" values="${vis.values}" keyTimes="${vis.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect>`;
    }
    return `<clipPath id="r${i}"><rect x="${PAD}" y="${y - 18}" height="${LH}" width="0"><animate attributeName="width" calcMode="discrete" values="${wt.values}" keyTimes="${wt.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect></clipPath>
<text x="${PAD}" y="${y}" class="code" clip-path="url(#r${i})">${tspans}</text>${cursor}`;
  }).join('\n');

  // Menu-style pointer that hops to the line being written
  const ptr = timeline([[0, rowY(0)], ...sched.map(({ startT }, i) => [r2(startT), rowY(i)])], DUR);
  const pointer = `<g transform="translate(22 0)">
  <g><animateTransform attributeName="transform" type="translate" calcMode="discrete" values="${ptr.values.split(';').map((y) => `0 ${y - 5}`).join(';')}" keyTimes="${ptr.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/>
    <g class="nudge"><path d="M-6 -6 L6 0 L-6 6 L-3 0 Z" fill="${C.snow}" stroke="${C.ice}" stroke-width="0.8" filter="url(#g)"/></g>
  </g>
</g>`;

  const rand = rng(5);
  const shard = (x, y, c) => `<path transform="translate(${x} ${y})" d="M0 -6L4 0L0 6L-4 0Z" fill="${c}" filter="url(#g)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="const developer = { name: Antonio Guedes, role: Computer Scientist, Software Engineer, Full Stack Dev, specialty: Hyperledger Tech }">
<defs>
<style>
${fontFaces()}
.code{font-family:${FONT_MONO};font-size:${FS}px;font-variant-ligatures:none;white-space:pre}
.ttl{font-family:${FONT_DISPLAY};font-weight:700;font-size:13px;fill:${C.frost};letter-spacing:3px}
.cur{animation:blink .9s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.nudge{animation:nudge .9s ease-in-out infinite}
@keyframes nudge{50%{transform:translateX(-4px)}}
</style>
${windowDefs()}
${pyreflyDefs()}
${glow('g', 2.5)}
</defs>
${windowFrame(1, 1, W - 2, H - 2, 12)}
<g opacity="0.6">${pyreflies(rand, 12, { x0: 30, x1: W - 30, y0: H - 10, y1: 50, rMin: 0.8, rMax: 1.8, dMin: 8, dMax: 14, sway: 50 })}</g>
<path d="M14 42 H${W - 14}" stroke="${C.silver}" stroke-opacity="0.35"/>
${shard(26, 22, C.ice)}${shard(42, 22, C.aqua)}${shard(58, 22, C.bloom)}
<text x="${W / 2}" y="27" text-anchor="middle" class="ttl">ANTONIO@GUEDES · ~/PROFILE</text>
<text x="${W - 24}" y="27" text-anchor="end" class="ttl" fill="${C.aqua}" font-size="11">SAVE SPHERE</text>
${body}
${pointer}
${windowSheen(1, 1, W - 2, H - 2, { rx: 12, dur: 8 })}
</svg>`;
}

// ──────────────────────────── SECTIONS ────────────────────────────
function section(idx, title, label) {
  const W = 900, H = 72, Y = 36;
  const rand = rng(idx.length * 31 + title.length);
  const titleW = title.length * 21 + 10; // rough Cinzel width at 22px + spacing
  const lineX = 96 + titleW;
  const lineEnd = W - 34 - label.length * 7.2 - 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
<defs>
<style>
${fontFaces()}
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:22px;letter-spacing:5px}
.m{font-family:${FONT_MONO};font-size:12px}
.n{font-family:${FONT_DISPLAY};font-weight:900;font-size:13px}
.on{animation:on 1.8s ease-out both}
@keyframes on{0%{opacity:0;filter:blur(8px)}100%{opacity:1;filter:blur(0)}}
</style>
${windowDefs()}
${pyreflyDefs()}
<linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.frost}"/></linearGradient>
<linearGradient id="ln" gradientUnits="userSpaceOnUse" x1="${lineX}" y1="0" x2="${r2(lineEnd)}" y2="0"><stop offset="0" stop-color="${C.snow}"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0.1"/></linearGradient>
${glow('g', 2.5)}
</defs>
${windowFrame(2, 6, W - 4, H - 12, 10)}
<g opacity="0.7">${pyreflies(rand, 6, { x0: 120, x1: W - 40, y0: H - 6, y1: 10, rMin: 0.8, rMax: 1.6, dMin: 5, dMax: 9, sway: 40 })}</g>
<g transform="translate(46 ${Y})">
  <path d="M0 -22L15 0L0 22L-15 0Z" fill="${C.ice}" fill-opacity="0.12" stroke="${C.snow}" stroke-width="1.2" filter="url(#g)">
    <animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1" dur="6s" repeatCount="indefinite"/>
  </path>
  <text y="5" text-anchor="middle" class="n" fill="#fff" filter="url(#g)">${idx}</text>
</g>
<text x="86" y="${Y + 8}" class="h on" fill="url(#tg)" filter="url(#g)">${esc(title)}</text>
<line x1="${lineX}" y1="${Y}" x2="${lineX}" y2="${Y}" stroke="url(#ln)" stroke-width="1.5">
  <animate attributeName="x2" from="${lineX}" to="${r2(lineEnd)}" dur="1.2s" begin="0.4s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
</line>
<g opacity="0"><circle r="7" fill="url(#pf0)"/><circle r="2.2" fill="#fff"/>
  <animateMotion path="M${lineX} ${Y} H${r2(lineEnd)}" dur="3.2s" begin="1.6s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.2s" begin="1.6s" repeatCount="indefinite"/>
</g>
<text x="${W - 30}" y="${Y + 4}" text-anchor="end" class="m" fill="${C.frost}">[ <tspan fill="${C.ice}">${esc(label)}</tspan> ]</text>
${windowSheen(2, 6, W - 4, H - 12, { dur: 9 })}
</svg>`;
}

// ───────────────────────────── FOOTER ─────────────────────────────
function footer() {
  const W = 1200, H = 220, HZ = 140;
  const rand = rng(23);
  const left = canopy(rand, { x0: -20, x1: 300, top: (x) => 20 + Math.pow(Math.max(x, 0) / 300, 1.5) * 85, base: HZ - 20, n: 70, specks: 120, glows: 2 });
  const right = canopy(rand, { x0: 900, x1: W + 20, top: (x) => 105 - Math.pow(Math.max(x - 900, 0) / 300, 1.5) * 85, base: HZ - 20, n: 70, specks: 120, glows: 2 });
  const far = canopy(rand, { x0: 0, x1: W, top: (x) => 118 + 8 * Math.sin(x / 60), base: HZ, n: 50, specks: 40, shade: ['#0b2c3a', '#0d3242', '#10384a'], rim: '#2a7f9a' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thanks for visiting">
<defs>
<style>
${fontFaces()}
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:24px;letter-spacing:9px}
.m{font-family:${FONT_DISPLAY};font-weight:700;font-size:13px;letter-spacing:4px}
</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="#14354a"/></linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3f6e"/><stop offset="1" stop-color="#05182a"/></linearGradient>
<linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.ice}"/></linearGradient>
<clipPath id="lakeClip"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
${rippleFilter(HZ, W, H - HZ)}
${sceneDefs(30)}
${pyreflyDefs()}
${glow('g', 3)}${glow('g2', 2)}${glow('g4', 4)}${glow('g8', 8)}
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g id="woods">
  ${far}${left}${right}
  ${orbTree(rand, 150, HZ + 4, 0.55, 1)}${orbTree(rand, 1050, HZ + 4, 0.55, -1)}
</g>
<rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#lake)"/>
<g clip-path="url(#lakeClip)" opacity="0.5" filter="url(#ripple)"><use href="#woods" transform="translate(0 ${2 * HZ}) scale(1 -1)"/></g>
<g stroke="${C.frost}" stroke-linecap="round" opacity="0.45">${waterLines(rand, 5, W, HZ + 12, 13)}</g>
${waterCrystals(rand, 60, 10, W - 10, HZ - 2, H - 8)}
<text x="${W / 2}" y="62" text-anchor="middle" class="h" fill="url(#tg)" filter="url(#g)">THANKS FOR VISITING</text>
<text x="${W / 2}" y="92" text-anchor="middle" class="m" fill="${C.gold}">~ UNTIL OUR PATHS CROSS AGAIN ~</text>
${pyreflies(rand, 22, { x0: 0, x1: W, y0: H - 20, y1: 10, dMin: 8, dMax: 15, rMin: 0.8, rMax: 2 })}
${petals(rand, 14, W + 80, HZ + 20)}
</svg>`;
}

write('assets/header.svg', header());
write('assets/typing.svg', typing());
write('assets/terminal.svg', terminal());
write('assets/footer.svg', footer());
for (const [file, idx, title, label] of [
  ['about', 'I', 'ABOUT ME', 'whoami'],
  ['stack', 'II', 'TECH STACK', 'ls ~/stack'],
  ['stats', 'III', 'GITHUB STATS', 'git log --stat'],
  ['trophies', 'IV', 'TROPHIES', 'achievements.json'],
  ['contrib', 'V', 'CONTRIBUTIONS', 'snake.run()'],
]) write(`assets/sections/${file}.svg`, section(idx, title, label));
