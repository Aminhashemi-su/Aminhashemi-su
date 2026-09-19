// Closing rule: a hairline with a short accent segment at the start, the same
// "one line of blue" the website uses for emphasis. Theme-independent, so one file
// reads on both GitHub grounds.

import { NEUTRAL_ACCENT, NEUTRAL_LINE, document } from './tokens.mjs';

const WIDTH = 1200;
const HEIGHT = 8;
const Y = 4;

export function renderDivider() {
  return document({
    width: WIDTH,
    height: HEIGHT,
    body: [
      `<line x1="0" y1="${Y + 0.5}" x2="${WIDTH}" y2="${Y + 0.5}" stroke="${NEUTRAL_LINE}" stroke-opacity="0.35" shape-rendering="crispEdges"/>`,
      `<rect x="0" y="${Y - 1}" width="96" height="3" rx="1.5" fill="${NEUTRAL_ACCENT}"/>`,
    ],
  });
}
