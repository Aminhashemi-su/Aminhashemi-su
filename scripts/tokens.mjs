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
  },
  dark: {
    bg: '#0D0D0D',
    card: '#1B1B1B',
    ink: '#F3F3F3',
    mut: '#A4A4A4',
    line: '#2E2E2E',
    accent: '#649CDA',
    ok: '#2BBB71',
  },
};

export const MODES = Object.keys(THEMES);

// Between the two primaries, so theme-independent assets (icons, the divider) hold
// on both GitHub grounds as a single file.
export const NEUTRAL_ACCENT = '#3F72B0';
export const NEUTRAL_LINE = '#8A8A8A';

export const FONT = "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

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

/** Wraps body markup in a root <svg>, with an optional CSS block inside the document. */
export function document({ width, height, label, body, style }) {
  const role = label ? ` role="img" aria-label="${esc(label)}"` : ' role="presentation"';
  const css = style ? `<style>\n${style}\n</style>\n` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"${role}>\n${css}${body.join('\n')}\n</svg>\n`;
}

/** One line of text in Space Grotesk. `tracking` is in em, like the site's letter-spacing. */
export function text({ x, y, size, weight = 500, fill, tracking = 0, anchor, children }) {
  const end = anchor ? ` text-anchor="${anchor}"` : '';
  const ls = tracking ? ` letter-spacing="${(tracking * size).toFixed(2)}"` : '';
  return `<text x="${x}" y="${y}" font-family="${esc(FONT)}" font-size="${size}" font-weight="${weight}"${ls} fill="${fill}"${end}>${esc(children)}</text>`;
}
