// Section markers for the toolchain rows. 16px, single stroke, one neutral colour
// that holds on both GitHub themes — so each icon is one file, not a light/dark pair.

import { NEUTRAL_ACCENT, document } from './tokens.mjs';

const STROKE = 1.25;

// Each entry is the glyph body only; the frame below supplies stroke and sizing.
const GLYPHS = {
  // three linked nodes — a graph, for agent workflows
  ai: [
    '<path d="M4 11.5 8 4l4 7.5M4 11.5h8"/>',
    '<circle cx="8" cy="4" r="1.4"/><circle cx="4" cy="11.5" r="1.4"/><circle cx="12" cy="11.5" r="1.4"/>',
  ],
  // a viewport: frame, chrome bar, one column division
  frontend: [
    '<rect x="2" y="3" width="12" height="10"/>',
    '<path d="M2 6h12M6 6v7"/>',
  ],
  // two stacked services joined by a link
  backend: [
    '<rect x="2" y="2.5" width="12" height="4"/><rect x="2" y="9.5" width="12" height="4"/>',
    '<path d="M8 6.5v3"/>',
  ],
  // four nodes wired into a ring — distributed regions
  infrastructure: [
    '<rect x="2" y="2" width="3.5" height="3.5"/><rect x="10.5" y="2" width="3.5" height="3.5"/>',
    '<rect x="2" y="10.5" width="3.5" height="3.5"/><rect x="10.5" y="10.5" width="3.5" height="3.5"/>',
    '<path d="M5.5 3.75h5M5.5 12.25h5M3.75 5.5v5M12.25 5.5v5"/>',
  ],
  // a dimension line with a slider — the measure motif used across the profile
  tooling: [
    '<path d="M2 8h12M2 5v6M14 5v6"/>',
    '<rect x="7" y="5.5" width="3" height="5"/>',
  ],
};

export const ICON_NAMES = Object.keys(GLYPHS);

export function renderIcon(name) {
  const glyph = GLYPHS[name];
  if (!glyph) throw new Error(`Unknown icon "${name}". Expected one of: ${ICON_NAMES.join(', ')}`);

  return document({
    width: 16,
    height: 16,
    body: [
      `<g fill="none" stroke="${NEUTRAL_ACCENT}" stroke-width="${STROKE}" stroke-linecap="square" stroke-linejoin="miter">`,
      ...glyph,
      '</g>',
    ],
  });
}
