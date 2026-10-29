// Generates the static animated SVGs used by the README.
// Usage: node scripts/build-assets.mjs
import {
  C, MONO_ADVANCE, FONT_DISPLAY, FONT_MONO, fontFaces, esc, glow, rng, r2, timeline, write,
  sparkle, pyreflyDefs, pyreflies, windowDefs, windowFrame, windowSheen,
} from './lib.mjs';

// Recursive crystal tree: straight faceted branches ending in glowing shards.
function crystalTree(rand, x, base, height, width, depth = 4) {
  const branches = [], tips = [];
  const grow = (x1, y1, angle, len, w, depth) => {
    const x2 = x1 + Math.cos(angle) * len, y2 = y1 + Math.sin(angle) * len;
    branches.push(`<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke-width="${r2(w)}"/>`);
    if (depth === 0) {
      tips.push([r2(x2), r2(y2)]);
      return;
    }
    const kids = rand() > 0.75 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = (k - (kids - 1) / 2) * (0.45 + rand() * 0.3) + (rand() - 0.5) * 0.2;
      grow(x2, y2, angle + spread, len * (0.68 + rand() * 0.12), w * 0.62, depth - 1);
    }
  };
  grow(x, base, -Math.PI / 2 + (rand() - 0.5) * 0.15, height * 0.32, width, depth);
  return { branches, tips };
}

function forest(rand, specs, { twinkle = 0.35 } = {}) {
  const branches = [], shards = [];
  for (const [x, base, h, w, depth] of specs) {
    const t = crystalTree(rand, x, base, h, w, depth);
    branches.push(...t.branches);
    for (const [tx, ty] of t.tips) {
      const s = r2(2 + rand() * 3);
      const anim = rand() < twinkle
        ? `<animate attributeName="opacity" values="0.3;1;0.3" dur="${r2(2 + rand() * 4)}s" begin="${r2(-rand() * 6)}s" repeatCount="indefinite"/>`
        : '';
      shards.push(`<path transform="translate(${tx} ${ty})" d="M0 ${-s * 1.8}L${s} 0L0 ${s * 1.8}L${-s} 0Z" fill="${rand() > 0.7 ? C.bloom : rand() > 0.4 ? C.ice : C.snow}">${anim}</path>`);
    }
  }
  return { branches: branches.join(''), shards: shards.join('') };
}

// ───────────────────────────── HEADER ─────────────────────────────
function header() {
  const W = 1200, H = 360, HZ = 262, VX = 600;
  const rand = rng(11);

  const far = forest(rand, Array.from({ length: 11 }, (_, i) => [40 + i * 112 + rand() * 40, HZ, 90 + rand() * 50, 3, 3]), { twinkle: 0.15 });
  const near = forest(rand, [
    [55, HZ, 205, 9], [165, HZ, 160, 7], [1035, HZ, 160, 7], [1145, HZ, 205, 9],
  ]);

  const shafts = [[180, 90], [420, 60], [700, 80], [960, 70]].map(([x, w], i) =>
    `<polygon points="${x},0 ${x + w},0 ${x + w * 2.4 - 80},${HZ} ${x + w * 1.2 - 140},${HZ}" fill="url(#shaft)"><animate attributeName="opacity" values="0.25;0.75;0.25" dur="${7 + i * 1.5}s" begin="${-i * 2}s" repeatCount="indefinite"/></polygon>`,
  ).join('');

  const stars = Array.from({ length: 45 }, () => {
    const x = r2(rand() * W), y = r2(rand() * 150);
    return `<circle cx="${x}" cy="${y}" r="${r2(0.4 + rand())}" fill="${C.frost}"><animate attributeName="opacity" values="0.1;0.9;0.1" dur="${r2(2 + rand() * 4)}s" begin="${r2(-rand() * 6)}s" repeatCount="indefinite"/></circle>`;
  }).join('');

  // crystal dust slowly falling and spinning
  const dust = Array.from({ length: 22 }, () => {
    const x = r2(rand() * W), d = r2(10 + rand() * 10), b = r2(-rand() * 20), s = r2(2 + rand() * 2.5);
    return `<g opacity="0.8"><path d="${sparkle(s)}" fill="${C.snow}"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="${r2(4 + rand() * 4)}s" repeatCount="indefinite"/></path>` +
      `<animateMotion path="M${x} -10 C${r2(x + 40)} 80 ${r2(x - 40)} 170 ${r2(x + 20)} ${HZ}" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.85;1" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></g>`;
  }).join('');

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
.tag{font-family:${FONT_DISPLAY};font-weight:700;font-size:13px;letter-spacing:5px;fill:${C.ice}}
.hud{font-family:${FONT_DISPLAY};font-weight:700;font-size:12px;letter-spacing:2px;fill:${C.frost}}
.boot{animation:boot 2.4s ease-out both}
@keyframes boot{0%{opacity:0;filter:blur(14px)}100%{opacity:1;filter:blur(0)}}
.breathe{animation:breathe 6s ease-in-out infinite}
@keyframes breathe{50%{opacity:.75}}
</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#01030f"/><stop offset="0.55" stop-color="#05173f"/><stop offset="1" stop-color="#0b4a6e"/>
</linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0b4a6e"/><stop offset="1" stop-color="${C.deep}"/>
</linearGradient>
<linearGradient id="bark" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="0">
  <stop offset="0" stop-color="#22d3ee"/><stop offset="0.6" stop-color="${C.frost}"/><stop offset="1" stop-color="${C.lilac}"/>
</linearGradient>
<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.frost}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0"/>
</linearGradient>
<radialGradient id="aura" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="${C.azure}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.azure}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="titleFill" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="${C.frost}"/><stop offset="1" stop-color="${C.ice}"/>
</linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<linearGradient id="orn" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${C.ice}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.snow}"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0"/>
</linearGradient>
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
<filter id="ripple" filterUnits="userSpaceOnUse" x="0" y="${HZ}" width="${W}" height="${H - HZ}">
  <feTurbulence type="fractalNoise" baseFrequency="0.004 0.07" numOctaves="2" seed="4">
    <animate attributeName="baseFrequency" values="0.004 0.07;0.006 0.09;0.004 0.07" dur="9s" repeatCount="indefinite"/>
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/>
</filter>
${glow('g2', 2)}${glow('g4', 4)}${glow('g8', 8)}
${pyreflyDefs()}
</defs>

<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars}
<ellipse cx="${VX}" cy="120" rx="460" ry="170" fill="url(#aura)" class="breathe"/>
${shafts}

<g id="woods">
  <g stroke="url(#bark)" stroke-linecap="round" opacity="0.28">${far.branches}</g>
  <g opacity="0.35">${far.shards}</g>
  <g stroke="url(#bark)" stroke-linecap="round" opacity="0.85" filter="url(#g2)">${near.branches}</g>
  <g filter="url(#g4)">${near.shards}</g>
</g>

<!-- frozen lake with rippling reflection -->
<rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#lake)"/>
<g clip-path="url(#lakeClip)" opacity="0.4" filter="url(#ripple)">
  <use href="#woods" transform="translate(0 ${2 * HZ}) scale(1 -1)"/>
</g>
<g stroke="${C.frost}" stroke-linecap="round" opacity="0.5">
  ${Array.from({ length: 7 }, (_, i) => {
    const y = HZ + 12 + i * 13, w = 120 + rand() * 260, x = rand() * (W - w), d = r2(6 + rand() * 6);
    return `<line y1="${r2(y)}" y2="${r2(y)}" x1="${r2(x)}" x2="${r2(x + w)}" stroke-width="${r2(0.6 + i * 0.12)}" stroke-dasharray="${r2(w / 3)} ${r2(w / 5)}"><animate attributeName="stroke-dashoffset" values="0;${r2(w)}" dur="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.2;0.8;0.2" dur="${d}s" repeatCount="indefinite"/></line>`;
  }).join('')}
</g>
<line x1="0" y1="${HZ}" x2="${W}" y2="${HZ}" stroke="url(#orn)" stroke-width="2" filter="url(#g4)"><animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="5s" repeatCount="indefinite"/></line>

${pyreflies(rand, 34, { x0: 0, x1: W, y0: HZ + 20, y1: 20, dMin: 9, dMax: 18 })}
${dust}

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
  <path d="M0 -6L6 0L0 6L-6 0Z" fill="${C.snow}" filter="url(#g4)"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="10s" repeatCount="indefinite"/></path>
</g>
<g clip-path="url(#subReveal)">
  <text x="${VX}" y="180" text-anchor="middle" class="sub" filter="url(#g2)">${esc(sub)}</text>
</g>

<!-- ornate corners + RPG status -->
<g stroke="${C.frost}" stroke-width="1.5" filter="url(#g2)" opacity="0.9">
  ${corner(18, 18, 1, 1)}${corner(W - 18, 18, -1, 1)}${corner(18, H - 18, 1, -1)}${corner(W - 18, H - 18, -1, -1)}
</g>
<g class="hud" opacity="0.9">
  <text x="58" y="40">LV <tspan fill="${C.gold}">99</tspan>  ·  DEVELOPER</text>
  <text x="${W - 58}" y="40" text-anchor="end">HP <tspan fill="${C.aqua}">9999</tspan>/9999  MP <tspan fill="${C.lilac}">999</tspan>/999</text>
  <text x="58" y="${H - 30}">LAT -21.1356 · LON -44.2614</text>
  <text x="${W - 58}" y="${H - 30}" text-anchor="end">UFSJ · MG · BRASIL</text>
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
  const K = C.bloom, ID = C.ice, KEY = C.lilac, STR = '#99f6e4', P = '#9fb3d9';
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
  const W = 1200, H = 220, HZ = 120;
  const rand = rng(23);
  const wave = (base, amp, phase) => {
    const pts = (p) => {
      let d = `M0 ${base}`;
      for (let x = 0; x <= W; x += 150) {
        const y1 = base + amp * Math.sin((x + 75) / 150 * Math.PI + p);
        const y2 = base + amp * Math.sin((x + 150) / 150 * Math.PI + p);
        d += ` Q${x + 75} ${r2(y1)} ${x + 150} ${r2(y2)}`;
      }
      return d + ` V${H} H0 Z`;
    };
    return [pts(phase), pts(phase + Math.PI), pts(phase)].join(';');
  };
  const woods = forest(rand, [[40, HZ, 95, 4], [130, HZ, 75, 3], [230, HZ, 60, 2, 3], [970, HZ, 60, 2, 3], [1070, HZ, 75, 3], [1160, HZ, 95, 4]], { twinkle: 0.3 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thanks for visiting">
<defs>
<style>
${fontFaces()}
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:24px;letter-spacing:9px}
.m{font-family:${FONT_DISPLAY};font-weight:700;font-size:13px;letter-spacing:4px}
</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01030f"/><stop offset="1" stop-color="#0b4a6e"/></linearGradient>
<linearGradient id="bark" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="0"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="${C.lilac}"/></linearGradient>
<linearGradient id="w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b3a5c"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
<linearGradient id="w2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.ice}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0.3"/></linearGradient>
<linearGradient id="w3" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${C.bloom}" stop-opacity="0.25"/><stop offset="1" stop-color="${C.azure}" stop-opacity="0.25"/></linearGradient>
<linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.ice}"/></linearGradient>
${pyreflyDefs()}
${glow('g', 3)}
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g stroke="url(#bark)" stroke-linecap="round" opacity="0.3">${woods.branches}</g>
<g opacity="0.45">${woods.shards}</g>
<text x="${W / 2}" y="58" text-anchor="middle" class="h" fill="url(#tg)" filter="url(#g)">THANKS FOR VISITING</text>
<text x="${W / 2}" y="88" text-anchor="middle" class="m" fill="${C.frost}">~ UNTIL OUR PATHS CROSS AGAIN ~</text>
<path fill="url(#w3)"><animate attributeName="d" values="${wave(HZ + 6, 8, 0.8)}" dur="9s" repeatCount="indefinite"/></path>
<path fill="url(#w2)"><animate attributeName="d" values="${wave(HZ + 16, 7, 2)}" dur="7s" repeatCount="indefinite"/></path>
<path fill="url(#w1)"><animate attributeName="d" values="${wave(HZ + 28, 6, 0)}" dur="11s" repeatCount="indefinite"/></path>
${pyreflies(rand, 26, { x0: 0, x1: W, y0: H - 20, y1: 10, dMin: 8, dMax: 15 })}
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
