// Shared helpers for the SVG generators.
// GitHub serves README images through <img>, so SVGs can't load external
// resources or run JS — fonts are embedded as data URIs and every effect is
// pure CSS / SMIL animation.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const fontData = (file) =>
  readFileSync(new URL(`./fonts/${file}`, import.meta.url)).toString('base64');

export const C = {
  bg0: '#05010f',
  bg1: '#0d0221',
  panel: '#0d1117',
  violet: '#7c3aed',
  lilac: '#a78bfa',
  soft: '#c4b5fd',
  cyan: '#22d3ee',
  pink: '#f472b6',
  green: '#86efac',
  text: '#e2e8f0',
  muted: '#8b949e',
  line: '#30363d',
};

// JetBrains Mono advance width is exactly 600/1000 em.
export const MONO_ADVANCE = 0.6;

export function fontFaces({ orbitron = true, mono = true } = {}) {
  const faces = [];
  if (orbitron) {
    faces.push(`@font-face{font-family:'Orbitron';font-weight:400 900;src:url(data:font/woff2;base64,${fontData('orbitron.woff2')}) format('woff2');}`);
  }
  if (mono) {
    faces.push(`@font-face{font-family:'JBMono';font-weight:100 800;src:url(data:font/woff2;base64,${fontData('jetbrains-mono.woff2')}) format('woff2');}`);
  }
  return faces.join('\n');
}

export const FONT_DISPLAY = `'Orbitron','Segoe UI',Verdana,sans-serif`;
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
