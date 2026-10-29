// Shared helpers for the SVG generators.
// GitHub serves README images through <img>, so SVGs can't load external
// resources or run JS — fonts are embedded as data URIs and every effect is
// pure CSS / SMIL animation.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const fontData = (file) =>
  readFileSync(new URL(`./fonts/${file}`, import.meta.url)).toString('base64');

// Moonlit crystal-forest palette, sampled from Macalania reference art:
// petrol blues and teals, cyan crystals, violet nebula and warm golden orbs.
export const C = {
  deep: '#050f1a',
  night: '#071b2a',
  panel: '#0b3251',
  royal: '#0c3e83',
  sapphire: '#1b5c90',
  teal: '#164c68',
  winTop: '#14507a',
  winBot: '#071b2a',
  silver: '#c8d7c6',
  ice: '#7cc8ec',
  aqua: '#48a0bc',
  frost: '#a1e0f9',
  snow: '#eaf0ef',
  azure: '#2f8dac',
  lilac: '#8b9be0',
  violet: '#6073c3',
  leaf: '#8fe3cf',
  bloom: '#ffcf6b',
  gold: '#ffe7a3',
  moon: '#eaf0ef',
  text: '#e3eefa',
  muted: '#8fa9b8',
  line: '#164c68',
};

// JetBrains Mono advance width is exactly 600/1000 em.
export const MONO_ADVANCE = 0.6;

export function fontFaces({ display = true, mono = true } = {}) {
  const faces = [];
  if (display) {
    faces.push(`@font-face{font-family:'Cinzel';font-weight:400 900;src:url(data:font/woff2;base64,${fontData('cinzel.woff2')}) format('woff2');}`);
  }
  if (mono) {
    faces.push(`@font-face{font-family:'JBMono';font-weight:100 800;src:url(data:font/woff2;base64,${fontData('jetbrains-mono.woff2')}) format('woff2');}`);
  }
  return faces.join('\n');
}

export const FONT_DISPLAY = `'Cinzel','Trajan Pro',Georgia,serif`;
export const FONT_MONO = `'JBMono','Fira Code',Consolas,'Courier New',monospace`;

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const glow = (id, std = 3) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">` +
  `<feGaussianBlur stdDeviation="${std}" result="b"/>` +
  `<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

// Deterministic RNG so regenerating assets doesn't produce noisy diffs.
export function rng(seed = 42) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r2 = (n) => Math.round(n * 100) / 100;

// Builds a discrete SMIL timeline: `events` is a list of [time, value]
// pairs (time in seconds, ascending, first at 0) over a loop of `dur` seconds.
export function timeline(events, dur) {
  const keyTimes = events.map(([t]) => (t / dur).toFixed(4));
  keyTimes[0] = '0';
  return {
    values: events.map(([, v]) => v).join(';'),
    keyTimes: keyTimes.join(';'),
  };
}

export function write(path, svg) {
  const out = new URL(`../${path}`, import.meta.url);
  mkdirSync(dirname(out.pathname), { recursive: true });
  writeFileSync(out, svg.replace(/\n\s*\n/g, '\n'));
  console.log(`✔ ${path} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB)`);
}

// ───────────── Crystal-forest building blocks ─────────────

// Four-point sparkle centered on 0,0.
export const sparkle = (s) =>
  `M0 ${-s} Q0 0 ${s} 0 Q0 0 0 ${s} Q0 0 ${-s} 0 Q0 0 0 ${-s}Z`;

// Mostly cool sparkles, with the occasional warm lantern glow.
export const PYRE_COLORS = [C.ice, C.aqua, C.frost, C.snow, C.ice, C.bloom];

// Halo gradients used by pyreflies(); one per palette color.
export const pyreflyDefs = (colors = PYRE_COLORS) =>
  colors.map((c, i) =>
    `<radialGradient id="pf${i}"><stop offset="0" stop-color="${c}" stop-opacity="0.55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`,
  ).join('');

// Pyreflies: glowing orbs drifting on a wavy path between y0 and y1.
export function pyreflies(rand, n, { x0, x1, y0, y1, colors = PYRE_COLORS, rMin = 1.2, rMax = 2.6, dMin = 7, dMax = 14, sway = 70 }) {
  return Array.from({ length: n }, () => {
    const x = r2(x0 + rand() * (x1 - x0)), r = r2(rMin + rand() * (rMax - rMin));
    const d = r2(dMin + rand() * (dMax - dMin)), b = r2(-rand() * dMax);
    const ci = Math.floor(rand() * colors.length);
    const w = () => r2(x + (rand() - 0.5) * sway);
    const ym = (t) => r2(y0 + (y1 - y0) * t);
    const path = `M${x} ${y0} C${w()} ${ym(0.33)} ${w()} ${ym(0.66)} ${w()} ${y1}`;
    return `<g opacity="0"><circle r="${r2(r * 4)}" fill="url(#pf${ci})"/><circle r="${r}" fill="${colors[ci]}"/><circle r="${r2(r * 0.45)}" fill="#fff"/>` +
      `<animateMotion path="${path}" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;1;0.5;1;0" keyTimes="0;0.15;0.5;0.8;1" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></g>`;
  }).join('');
}

// Blue gradient window with silver border, in the spirit of classic JRPG menus.
export const windowDefs = () => `
<linearGradient id="win" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${C.winTop}"/><stop offset="1" stop-color="${C.winBot}"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

export const windowFrame = (x, y, w, h, rx = 10) => `
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#win)"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${C.silver}" stroke-width="1.5"/>
<rect x="${x + 3.5}" y="${y + 3.5}" width="${w - 7}" height="${h - 7}" rx="${rx - 3}" fill="none" stroke="#fff" stroke-opacity="0.16"/>`;

// Diagonal light sweep across a window; call after the content so it glazes over it.
export const windowSheen = (x, y, w, h, { rx = 10, dur = 7, id = 'wclip' } = {}) => `
<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath>
<g clip-path="url(#${id})"><rect y="${y}" width="140" height="${h}" fill="url(#sheen)" transform="skewX(-25)"><animate attributeName="x" values="${x - 300};${x + w + h + 300}" dur="${dur}s" repeatCount="indefinite"/></rect></g>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="60 ${2 * (w + h)}" filter="url(#g)" opacity="0.9">
  <animate attributeName="stroke-dashoffset" values="0;-${2 * (w + h) + 60}" dur="${dur + 2}s" repeatCount="indefinite"/>
</rect>`;
