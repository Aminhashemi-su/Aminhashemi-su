// Closing trim rule with a miniature ink strip. Theme-independent: these are the
// mid-tone versions of the three inks, so one file reads on both GitHub grounds
// rather than needing a light and a dark copy.

import { document } from './tokens.mjs';

const WIDTH = 1200;
const HEIGHT = 16;
const BASELINE = 8;
const INKS = ['#C2603C', '#D9A441', '#7F9068'];

export function renderDivider() {
  const ticks = [0, 48, 96].map(
    (x) => `<line x1="${x + 0.5}" y1="${BASELINE}" x2="${x + 0.5}" y2="${BASELINE + 5}"/>`,
  );

  const strip = INKS.map(
    (hex, i) => `<rect x="${i * 22}" y="${BASELINE - 4}" width="18" height="7" fill="${hex}"/>`,
  );

  return document({
    width: WIDTH,
    height: HEIGHT,
    body: [
      '<g stroke="#8A7F72" stroke-opacity="0.4" stroke-width="1" shape-rendering="crispEdges">',
      `<line x1="0" y1="${BASELINE + 0.5}" x2="${WIDTH}" y2="${BASELINE + 0.5}"/>`,
      ...ticks,
      `<line x1="${WIDTH - 0.5}" y1="${BASELINE - 4}" x2="${WIDTH - 0.5}" y2="${BASELINE + 1}"/>`,
      '</g>',
      '<g shape-rendering="crispEdges">',
      ...strip,
      '</g>',
    ],
  });
}
