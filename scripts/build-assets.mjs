// Generates the static animated SVGs used by the README.
// Usage: node scripts/build-assets.mjs
import { C, MONO_ADVANCE, FONT_DISPLAY, FONT_MONO, fontFaces, esc, glow, rng, r2, timeline, write } from './lib.mjs';

// ───────────────────────────── HEADER ─────────────────────────────
function header() {
  const W = 1200, H = 360, HZ = 270, VX = 600;
  const rand = rng(7);

  const stars = Array.from({ length: 70 }, () => {
    const x = r2(rand() * W), y = r2(rand() * (HZ - 40));
    const r = r2(0.4 + rand() * 1.2), d = r2(2 + rand() * 4), b = r2(-rand() * 6);
    const c = rand() > 0.8 ? C.cyan : rand() > 0.6 ? C.soft : '#ffffff';
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"><animate attributeName="opacity" values="0.15;1;0.15" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
  }).join('');

  // Blockchain skyline on both sides of the sun
  const buildings = [];
  const windows = [];
  const skyline = (from, to) => {
    let x = from;
    while (x < to) {
      const w = 26 + Math.floor(rand() * 34), h = 18 + Math.floor(rand() * 58);
      buildings.push(`<rect x="${x}" y="${HZ - h}" width="${w}" height="${h}" />`);
      for (let wy = HZ - h + 6; wy < HZ - 6; wy += 9) {
        for (let wx = x + 5; wx < x + w - 5; wx += 8) {
          if (rand() > 0.72) {
            const d = r2(1.5 + rand() * 5), b = r2(-rand() * 5);
            const c = rand() > 0.5 ? C.cyan : C.pink;
            windows.push(`<rect x="${wx}" y="${wy}" width="3" height="3" fill="${c}"><animate attributeName="opacity" values="1;0.2;1;1" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></rect>`);
          }
        }
      }
      x += w + 2 + Math.floor(rand() * 8);
    }
  };
  skyline(0, 470);
  skyline(735, W);

  // Perspective grid floor
  const verticals = Array.from({ length: 31 }, (_, i) => {
    const k = i - 15;
    return `<line x1="${VX + k * 10}" y1="${HZ}" x2="${VX + k * 140}" y2="${H}"/>`;
  }).join('');
  const N = 8, GD = 4;
  const horizontals = Array.from({ length: N }, (_, i) =>
    `<g><line x1="0" y1="${HZ}" x2="${W}" y2="${HZ}"/>` +
    `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${H - HZ}" keyTimes="0;1" calcMode="spline" keySplines="0.55 0 1 0.45" dur="${GD}s" begin="${r2(-i * GD / N)}s" repeatCount="indefinite"/>` +
    `<animate attributeName="opacity" values="0;1" dur="${GD}s" begin="${r2(-i * GD / N)}s" repeatCount="indefinite"/></g>`
  ).join('');

  const particles = Array.from({ length: 26 }, () => {
    const x = r2(rand() * W), d = r2(5 + rand() * 7), b = r2(-rand() * 12), r = r2(0.8 + rand() * 1.6);
    const c = rand() > 0.5 ? C.cyan : C.pink;
    return `<circle cx="${x}" cy="${HZ}" r="${r}" fill="${c}" filter="url(#g2)">` +
      `<animate attributeName="cy" values="${HZ};${40 + rand() * 80}" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;1;0" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
  }).join('');

  const corner = (x, y, sx, sy) =>
    `<path d="M${x} ${y + sy * 26} V${y} H${x + sx * 26}" />`;

  const title = 'ANTONIO GUEDES';
  const sub = 'FULL STACK  ·  WEB3  ·  DLT  ·  AI';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Antonio Guedes — Full Stack · Web3 · DLT · AI">
<defs>
<style>
${fontFaces()}
.title{font-family:${FONT_DISPLAY};font-weight:900;font-size:66px;letter-spacing:8px}
.sub{font-family:${FONT_DISPLAY};font-weight:500;font-size:19px;letter-spacing:7px;fill:${C.soft}}
.mono{font-family:${FONT_MONO};font-size:13px;letter-spacing:2px}
.boot{animation:boot 1.6s ease-out both}
@keyframes boot{0%{opacity:0;filter:blur(12px)}40%{opacity:.4}45%{opacity:.1}60%{opacity:1;filter:blur(0)}70%{opacity:.6}100%{opacity:1}}
.gl1{animation:gl1 5s steps(1) infinite}
.gl2{animation:gl2 5s steps(1) infinite}
@keyframes gl1{0%,86%,100%{opacity:0;transform:translate(0,0)}87%{opacity:.85;transform:translate(-7px,-2px)}89%{transform:translate(5px,1px)}91%{transform:translate(-3px,2px)}93%{opacity:.85;transform:translate(8px,0)}94%{opacity:0}}
@keyframes gl2{0%,86%,100%{opacity:0;transform:translate(0,0)}87%{opacity:.85;transform:translate(6px,2px)}89%{transform:translate(-6px,-1px)}91%{transform:translate(4px,-2px)}93%{opacity:.85;transform:translate(-8px,1px)}94%{opacity:0}}
.blink{animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.bg0}"/><stop offset="0.6" stop-color="#14063a"/><stop offset="1" stop-color="#2a0b5e"/>
</linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1a0640"/><stop offset="1" stop-color="${C.bg0}"/>
</linearGradient>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.pink}"/><stop offset="0.55" stop-color="#c026d3"/><stop offset="1" stop-color="${C.violet}"/>
</linearGradient>
<linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox" spreadMethod="reflect">
  <stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.pink}"/>
  <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0" dur="6s" repeatCount="indefinite"/>
</linearGradient>
<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.cyan}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
</linearGradient>
<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="${C.pink}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/>
</radialGradient>
<mask id="sunStripes">
  <rect x="${VX - 110}" y="${HZ - 110}" width="220" height="110" fill="#fff"/>
  <g fill="#000">
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${VX - 110}" y="0" width="220" height="${2 + i * 1.4}"><animate attributeName="y" values="${HZ - 70};${HZ}" dur="3s" begin="${r2(-i * 0.5)}s" repeatCount="indefinite"/></rect>`).join('')}
  </g>
</mask>
<clipPath id="floorClip"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
<clipPath id="sliceTop"><rect x="0" y="70" width="${W}" height="34"/></clipPath>
<clipPath id="sliceBot"><rect x="0" y="104" width="${W}" height="40"/></clipPath>
<clipPath id="subReveal"><rect x="0" y="0" width="0" height="${H}"><animate attributeName="width" from="0" to="${W}" dur="2.2s" begin="1s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/></rect></clipPath>
${glow('g2', 2)}${glow('g4', 4)}${glow('g8', 8)}
</defs>

<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars}

<!-- synthwave sun -->
<circle cx="${VX}" cy="${HZ - 20}" r="190" fill="url(#halo)"><animate attributeName="r" values="180;205;180" dur="5s" repeatCount="indefinite"/></circle>
<circle cx="${VX}" cy="${HZ}" r="105" fill="url(#sun)" mask="url(#sunStripes)" filter="url(#g4)"/>

<!-- skyline -->
<g fill="#0a0320" stroke="${C.violet}" stroke-opacity="0.35" stroke-width="1">${buildings.join('')}</g>
<g>${windows.join('')}</g>

<!-- grid floor -->
<rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#floor)"/>
<g clip-path="url(#floorClip)" stroke="${C.pink}" stroke-width="1.2" stroke-opacity="0.55" filter="url(#g2)">
  ${verticals}
  ${horizontals}
</g>
<line x1="0" y1="${HZ}" x2="${W}" y2="${HZ}" stroke="${C.pink}" stroke-width="2" filter="url(#g4)"><animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/></line>

${particles}

<!-- title -->
<g class="boot">
  <text x="${VX}" y="54" text-anchor="middle" class="mono" fill="${C.cyan}">&lt;/&gt; INITIALIZING DEV PROFILE<tspan class="blink"> █</tspan></text>
  <g class="gl1" clip-path="url(#sliceTop)"><text x="${VX}" y="128" text-anchor="middle" class="title" fill="${C.cyan}">${title}</text></g>
  <g class="gl2" clip-path="url(#sliceBot)"><text x="${VX}" y="128" text-anchor="middle" class="title" fill="${C.pink}">${title}</text></g>
  <text x="${VX}" y="128" text-anchor="middle" class="title" fill="url(#titleGrad)" filter="url(#g4)">${title}</text>
</g>
<g clip-path="url(#subReveal)">
  <text x="${VX}" y="170" text-anchor="middle" class="sub" filter="url(#g2)">${esc(sub)}</text>
</g>

<!-- HUD -->
<g fill="none" stroke="${C.cyan}" stroke-width="2" filter="url(#g2)" opacity="0.85">
  ${corner(18, 18, 1, 1)}${corner(W - 18, 18, -1, 1)}${corner(18, H - 18, 1, -1)}${corner(W - 18, H - 18, -1, -1)}
</g>
<g class="mono" font-size="11" fill="${C.cyan}" opacity="0.85">
  <text x="52" y="40">SYS://PROFILE.v2</text>
  <text x="${W - 52}" y="40" text-anchor="end"><tspan fill="#4ade80" class="blink">●</tspan> ONLINE</text>
  <text x="52" y="${H - 30}">LAT -21.1356 · LON -44.2614</text>
  <text x="${W - 52}" y="${H - 30}" text-anchor="end">UFSJ · MG · BRASIL</text>
</g>

<!-- scanline -->
<rect x="0" y="-60" width="${W}" height="60" fill="url(#scan)"><animate attributeName="y" values="-60;${H}" dur="5s" repeatCount="indefinite"/></rect>
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
  const PREFIX = '> ';
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
    // never delete the "> " prefix — only the text after it
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
  <text x="${x0}" y="36" class="t" clip-path="url(#c${i})"><tspan fill="${C.cyan}">${esc(PREFIX)}</tspan><tspan fill="url(#tg)">${esc(l)}</tspan></text>
  <rect y="14" width="${r2(CW * 0.8)}" height="28" fill="${C.cyan}" class="cur" filter="url(#g)"><animate attributeName="x" calcMode="discrete" values="${xs.values}" keyTimes="${xs.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect>
</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(lines.join(' · '))}">
<defs>
<style>
${fontFaces({ orbitron: false })}
.t{font-family:${FONT_MONO};font-size:${FS}px;font-weight:700;font-variant-ligatures:none;white-space:pre}
.cur{animation:blink .8s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
</style>
<linearGradient id="tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.pink}"/></linearGradient>
${glow('g', 3)}
</defs>
${groups.join('\n')}
</svg>`;
}

// ──────────────────────────── TERMINAL ────────────────────────────
function terminal() {
  const FS = 14, CW = FS * MONO_ADVANCE, LH = 24, PAD = 28, TOP = 64;
  const K = C.pink, ID = C.cyan, KEY = C.lilac, STR = C.green, P = '#94a3b8';
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
  const prompt = (cmd) => [['antonio@guedes', C.green], [':', P], ['~/profile', C.cyan], [' $ ', P], [cmd, C.text]];
  const PROMPT_LEN = 'antonio@guedes:~/profile $ '.length;
  const rows = [
    { toks: prompt('cat developer.ts'), typeFrom: PROMPT_LEN, speed: 0.08 },
    ...code.map((toks) => ({ toks, typeFrom: 0, speed: 0.012 })),
    { toks: prompt(''), typeFrom: PROMPT_LEN, speed: 0, final: true },
  ];

  const W = 900, H = TOP + rows.length * LH + PAD;
  const HOLD = 7;
  // Build each row's reveal schedule
  let t = 0.6;
  const sched = rows.map((r) => {
    const n = r.toks.reduce((s, [x]) => s + x.length, 0);
    const startT = t;
    const steps = [];
    if (r.typeFrom) steps.push([startT, r.typeFrom]);
    for (let c = r.typeFrom + 1; c <= n; c++) steps.push([startT + (c - r.typeFrom) * r.speed, c]);
    t = steps.length ? steps[steps.length - 1][0] + (r.speed > 0.05 ? 0.5 : 0.12) : t;
    return { n, steps };
  });
  const DUR = r2(t + HOLD);

  const body = rows.map((r, i) => {
    const y = TOP + i * LH + 16;
    const { n, steps } = sched[i];
    const ev = [[0, 0], ...steps.map(([tt, c]) => [r2(tt), r2(c * CW)]), [r2(DUR - 0.4), 0]];
    const wt = timeline(ev, DUR);
    const tspans = r.toks.map(([s, col]) => `<tspan fill="${col}">${esc(s)}</tspan>`).join('');
    let cursor = '';
    if (r.final) {
      const vis = timeline([[0, 'hidden'], [r2(steps[0][0]), 'visible'], [r2(DUR - 0.4), 'hidden']], DUR);
      cursor = `<rect x="${PAD + n * CW + 2}" y="${y - 13}" width="${r2(CW)}" height="17" fill="${C.cyan}" visibility="hidden" class="cur" filter="url(#g)"><animate attributeName="visibility" calcMode="discrete" values="${vis.values}" keyTimes="${vis.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect>`;
    }
    return `<clipPath id="r${i}"><rect x="${PAD}" y="${y - 18}" height="${LH}" width="0"><animate attributeName="width" calcMode="discrete" values="${wt.values}" keyTimes="${wt.keyTimes}" dur="${DUR}s" repeatCount="indefinite"/></rect></clipPath>
<text x="${PAD}" y="${y}" class="code" clip-path="url(#r${i})">${tspans}</text>${cursor}`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="const developer = { name: Antonio Guedes, role: Computer Scientist, Software Engineer, Full Stack Dev, specialty: Hyperledger Tech }">
<defs>
<style>
${fontFaces()}
.code{font-family:${FONT_MONO};font-size:${FS}px;font-variant-ligatures:none;white-space:pre}
.ttl{font-family:${FONT_MONO};font-size:12px;fill:${C.muted};letter-spacing:1px}
.cur{animation:blink .9s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.flick{animation:flick 6s infinite}
@keyframes flick{0%,100%{opacity:1}48%{opacity:1}49%{opacity:.85}50%{opacity:1}51%{opacity:.9}52%{opacity:1}}
</style>
<linearGradient id="bd" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.pink}"/>
</linearGradient>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0618"/><stop offset="1" stop-color="${C.panel}"/></linearGradient>
<pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#ffffff" opacity="0.025"/></pattern>
<linearGradient id="sweep" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0.07"/>
</linearGradient>
<clipPath id="win"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12"/></clipPath>
${glow('g', 2.5)}
</defs>
<g class="flick">
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="url(#bg)"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="none" stroke="url(#bd)" stroke-width="1.5" opacity="0.5"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="none" stroke="url(#bd)" stroke-width="2.5" stroke-dasharray="180 ${2 * (W + H)}" filter="url(#g)">
  <animate attributeName="stroke-dashoffset" values="0;-${2 * (W + H) + 180}" dur="7s" repeatCount="indefinite"/>
</rect>
<path d="M1 40 H${W - 1}" stroke="${C.line}"/>
<circle cx="26" cy="21" r="6" fill="#ff5f57"/><circle cx="46" cy="21" r="6" fill="#febc2e"/><circle cx="66" cy="21" r="6" fill="#28c840"/>
<text x="${W / 2}" y="25" text-anchor="middle" class="ttl">antonio@guedes: ~/profile — zsh</text>
<text x="${W - 22}" y="25" text-anchor="end" class="ttl" fill="${C.cyan}">● REC</text>
${body}
<g clip-path="url(#win)">
  <rect width="${W}" height="${H}" fill="url(#scanlines)"/>
  <rect x="0" y="-80" width="${W}" height="80" fill="url(#sweep)"><animate attributeName="y" values="-80;${H}" dur="4s" repeatCount="indefinite"/></rect>
</g>
</g>
</svg>`;
}

// ──────────────────────────── SECTIONS ────────────────────────────
function section(idx, title, label) {
  const W = 900, H = 70, Y = 35;
  const titleW = title.length * 22 + 10; // rough Orbitron width at 24px + spacing
  const lineX = 92 + titleW;
  const lineEnd = W - 20 - label.length * 7.8 - 26;
  const hex = (r) => Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 3 * i - Math.PI / 2;
    return `${r2(40 + r * Math.cos(a))},${r2(Y + r * Math.sin(a))}`;
  }).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
<defs>
<style>
${fontFaces()}
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:24px;letter-spacing:4px}
.m{font-family:${FONT_MONO};font-size:13px}
.on{animation:on 1.4s ease-out both}
@keyframes on{0%{opacity:0}20%{opacity:.8}25%{opacity:.1}45%{opacity:1}55%{opacity:.4}70%,100%{opacity:1}}
</style>
<linearGradient id="tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.violet}"/><stop offset="0.5" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
<linearGradient id="ln" gradientUnits="userSpaceOnUse" x1="${lineX}" y1="0" x2="${r2(lineEnd)}" y2="0"><stop offset="0" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0.15"/></linearGradient>
${glow('g', 2.5)}
</defs>
<polygon points="${hex(24)}" fill="none" stroke="${C.lilac}" stroke-width="1.5" stroke-dasharray="6 4" filter="url(#g)">
  <animateTransform attributeName="transform" type="rotate" values="0 40 ${Y};360 40 ${Y}" dur="14s" repeatCount="indefinite"/>
</polygon>
<polygon points="${hex(17)}" fill="${C.violet}" fill-opacity="0.18" stroke="${C.cyan}" stroke-width="1.2"/>
<text x="40" y="${Y + 5}" text-anchor="middle" class="m" font-weight="700" fill="${C.cyan}">${idx}</text>
<text x="80" y="${Y + 9}" class="h on" fill="url(#tg)" filter="url(#g)">${esc(title)}</text>
<line x1="${lineX}" y1="${Y}" x2="${lineX}" y2="${Y}" stroke="url(#ln)" stroke-width="1.5">
  <animate attributeName="x2" from="${lineX}" to="${r2(lineEnd)}" dur="1.2s" begin="0.4s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
</line>
<circle cy="${Y}" r="2.5" fill="${C.cyan}" filter="url(#g)">
  <animate attributeName="cx" values="${lineX};${r2(lineEnd)}" dur="3s" begin="1.6s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3s" begin="1.6s" repeatCount="indefinite"/>
</circle>
<text x="${W - 20}" y="${Y + 4}" text-anchor="end" class="m" fill="${C.muted}">[ <tspan fill="${C.lilac}">${esc(label)}</tspan> ]</text>
</svg>`;
}

// ───────────────────────────── FOOTER ─────────────────────────────
function footer() {
  const W = 1200, H = 200;
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thanks for visiting">
<defs>
<style>
${fontFaces()}
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:22px;letter-spacing:8px}
.m{font-family:${FONT_MONO};font-size:13px;letter-spacing:2px}
.blink{animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
</style>
<linearGradient id="w1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f0c29"/><stop offset="0.5" stop-color="#302b63"/><stop offset="1" stop-color="#24243e"/></linearGradient>
<linearGradient id="w2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.violet}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0.35"/></linearGradient>
<linearGradient id="w3" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${C.pink}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0.25"/></linearGradient>
<linearGradient id="tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.pink}"/></linearGradient>
${glow('g', 3)}
</defs>
<text x="${W / 2}" y="46" text-anchor="middle" class="h" fill="url(#tg)" filter="url(#g)">THANKS FOR VISITING</text>
<text x="${W / 2}" y="74" text-anchor="middle" class="m" fill="${C.lilac}">// end of transmission<tspan class="blink" fill="${C.cyan}"> █</tspan></text>
<path fill="url(#w3)"><animate attributeName="d" values="${wave(120, 14, 0.8)}" dur="9s" repeatCount="indefinite"/></path>
<path fill="url(#w2)"><animate attributeName="d" values="${wave(132, 12, 2)}" dur="7s" repeatCount="indefinite"/></path>
<path fill="url(#w1)"><animate attributeName="d" values="${wave(148, 10, 0)}" dur="11s" repeatCount="indefinite"/></path>
</svg>`;
}

write('assets/header.svg', header());
write('assets/typing.svg', typing());
write('assets/terminal.svg', terminal());
write('assets/footer.svg', footer());
for (const [file, idx, title, label] of [
  ['about', '01', 'ABOUT ME', 'whoami'],
  ['stack', '02', 'TECH STACK', 'ls ~/stack'],
  ['stats', '03', 'GITHUB STATS', 'git log --stat'],
  ['trophies', '04', 'TROPHIES', 'achievements.json'],
  ['contrib', '05', 'CONTRIBUTIONS', 'snake.run()'],
]) write(`assets/sections/${file}.svg`, section(idx, title, label));
