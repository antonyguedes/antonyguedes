// Generates the animated stats / languages / trophies cards from the GitHub API.
// Usage: GH_TOKEN=... node scripts/cards.mjs   (token optional for local runs)
import {
  C, FONT_DISPLAY, FONT_MONO, fontFaces, esc, glow, rng, r2, write,
  sparkle, pyreflyDefs, pyreflies, windowDefs, windowFrame, windowSheen,
} from './lib.mjs';

const USER = process.env.GH_USER || 'antonyguedes';

async function gh(path) {
  const headers = { 'User-Agent': 'github-actions', Accept: 'application/vnd.github+json' };
  if (process.env.GH_TOKEN) headers.Authorization = `token ${process.env.GH_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const user = await gh(`/users/${USER}`);
const repos = await gh(`/users/${USER}/repos?per_page=100`);
let commits;
try {
  commits = (await gh(`/search/commits?q=author:${USER}&per_page=1`)).total_count;
} catch (e) {
  console.warn(`commit search failed, skipping: ${e.message}`);
}

// Daily counts from the public contribution calendar (works without a token).
async function contributions() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, { headers: { 'User-Agent': 'github-actions' } });
  if (!res.ok) throw new Error(`contributions: ${res.status}`);
  const html = await res.text();
  const dates = {};
  for (const m of html.matchAll(/data-date="([\d-]+)" id="([^"]+)"/g)) dates[m[2]] = m[1];
  const counts = {};
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)</g)) {
    if (dates[m[1]]) counts[dates[m[1]]] = Number(/^(\d+) contribution/.exec(m[2])?.[1] || 0);
  }
  const days = Object.entries(counts).sort(([x], [y]) => x.localeCompare(y));
  if (days.length < 31) throw new Error('contributions: calendar not found');
  return days.slice(-31);
}
let days;
try {
  days = await contributions();
} catch (e) {
  console.warn(`activity graph skipped: ${e.message}`);
}

const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
const forks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
const years = new Date().getFullYear() - new Date(user.created_at).getFullYear();

const langCount = {};
for (const repo of repos) {
  if (repo.language) langCount[repo.language] = (langCount[repo.language] || 0) + (repo.size || 1);
}
const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
const totalSize = topLangs.reduce((s, [, v]) => s + v, 0);

const style = (extra = '') => `<style>
${fontFaces()}
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:15px;letter-spacing:4px}
.m{font-family:${FONT_MONO};font-size:12px}
.v{font-family:${FONT_DISPLAY};font-weight:800}
.in{opacity:0;animation:in .7s ease-out forwards}
@keyframes in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
${extra}
</style>`;

// Shiny orb: white highlight fading into the given color, then into the night.
const sphereGrad = (id, color) =>
  `<radialGradient id="${id}" cx="0.36" cy="0.3" r="0.75"><stop offset="0" stop-color="#fff"/><stop offset="0.25" stop-color="${color}"/><stop offset="1" stop-color="${C.winBot}"/></radialGradient>`;

const card = (W, H, label, body, aria, extraDefs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">
<defs>${style()}
${windowDefs()}
${pyreflyDefs()}
${glow('g', 2.5)}${glow('g6', 5)}
${extraDefs}
</defs>
${windowFrame(1, 1, W - 2, H - 2, 10)}
<g opacity="0.55">${pyreflies(rng(W + H), 8, { x0: 20, x1: W - 20, y0: H - 6, y1: 20, rMin: 0.8, rMax: 1.6, dMin: 7, dMax: 12, sway: 40 })}</g>
<path transform="translate(26 31)" d="M0 -6L4 0L0 6L-4 0Z" fill="${C.ice}" filter="url(#g)"/>
<text x="38" y="36" class="h" fill="#fff" filter="url(#g)">${label}</text>
<line x1="20" y1="50" x2="${W - 20}" y2="50" stroke="${C.silver}" stroke-opacity="0.3"/>
${body}
${windowSheen(1, 1, W - 2, H - 2, { dur: 8 })}
</svg>`;

// ───────────────────────────── STATS ─────────────────────────────
function statsCard() {
  const W = 495, H = 195;
  const score = stars * 4 + forks * 3 + user.followers * 2 + user.public_repos + Math.round((commits || 0) / 20);
  const tiers = [['S+', 1000], ['S', 500], ['A+', 250], ['A', 120], ['B+', 60], ['B', 30], ['C', 0]];
  const ti = tiers.findIndex(([, min]) => score >= min);
  const [rank, floor] = tiers[ti];
  const ceil = ti > 0 ? tiers[ti - 1][1] : floor;
  const pct = ti > 0 ? (score - floor) / (ceil - floor) : 1;

  const rows = [
    ['Total Stars', stars, C.gold],
    ['Total Forks', forks, C.ice],
    ['Public Repos', user.public_repos, C.frost],
    ['Followers', user.followers, C.aqua],
    ...(commits != null ? [['Commits', commits, C.lilac]] : []),
  ];
  const rowH = rows.length > 4 ? 25 : 30;
  const list = rows.map(([label, value, col], i) => {
    const y = 76 + i * rowH;
    return `<g class="in" style="animation-delay:${r2(0.2 + i * 0.15)}s">
  <path transform="translate(29 ${y - 4})" d="M0 -6L4 0L0 6L-4 0Z" fill="${col}" filter="url(#g)"/>
  <text x="44" y="${y}" class="m" fill="${C.text}">${label}</text>
  <line x1="${48 + label.length * 7.2}" y1="${y - 4}" x2="${262 - String(value).length * 12}" y2="${y - 4}" stroke="${C.silver}" stroke-opacity="0.35" stroke-dasharray="2 4"/>
  <text x="270" y="${y}" text-anchor="end" class="v" font-size="16" fill="${col}" filter="url(#g)">${value}</text>
</g>`;
  }).join('\n');

  const R = 44, CX = 395, CY = 116, CIRC = r2(2 * Math.PI * (R + 7));
  const body = `${list}
<text x="${W - 22}" y="36" text-anchor="end" class="m" fill="${C.frost}">// ${esc(user.login)}</text>
<g>
  <circle cx="${CX}" cy="${CY}" r="${R + 15}" fill="none" stroke="${C.frost}" stroke-opacity="0.45" stroke-dasharray="1 5">
    <animateTransform attributeName="transform" type="rotate" values="0 ${CX} ${CY};360 ${CX} ${CY}" dur="24s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${CX}" cy="${CY}" r="${R + 7}" fill="none" stroke="${C.line}" stroke-width="4"/>
  <circle cx="${CX}" cy="${CY}" r="${R + 7}" fill="none" stroke="url(#ring)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}" transform="rotate(-90 ${CX} ${CY})" filter="url(#g)">
    <animate attributeName="stroke-dashoffset" from="${CIRC}" to="${r2(CIRC * (1 - pct))}" dur="1.8s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
  </circle>
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#orb)" filter="url(#g)"><animate attributeName="r" values="${R};${R - 2};${R}" dur="4s" repeatCount="indefinite"/></circle>
  <text x="${CX}" y="${CY + 10}" text-anchor="middle" class="v" font-size="30" fill="#fff" filter="url(#g6)">${rank}</text>
  <text x="${CX}" y="${CY + 28}" text-anchor="middle" class="h" font-size="8" letter-spacing="3" fill="${C.snow}">RANK</text>
  <g transform="translate(${CX - 20} ${CY - 26})"><path d="${sparkle(7)}" fill="#fff" transform="scale(0)"><animateTransform attributeName="transform" type="scale" values="0;1;0;0" keyTimes="0;0.08;0.16;1" dur="5s" begin="2s" repeatCount="indefinite"/></path></g>
</g>`;
  return card(W, H, 'GITHUB STATS', body,
    `${USER}: ${stars} stars, ${forks} forks, ${user.public_repos} repos, ${user.followers} followers, rank ${rank}`,
    `${sphereGrad('orb', C.azure)}<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.aqua}"/><stop offset="1" stop-color="${C.bloom}"/></linearGradient>`);
}

// ──────────────────────────── LANGUAGES ───────────────────────────
function langsCard() {
  const W = 495, ROW = 26, TOP = 100;
  const H = TOP + topLangs.length * ROW + 10;
  const colors = [C.ice, C.bloom, C.aqua, C.lilac, C.gold, C.azure];
  const BAR = W - 50;
  let x = 25;
  const spectrum = topLangs.map(([, size], i) => {
    const w = r2(size / totalSize * BAR);
    const seg = `<rect x="${r2(x)}" y="64" width="0" height="9" fill="url(#bar${i})" filter="url(#g)"><animate attributeName="width" from="0" to="${w}" dur="0.5s" begin="${r2(0.2 + i * 0.25)}s" fill="freeze"/></rect>`;
    x += w;
    return seg;
  }).join('');
  const TRACK_X = 140, TRACK_W = 255;
  const rows = topLangs.map(([lang, size], i) => {
    const y = TOP + i * ROW;
    const p = size / totalSize;
    const w = r2(Math.max(p * TRACK_W / (topLangs[0][1] / totalSize), 4));
    return `<g class="in" style="animation-delay:${r2(0.3 + i * 0.12)}s">
  <circle cx="30" cy="${y - 4}" r="4.5" fill="url(#sp${i})" filter="url(#g)"/>
  <text x="44" y="${y}" class="m" fill="${C.text}">${esc(lang)}</text>
  <rect x="${TRACK_X}" y="${y - 9}" width="${TRACK_W}" height="7" rx="1.5" fill="${C.winBot}" stroke="${C.silver}" stroke-opacity="0.35" stroke-width="0.8"/>
  <rect x="${TRACK_X}" y="${y - 9}" width="0" height="7" rx="1.5" fill="url(#bar${i})" filter="url(#g)"><animate attributeName="width" from="0" to="${w}" dur="1.3s" begin="${r2(0.5 + i * 0.12)}s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/></rect>
  <text x="${W - 25}" y="${y}" text-anchor="end" class="v" font-size="12" fill="${colors[i]}">${(p * 100).toFixed(1)}%</text>
</g>`;
  }).join('\n');

  const defs = colors.map((c, i) =>
    `<linearGradient id="bar${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0.6"/></linearGradient>${sphereGrad(`sp${i}`, c)}`,
  ).join('');
  const body = `<text x="${W - 22}" y="36" text-anchor="end" class="m" fill="${C.frost}">// by repo size</text>
<rect x="25" y="64" width="${BAR}" height="9" fill="${C.winBot}" stroke="${C.silver}" stroke-opacity="0.35" stroke-width="0.8"/>
${spectrum}
${rows}`;
  return card(W, H, 'TOP LANGUAGES', body,
    'Top languages: ' + topLangs.map(([l, s]) => `${l} ${(s / totalSize * 100).toFixed(1)}%`).join(', '), defs);
}

// ──────────────────────────── TROPHIES ────────────────────────────
// Rendered as nodes on a sphere grid, linked by a path that light travels along.
function trophiesCard() {
  const rank = (value, tiers) => {
    for (const [label, min] of tiers) if (value >= min) return label;
    return 'C';
  };
  const trophies = [
    { title: 'STARS', value: stars, rank: rank(stars, [['SSS', 2000], ['SS', 500], ['S', 100], ['AAA', 50], ['AA', 20], ['A', 10], ['B', 5]]) },
    { title: 'FOLLOWERS', value: user.followers, rank: rank(user.followers, [['SSS', 1000], ['SS', 500], ['S', 200], ['AAA', 100], ['AA', 50], ['A', 20], ['B', 10]]) },
    { title: 'FORKS', value: forks, rank: rank(forks, [['SSS', 500], ['SS', 200], ['S', 100], ['AAA', 50], ['AA', 20], ['A', 10], ['B', 5]]) },
    { title: 'REPOS', value: user.public_repos, rank: rank(user.public_repos, [['SSS', 100], ['SS', 50], ['S', 30], ['AAA', 20], ['AA', 10], ['A', 5], ['B', 2]]) },
    { title: 'EXPERIENCE', value: `${years}y`, rank: rank(years, [['SSS', 10], ['SS', 7], ['S', 5], ['AAA', 3], ['AA', 2], ['A', 1], ['B', 0]]) },
    commits != null
      ? { title: 'COMMITS', value: commits, rank: rank(commits, [['SSS', 5000], ['SS', 2000], ['S', 1000], ['AAA', 500], ['AA', 200], ['A', 100], ['B', 20]]) }
      : { title: 'COMMITS', value: '—', rank: 'C' },
  ];
  const rankColor = { SSS: C.gold, SS: C.snow, S: C.bloom, AAA: C.ice, AA: C.lilac, A: C.aqua, B: C.azure, C: '#64748b' };
  const TW = 130, W = trophies.length * TW + 20, H = 180, R = 36;
  const nodes = trophies.map((t, i) => [10 + TW * i + TW / 2, i % 2 ? 80 : 64]);
  const path = 'M' + nodes.map(([x, y]) => `${x} ${y}`).join(' L');

  const cards = trophies.map((t, i) => {
    const c = rankColor[t.rank];
    const [cx, cy] = nodes[i];
    return `<g transform="translate(${cx} ${cy})">
<g class="bob" style="animation-delay:${r2(-i * 0.6)}s">
  <circle r="${R + 12}" fill="url(#halo${i})"/>
  <circle r="${R + 7}" fill="none" stroke="${c}" stroke-opacity="0.6" stroke-dasharray="1 5">
    <animateTransform attributeName="transform" type="rotate" values="0;${i % 2 ? -360 : 360}" dur="${18 + i * 2}s" repeatCount="indefinite"/>
  </circle>
  <circle r="${R}" fill="url(#sp${i})" stroke="${C.silver}" stroke-opacity="0.6"/>
  <ellipse cx="-10" cy="-16" rx="14" ry="7" fill="#fff" opacity="0.35" transform="rotate(-30 -10 -16)"/>
  <text y="7" text-anchor="middle" class="v" font-size="${t.rank.length > 2 ? 18 : 22}" fill="#fff" filter="url(#g6)">${t.rank}</text>
  <g transform="translate(${R - 6} ${-R + 6})"><path d="${sparkle(6)}" fill="#fff" transform="scale(0)"><animateTransform attributeName="transform" type="scale" values="0;1;0;0" keyTimes="0;0.06;0.12;1" dur="6s" begin="${r2(i * 1)}s" repeatCount="indefinite"/></path></g>
</g>
<text y="${R + 28}" text-anchor="middle" class="h" font-size="10" letter-spacing="2" fill="${C.snow}">${t.title}</text>
<text y="${R + 44}" text-anchor="middle" class="m" font-size="11" fill="${c}">${esc(t.value)}</text>
</g>`;
  }).join('\n');

  const defs = trophies.map((t, i) => {
    const c = rankColor[t.rank];
    return sphereGrad(`sp${i}`, c) +
      `<radialGradient id="halo${i}"><stop offset="0.6" stop-color="${c}" stop-opacity="0.3"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Trophies: ' + trophies.map((t) => `${t.title} ${t.rank}`).join(', '))}">
<defs>${style(`.bob{animation:bob 4s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-5px)}}`)}
${windowDefs()}
${pyreflyDefs()}
${defs}
${glow('g', 2.5)}${glow('g6', 4)}
</defs>
${windowFrame(1, 1, W - 2, H - 2, 10)}
<path d="${path}" fill="none" stroke="${C.frost}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="4 6"/>
<g opacity="0"><circle r="10" fill="url(#pf0)"/><circle r="2.5" fill="#fff"/>
  <animateMotion path="${path}" dur="6s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="6s" repeatCount="indefinite"/>
</g>
${cards}
${windowSheen(1, 1, W - 2, H - 2, { dur: 9 })}
</svg>`;
}

// ──────────────────────────── ACTIVITY ────────────────────────────
function activityCard() {
  const W = 495, H = 100 + topLangs.length * 26 + 10;
  const X0 = 50, X1 = W - 25, Y0 = 72, Y1 = H - 42;
  const max = Math.max(...days.map(([, n]) => n), 1);
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * 4;
  const px = (i) => r2(X0 + (X1 - X0) * i / (days.length - 1));
  const py = (n) => r2(Y1 - (Y1 - Y0) * n / top);
  const pts = days.map(([, n], i) => [px(i), py(n)]);
  const line = 'M' + pts.map(([x, y]) => `${x} ${y}`).join(' L');
  const len = Math.ceil(pts.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - pts[i][0], y - pts[i][1]), 0));
  const total = days.reduce((s, [, n]) => s + n, 0);
  const fmt = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  const grid = Array.from({ length: 5 }, (_, k) => {
    const v = step * k, y = py(v);
    return `<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="${C.silver}" stroke-opacity="${k ? 0.12 : 0.35}"/>
<text x="${X0 - 8}" y="${y + 3}" text-anchor="end" class="m" font-size="9" fill="${C.frost}">${v}</text>`;
  }).join('');
  const xLabels = days.map(([d], i) => (i % 6 === 0 || i === days.length - 1)
    ? `<text x="${px(i)}" y="${Y1 + 16}" text-anchor="middle" class="m" font-size="9" fill="${C.frost}">${fmt(d)}</text>` : '').join('');
  const dots = pts.map(([x, y], i) => days[i][1]
    ? `<g transform="translate(${x} ${y})"><circle r="6" fill="url(#pf5)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${r2(0.3 + 1.8 * i / days.length)}s" fill="freeze"/></circle><circle r="2.2" fill="#fff" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${r2(0.3 + 1.8 * i / days.length)}s" fill="freeze"/></circle></g>`
    : '').join('');

  const body = `<text x="${W - 22}" y="36" text-anchor="end" class="m" fill="${C.frost}">// last 31 days · ${total} contributions</text>
${grid}${xLabels}
<path d="${line} L${X1} ${Y1} L${X0} ${Y1} Z" fill="url(#area)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="1s" begin="1.6s" fill="freeze"/></path>
<path d="${line}" fill="none" stroke="url(#stroke)" stroke-width="2.2" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len}" filter="url(#g)">
  <animate attributeName="stroke-dashoffset" from="${len}" to="0" dur="2s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/>
</path>
${dots}
<g opacity="0"><circle r="9" fill="url(#pf0)"/><circle r="2.5" fill="#fff"/>
  <animateMotion path="${line}" dur="7s" begin="2.5s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="7s" begin="2.5s" repeatCount="indefinite"/>
</g>`;
  return card(W, H, 'ACTIVITY', body, `${total} contributions in the last 31 days`,
    `<linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ice}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0"/></linearGradient>
<linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.aqua}"/><stop offset="0.5" stop-color="${C.ice}"/><stop offset="1" stop-color="${C.bloom}"/></linearGradient>`);
}

write('assets/stats.svg', statsCard());
write('assets/langs.svg', langsCard());
write('assets/trophies.svg', trophiesCard());
if (days) write('assets/activity.svg', activityCard());
