// Generates the animated stats / languages / trophies cards from the GitHub API.
// Usage: GH_TOKEN=... node scripts/cards.mjs   (token optional for local runs)
import { C, FONT_DISPLAY, FONT_MONO, fontFaces, esc, glow, r2, write } from './lib.mjs';

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
.h{font-family:${FONT_DISPLAY};font-weight:800;font-size:14px;letter-spacing:3px}
.m{font-family:${FONT_MONO};font-size:12px}
.v{font-family:${FONT_DISPLAY};font-weight:700}
.in{opacity:0;animation:in .6s ease-out forwards}
@keyframes in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
${extra}
</style>`;

// Animated neon frame shared by the stats and languages cards
const frame = (W, H) => `
<linearGradient id="bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.pink}"/></linearGradient>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b0620"/><stop offset="1" stop-color="${C.panel}"/></linearGradient>
<linearGradient id="sweep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0.08"/></linearGradient>
<pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="${C.lilac}" stroke-opacity="0.06"/></pattern>
<clipPath id="card"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10"/></clipPath>
${glow('g', 2.5)}${glow('g6', 6)}
</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="url(#bg)"/>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="0" y="-60" width="${W}" height="60" fill="url(#sweep)"><animate attributeName="y" values="-60;${H}" dur="4.5s" repeatCount="indefinite"/></rect>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="none" stroke="url(#bd)" stroke-opacity="0.45"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="none" stroke="url(#bd)" stroke-width="2" stroke-dasharray="120 ${2 * (W + H)}" filter="url(#g)">
  <animate attributeName="stroke-dashoffset" values="0;-${2 * (W + H) + 120}" dur="6s" repeatCount="indefinite"/>
</rect>`;

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
    ['Total Stars', stars, C.lilac],
    ['Total Forks', forks, C.cyan],
    ['Public Repos', user.public_repos, C.pink],
    ['Followers', user.followers, C.green],
    ...(commits != null ? [['Commits', commits, '#fbbf24']] : []),
  ];
  const rowH = rows.length > 4 ? 25 : 30;
  const list = rows.map(([label, value, col], i) => {
    const y = 74 + i * rowH;
    return `<g class="in" style="animation-delay:${r2(0.2 + i * 0.15)}s">
  <rect x="25" y="${y - 9}" width="8" height="8" fill="none" stroke="${col}" transform="rotate(45 29 ${y - 5})" filter="url(#g)"/>
  <text x="44" y="${y}" class="m" fill="#c9d1d9">${label}</text>
  <line x1="${48 + label.length * 7.2}" y1="${y - 4}" x2="${262 - String(value).length * 11}" y2="${y - 4}" stroke="${C.line}" stroke-dasharray="2 4"/>
  <text x="270" y="${y}" text-anchor="end" class="v" font-size="15" fill="${col}" filter="url(#g)">${value}</text>
</g>`;
  }).join('\n');

  const R = 46, CX = 395, CY = 112, CIRC = r2(2 * Math.PI * R);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${USER}: ${stars} stars, ${forks} forks, ${user.public_repos} repos, ${user.followers} followers, rank ${rank}`)}">
<defs>${style()}
<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.pink}"/></linearGradient>
${frame(W, H)}
<text x="25" y="36" class="h" fill="${C.lilac}" filter="url(#g)">GITHUB STATS</text>
<text x="${W - 25}" y="36" text-anchor="end" class="m" fill="${C.muted}">// ${esc(user.login)}</text>
<line x1="25" y1="48" x2="${W - 25}" y2="48" stroke="${C.line}"/>
${list}
<g>
  <circle cx="${CX}" cy="${CY}" r="${R + 12}" fill="none" stroke="${C.lilac}" stroke-opacity="0.5" stroke-dasharray="3 7">
    <animateTransform attributeName="transform" type="rotate" values="0 ${CX} ${CY};360 ${CX} ${CY}" dur="20s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${CX}" cy="${CY}" r="${R + 6}" fill="none" stroke="${C.cyan}" stroke-opacity="0.35" stroke-dasharray="40 20 5 20">
    <animateTransform attributeName="transform" type="rotate" values="360 ${CX} ${CY};0 ${CX} ${CY}" dur="12s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="${C.violet}" fill-opacity="0.08" stroke="${C.line}" stroke-width="6"/>
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="url(#ring)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}" transform="rotate(-90 ${CX} ${CY})" filter="url(#g)">
    <animate attributeName="stroke-dashoffset" from="${CIRC}" to="${r2(CIRC * (1 - pct))}" dur="1.6s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/>
  </circle>
  <text x="${CX}" y="${CY + 10}" text-anchor="middle" class="v" font-size="28" fill="#fff" filter="url(#g6)">${rank}</text>
  <text x="${CX}" y="${CY + 30}" text-anchor="middle" class="m" font-size="9" fill="${C.muted}">RANK</text>
</g>
</svg>`;
}

// ──────────────────────────── LANGUAGES ───────────────────────────
function langsCard() {
  const W = 495, ROW = 26, TOP = 98;
  const H = TOP + topLangs.length * ROW + 12;
  const colors = [C.lilac, C.cyan, C.pink, '#818cf8', '#34d399', '#fbbf24'];
  const BAR = W - 50;
  let x = 25;
  const spectrum = topLangs.map(([, size], i) => {
    const w = r2(size / totalSize * BAR);
    const seg = `<rect x="${r2(x)}" y="64" width="0" height="10" fill="${colors[i]}" filter="url(#g)"><animate attributeName="width" from="0" to="${w}" dur="0.5s" begin="${r2(0.2 + i * 0.25)}s" fill="freeze"/></rect>`;
    x += w;
    return seg;
  }).join('');
  const TRACK_X = 140, TRACK_W = 255;
  const rows = topLangs.map(([lang, size], i) => {
    const y = TOP + i * ROW;
    const p = size / totalSize;
    const w = r2(Math.max(p * TRACK_W / (topLangs[0][1] / totalSize), 4));
    return `<g class="in" style="animation-delay:${r2(0.3 + i * 0.12)}s">
  <circle cx="30" cy="${y - 4}" r="4" fill="${colors[i]}" filter="url(#g)"/>
  <text x="44" y="${y}" class="m" fill="#c9d1d9">${esc(lang)}</text>
  <rect x="${TRACK_X}" y="${y - 8}" width="${TRACK_W}" height="6" rx="3" fill="${C.line}" fill-opacity="0.6"/>
  <rect x="${TRACK_X}" y="${y - 8}" width="0" height="6" rx="3" fill="${colors[i]}" filter="url(#g)"><animate attributeName="width" from="0" to="${w}" dur="1.2s" begin="${r2(0.5 + i * 0.12)}s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/></rect>
  <text x="${W - 25}" y="${y}" text-anchor="end" class="v" font-size="12" fill="${colors[i]}">${(p * 100).toFixed(1)}%</text>
</g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Top languages: ' + topLangs.map(([l, s]) => `${l} ${(s / totalSize * 100).toFixed(1)}%`).join(', '))}">
<defs>${style()}
${frame(W, H)}
<text x="25" y="36" class="h" fill="${C.lilac}" filter="url(#g)">TOP LANGUAGES</text>
<text x="${W - 25}" y="36" text-anchor="end" class="m" fill="${C.muted}">// by repo size</text>
<line x1="25" y1="48" x2="${W - 25}" y2="48" stroke="${C.line}"/>
<rect x="25" y="64" width="${BAR}" height="10" fill="${C.line}" fill-opacity="0.5"/>
${spectrum}
${rows}
</svg>`;
}

// ──────────────────────────── TROPHIES ────────────────────────────
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
  const rankColor = { SSS: '#fde047', SS: '#e2e8f0', S: C.pink, AAA: C.cyan, AA: C.lilac, A: '#818cf8', B: C.violet, C: '#64748b' };
  const TW = 130, W = trophies.length * TW + 20, H = 170, CY = 66, R = 46;
  const hex = (r) => Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 3 * i - Math.PI / 2;
    return `${r2(r * Math.cos(a))},${r2(r * Math.sin(a))}`;
  }).join(' ');

  const cards = trophies.map((t, i) => {
    const c = rankColor[t.rank];
    const cx = 10 + TW * i + TW / 2;
    return `<g transform="translate(${cx} ${CY})">
<g class="bob" style="animation-delay:${r2(-i * 0.5)}s">
  <circle r="${R + 8}" fill="none" stroke="${c}" stroke-opacity="0.45" stroke-dasharray="2 6">
    <animateTransform attributeName="transform" type="rotate" values="0;${i % 2 ? -360 : 360}" dur="${16 + i * 2}s" repeatCount="indefinite"/>
  </circle>
  <polygon points="${hex(R)}" fill="url(#hf)" stroke="${c}" stroke-width="1.5" filter="url(#g)"/>
  <polygon points="${hex(R - 7)}" fill="none" stroke="${c}" stroke-opacity="0.3"/>
  <polygon points="${hex(R)}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="20 ${r2(6 * R - 20)}" opacity="0.8">
    <animate attributeName="stroke-dashoffset" values="0;-${6 * R}" dur="3s" begin="${r2(i * 0.4)}s" repeatCount="indefinite"/>
  </polygon>
  <text y="6" text-anchor="middle" class="v" font-size="${t.rank.length > 2 ? 20 : 24}" fill="${c}" filter="url(#g6)">${t.rank}</text>
  <text y="26" text-anchor="middle" class="m" font-size="11" fill="${C.text}">${esc(t.value)}</text>
</g>
<text y="${R + 38}" text-anchor="middle" class="h" font-size="10" letter-spacing="2" fill="${C.soft}">${t.title}</text>
</g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Trophies: ' + trophies.map((t) => `${t.title} ${t.rank}`).join(', '))}">
<defs>${style(`.bob{animation:bob 4s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-5px)}}`)}
<radialGradient id="hf" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="${C.violet}" stop-opacity="0.35"/><stop offset="1" stop-color="#0b0620" stop-opacity="0.95"/></radialGradient>
${glow('g', 2.5)}${glow('g6', 5)}
</defs>
${cards}
</svg>`;
}

write('assets/stats.svg', statsCard());
write('assets/langs.svg', langsCard());
write('assets/trophies.svg', trophiesCard());
