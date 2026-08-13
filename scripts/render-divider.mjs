// Closing rule. Theme-independent: a mid-tone hairline at low opacity reads on both
// GitHub grounds, so this ships as one file rather than a light/dark pair.

import { NEUTRAL_ACCENT, document } from './tokens.mjs';

const WIDTH = 1200;
const HEIGHT = 14;
const BASELINE = 7;

export function renderDivider() {
  const ticks = [0, 40, 80].map(
    (x) => `<line x1="${x + 0.5}" y1="${BASELINE}" x2="${x + 0.5}" y2="${BASELINE + 5}"/>`,
  );

  return document({
    width: WIDTH,
    height: HEIGHT,
    body: [
      `<g stroke="#8A8F98" stroke-opacity="0.32" stroke-width="1" shape-rendering="crispEdges">`,
      `<line x1="0" y1="${BASELINE + 0.5}" x2="${WIDTH}" y2="${BASELINE + 0.5}"/>`,
      ...ticks,
      `<line x1="${WIDTH - 0.5}" y1="${BASELINE - 4}" x2="${WIDTH - 0.5}" y2="${BASELINE + 1}"/>`,
      '</g>',
      `<rect x="0" y="${BASELINE - 1}" width="64" height="2" fill="${NEUTRAL_ACCENT}"/>`,
    ],
  });
}
