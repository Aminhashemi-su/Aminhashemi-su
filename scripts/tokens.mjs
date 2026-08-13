// Single source of truth for the profile's visual language. Every generated asset
// draws from here, so the palette can never drift between the header and the panel.

// Reached through theme() rather than exported directly, so callers cannot pick up
// a palette without the unknown-mode guard.
const THEMES = {
  light: {
    bg: '#ffffff',
    ink: '#14161A',
    mut: '#787D84',
    hair: '#D9D6CF',
    rule: '#E7E3DC',
    empty: '#EFECE6',
    accent: '#3F6070',
    ramp: ['#C6D0D6', '#93AAB6', '#5F8296', '#3F6070'],
  },
  dark: {
    bg: '#0D1117',
    ink: '#E8E6E1',
    mut: '#7D858F',
    hair: '#2A313B',
    rule: '#20262F',
    empty: '#1A2029',
    accent: '#7FA3B3',
    ramp: ['#2E4551', '#456776', '#628F9F', '#7FA3B3'],
  },
};

export const MODES = Object.keys(THEMES);

// Sits between both grounds, so theme-independent assets (icons, dividers) need
// only one file instead of a light and a dark copy.
export const NEUTRAL_ACCENT = '#5C8496';

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

/** Wraps body markup in a root <svg>, always with a trailing newline. */
export function document({ width, height, label, body }) {
  const role = label ? ` role="img" aria-label="${esc(label)}"` : ' role="presentation"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"${role}>\n${body.join('\n')}\n</svg>\n`;
}

/** Crisp 1px hairline plus optional downward ruler ticks — the recurring measure motif. */
export function measure({ width, y, color, ticks = [], tickLength = 6 }) {
  const marks = ticks.map((x) => `<line x1="${x + 0.5}" y1="${y}" x2="${x + 0.5}" y2="${y + tickLength}"/>`);
  return [
    `<g stroke="${color}" stroke-width="1" shape-rendering="crispEdges">`,
    `<line x1="0" y1="${y + 0.5}" x2="${width}" y2="${y + 0.5}"/>`,
    ...marks,
    '</g>',
  ];
}

export function monoText({ x, y, size, tracking = 1.4, fill, anchor, children }) {
  const end = anchor ? ` text-anchor="${anchor}"` : '';
  return `<text x="${x}" y="${y}" font-family="${FONTS.mono}" font-size="${size}" letter-spacing="${tracking}" fill="${fill}"${end}>${esc(children)}</text>`;
}
