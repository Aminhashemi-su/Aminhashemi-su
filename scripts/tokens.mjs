// Single source of truth for the profile's visual language. Every generated asset
// draws from here, so the palette can never drift between the pieces.
//
// It mirrors aminhashemi.com: warm paper and near-black ink, one blue accent, and
// Space Grotesk. The colours are the site's oklch tokens converted to hex, so the
// GitHub profile, the website and its link previews read as one identity.

import { readFileSync } from 'node:fs';

// Reached through theme() rather than exported directly, so callers cannot pick up
// a palette without the unknown-mode guard.
const THEMES = {
  light: {
    bg: '#F4F3F1', // --background
    card: '#FFFFFF', // --card
    ink: '#0F0F0F', // --foreground
    mut: '#696969', // --muted-foreground
    line: '#DEDEDC', // --border
    accent: '#1D487C', // --primary
    ok: '#2BBB71', // the "open to roles" dot
    warn: '#B4532A', // a failure that stops loudly
    dot: '#AAA9A5', // one job ad, one packet: data that is not the point
  },
  dark: {
    bg: '#0D0D0D',
    card: '#1B1B1B',
    ink: '#F3F3F3',
    mut: '#A4A4A4',
    line: '#2E2E2E',
    accent: '#649CDA',
    ok: '#2BBB71',
    warn: '#E3925F',
    dot: '#5E5E5E',
  },
};

export const MODES = Object.keys(THEMES);

// Between the two primaries, so theme-independent assets (the divider) hold on both
// GitHub grounds as a single file.
export const NEUTRAL_ACCENT = '#3F72B0';
export const NEUTRAL_LINE = '#8A8A8A';

export const FONT = "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

// GitHub shows the README's SVGs through <img>, which cannot load web fonts from a
// URL. The font therefore travels inside the file as a data URI (latin subset, two
// weights, SIL Open Font License in fonts/OFL.txt).
const fontFile = (weight) =>
  readFileSync(new URL(`fonts/space-grotesk-latin-${weight}-normal.woff2`, import.meta.url)).toString('base64');

export function fontFaces() {
  return [500, 700]
    .map(
      (w) =>
        `@font-face { font-family: 'Space Grotesk'; font-weight: ${w}; font-style: normal; src: url(data:font/woff2;base64,${fontFile(w)}) format('woff2'); }`,
    )
    .join('\n');
}

// Escapes for attribute context as well as text, since output lands in both.
export const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function theme(mode) {
  const t = THEMES[mode];
  if (!t) throw new Error(`Unknown theme "${mode}". Expected one of: ${MODES.join(', ')}`);
  return t;
}

export function pickLayout(layouts, name) {
  const l = layouts[name];
  if (!l) throw new Error(`Unknown layout "${name}". Expected one of: ${Object.keys(layouts).join(', ')}`);
  return l;
}

/** Rounds a coordinate so the files stay small and diffs stay readable. */
export const n = (v) => Number(v.toFixed(2));

/** Wraps body markup in a root <svg>, with an optional CSS block inside the document. */
export function document({ width, height, label, body, style }) {
  const role = label ? ` role="img" aria-label="${esc(label)}"` : ' role="presentation"';
  const css = style ? `<style>\n${style}\n</style>\n` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"${role}>\n${css}${body.join('\n')}\n</svg>\n`;
}

/** One line of text. `tracking` is in em, like the site's letter-spacing. */
export function text({ x, y, size, weight = 500, fill, tracking = 0, anchor, mono = false, opacity, children }) {
  const family = mono ? MONO : FONT;
  const end = anchor ? ` text-anchor="${anchor}"` : '';
  const ls = tracking ? ` letter-spacing="${(tracking * size).toFixed(2)}"` : '';
  const op = opacity === undefined ? '' : ` opacity="${opacity}"`;
  return `<text x="${n(x)}" y="${n(y)}" font-family="${esc(family)}" font-size="${size}" font-weight="${weight}"${ls} fill="${fill}"${end}${op}>${esc(children)}</text>`;
}

// Approximate advance widths of Space Grotesk, in em. SVG cannot measure text, and
// these are good to a few per cent, which is all the layout needs: wrapping and the
// pills around labels leave room to spare.
function advance(ch) {
  if (ch === ' ') return 0.26;
  if ("il.,:;|!'".includes(ch)) return 0.25;
  if ('fjtr()[]I/-'.includes(ch)) return 0.37;
  if ('mw'.includes(ch)) return 0.82;
  if ('MW'.includes(ch)) return 0.88;
  if ('%&@'.includes(ch)) return 0.78;
  if ('→⇄'.includes(ch)) return 0.8;
  if (ch === '·') return 0.3;
  if (ch === '–') return 0.52;
  if (ch >= '0' && ch <= '9') return 0.6;
  if (ch >= 'A' && ch <= 'Z') return 0.66;
  return 0.56;
}

export function measure(str, size, { weight = 500, mono = false } = {}) {
  if (mono) return [...str].length * size * 0.61;
  let em = 0;
  for (const ch of str) em += advance(ch);
  return em * size * 1.05 * (weight >= 700 ? 1.05 : 1);
}

/** Greedy word wrap against the width estimate above. */
export function wrap(str, size, maxWidth, opts) {
  const lines = [];
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, opts) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const toneColor = (t, tone) => ({ accent: t.accent, ok: t.ok, warn: t.warn, ink: t.ink })[tone] ?? t.mut;

/** A rounded label. Returns its width so callers can lay pills out in a row. */
export function pill({ x, y, label, t, size = 13, h = 28, tone = 'mut', anchor = 'start', fill = 'none' }) {
  const w = measure(label, size) + h * 0.9;
  const x0 = anchor === 'end' ? x - w : x;
  const color = toneColor(t, tone);
  const stroke = tone === 'mut' || tone === 'ink' ? t.line : color;
  return {
    w,
    svg:
      `<rect x="${n(x0 + 0.5)}" y="${n(y + 0.5)}" width="${n(w - 1)}" height="${h - 1}" rx="${n((h - 1) / 2)}" fill="${fill}" stroke="${stroke}"/>` +
      text({ x: x0 + w / 2, y: y + h / 2 + size * 0.36, size, fill: color, anchor: 'middle', children: label }),
  };
}

/** Lays pills left to right and wraps them into rows. Returns markup and the rows used. */
export function flow({ x, y, maxX, labels, t, size = 14, h = 30, gapX = 8, gapY = 10, tone, fill }) {
  const out = [];
  let cx = x;
  let row = 0;
  for (const label of labels) {
    const w = measure(label, size) + h * 0.9;
    if (cx > x && cx + w > maxX) {
      cx = x;
      row += 1;
    }
    out.push(pill({ x: cx, y: y + row * (h + gapY), label, t, size, h, tone, fill }).svg);
    cx += w + gapX;
  }
  return { svg: out, rows: row + 1 };
}

/** Deterministic randomness, so a rebuild with unchanged facts writes identical files. */
export function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** The rounded sheet every panel sits on. */
export const frame = (W, H, R, t) =>
  `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${R}" fill="${t.bg}" stroke="${t.line}"/>`;

/** Colour for a note or packet tone. */
export const tone = toneColor;
