// Single source of truth for the profile's visual language. Every generated asset
// draws from here, so the palette can never drift between the pieces.
//
// The palette is warm on purpose. The slate/tech-blue scheme this replaced is the
// exact default that five years of SaaS dashboards made invisible; paper, espresso
// and terracotta read as a considered choice rather than an unset variable.

// Reached through theme() rather than exported directly, so callers cannot pick up
// a palette without the unknown-mode guard.
const THEMES = {
  // warm paper, not #ffffff — pure white next to GitHub's own chrome looks like a
  // missing background rather than a decision
  light: {
    bg: '#F2EDE4',
    ink: '#1E1712',
    mut: '#7A6F63',
    hair: '#CFC4B4',
    rule: '#DED4C6',
    accent: '#C8562F',
    // printer's control strip: the three inks the rest of the page is allowed to use
    inks: ['#C8562F', '#D9A441', '#6E7F5E'],
    grain: { color: '#1E1712', opacity: 0.09 },
  },
  // warm near-black. GitHub's own #0D1117 is blue-grey; sitting a warm panel on it
  // is what makes the profile look printed rather than rendered.
  dark: {
    bg: '#16110D',
    ink: '#F0E9DE',
    mut: '#8A7F72',
    hair: '#3A2F26',
    rule: '#2A211A',
    accent: '#E0714A',
    inks: ['#E0714A', '#E8B75B', '#8FA57C'],
    grain: { color: '#F0E9DE', opacity: 0.07 },
  },
};

export const MODES = Object.keys(THEMES);

// Sits between both grounds, so theme-independent assets (icons, dividers) need
// only one file instead of a light and a dark copy.
export const NEUTRAL_ACCENT = '#C2603C';

export const FONTS = {
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  serif: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
};

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

/**
 * Wraps body markup in a root <svg>. `style` is emitted as a CSS block inside the
 * document: GitHub strips <script> from a README but renders an SVG through <img>,
 * where its own stylesheet and keyframes still run. That is the only route to motion
 * here, so animation lives in the file rather than in the page.
 */
export function document({ width, height, label, body, style }) {
  const role = label ? ` role="img" aria-label="${esc(label)}"` : ' role="presentation"';
  const css = style ? `<style>\n${style}\n</style>\n` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"${role}>\n${css}${body.join('\n')}\n</svg>\n`;
}

/**
 * Film grain. feTurbulence rather than a tiled PNG: it costs ~200 bytes, scales to
 * any size, and gives the flat fills a printed tooth instead of a screen flatness.
 * Declared once per document and painted last, over everything.
 */
export function grain(id, { width, height, color, opacity, frequency = 0.85 }) {
  return [
    '<defs>',
    `<filter id="${id}" x="0" y="0" width="100%" height="100%">`,
    `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="3" stitchTiles="stitch" result="n"/>`,
    '<feColorMatrix type="saturate" values="0"/>',
    '</filter>',
    '</defs>',
    `<g opacity="${opacity}"><rect width="${width}" height="${height}" fill="${color}" filter="url(#${id})"/></g>`,
  ];
}

/** Corner crop marks — the press-proof convention for where the sheet gets trimmed. */
export function cropMarks({ width, height, color, len = 14, inset = 0 }) {
  const corner = (x, y, dx, dy) => [
    `<line x1="${x}" y1="${y}" x2="${x + dx * len}" y2="${y}"/>`,
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + dy * len}"/>`,
  ];
  return [
    `<g stroke="${color}" stroke-width="1" shape-rendering="crispEdges">`,
    ...corner(inset + 0.5, inset + 0.5, 1, 1),
    ...corner(width - inset - 0.5, inset + 0.5, -1, 1),
    ...corner(inset + 0.5, height - inset - 0.5, 1, -1),
    ...corner(width - inset - 0.5, height - inset - 0.5, -1, -1),
    '</g>',
  ];
}

/** Crisp 1px hairline plus optional downward ruler ticks — the recurring measure motif. */
export function measure({ width, y, color, ticks = [], tickLength = 6, x = 0 }) {
  const marks = ticks.map((t) => `<line x1="${x + t + 0.5}" y1="${y}" x2="${x + t + 0.5}" y2="${y + tickLength}"/>`);
  return [
    `<g stroke="${color}" stroke-width="1" shape-rendering="crispEdges">`,
    `<line x1="${x}" y1="${y + 0.5}" x2="${width}" y2="${y + 0.5}"/>`,
    ...marks,
    '</g>',
  ];
}

export function monoText({ x, y, size, tracking = 1.4, fill, anchor, children, cls, opacity }) {
  const end = anchor ? ` text-anchor="${anchor}"` : '';
  const c = cls ? ` class="${cls}"` : '';
  const o = opacity === undefined ? '' : ` opacity="${opacity}"`;
  return `<text x="${x}" y="${y}" font-family="${FONTS.mono}" font-size="${size}" letter-spacing="${tracking}" fill="${fill}"${end}${c}${o}>${esc(children)}</text>`;
}
