// Masthead. The name is the dominant element; the diagram to its right is a
// construction drawing — grid divisions, a hatched cell and a dimension line —
// sized to read as an annotation rather than an illustration.

import { FONTS, document, esc, measure, monoText, pickLayout, theme } from './tokens.mjs';

const LAYOUTS = {
  wide: {
    W: 1200, H: 132,
    metaSize: 10, nameSize: 44, roleSize: 12,
    metaY: 14, ruleY: 24, nameY: 78, accentY: 92, accentW: 36, roleY: 116,
    ticks: [0, 40, 80, 120],
    fig: { x: 992, y: 40, w: 207, h: 52, cols: 4, leader: 52, dimY: 104, annotate: true },
  },
  narrow: {
    W: 480, H: 110,
    metaSize: 9, nameSize: 32, roleSize: 9.5,
    metaY: 12, ruleY: 20, nameY: 62, accentY: 74, accentW: 28, roleY: 96,
    ticks: [0, 32, 64],
    fig: { x: 360, y: 28, w: 119, h: 40, cols: 3, leader: 28, dimY: 78, annotate: false },
  },
};

/** Grid box with column divisions, one hatched cell, a centre axis and a dimension line. */
function figure(fig, t) {
  const { x, y, w, h, cols } = fig;
  const right = x + w;
  const midY = y + Math.round(h / 2);
  const colW = w / cols;
  const axisX = Math.round(x + colW * Math.floor(cols / 2));

  const frame = [`<rect x="${x + 0.5}" y="${y + 0.5}" width="${w}" height="${h}"/>`];
  for (let i = 1; i < cols; i += 1) {
    const cx = Math.round(x + colW * i) + 0.5;
    frame.push(`<line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + h}"/>`);
  }
  // centre axis, run past the frame on the left as a construction leader
  frame.push(`<line x1="${x - fig.leader}" y1="${midY + 0.5}" x2="${right}" y2="${midY + 0.5}"/>`);

  // hatching gives the drawing density without adding another shape
  const hatch = [];
  for (let hx = x + 5; hx < x + colW - 2; hx += 5) {
    hatch.push(`<line x1="${hx + 0.5}" y1="${y + 3}" x2="${hx + 0.5}" y2="${midY - 3}"/>`);
  }

  // dimension line: end serifs, the way a drawing marks an overall measurement
  const dim = [
    `<line x1="${x}" y1="${fig.dimY + 0.5}" x2="${right}" y2="${fig.dimY + 0.5}"/>`,
    `<line x1="${x + 0.5}" y1="${fig.dimY - 3}" x2="${x + 0.5}" y2="${fig.dimY + 4}"/>`,
    `<line x1="${right - 0.5}" y1="${fig.dimY - 3}" x2="${right - 0.5}" y2="${fig.dimY + 4}"/>`,
  ];

  return [
    `<g stroke="${t.rule}" stroke-width="1" fill="none" shape-rendering="crispEdges">`,
    ...frame,
    ...dim,
    '</g>',
    `<g stroke="${t.hair}" stroke-width="1" stroke-opacity="0.75" shape-rendering="crispEdges">`,
    ...hatch,
    '</g>',
    `<rect x="${axisX - 3}" y="${midY - 3}" width="6" height="6" fill="${t.accent}"/>`,
  ];
}

export function renderHeader(profile, mode = 'dark', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const location = layout === 'narrow' ? profile.locationShort : profile.location;

  const body = [
    `<rect width="${L.W}" height="${L.H}" fill="${t.bg}"/>`,
    monoText({ x: 0, y: L.metaY, size: L.metaSize, tracking: 1.6, fill: t.mut, children: profile.eyebrow }),
    monoText({ x: L.W, y: L.metaY, size: L.metaSize, tracking: 1.6, fill: t.mut, anchor: 'end', children: location }),
    ...measure({ width: L.W, y: L.ruleY, color: t.hair, ticks: L.ticks, tickLength: 7 }),
    ...figure(L.fig, t),
    `<text x="0" y="${L.nameY}" font-family="${FONTS.serif}" font-size="${L.nameSize}" letter-spacing="-0.6" fill="${t.ink}">${esc(profile.name)}</text>`,
    `<rect x="0" y="${L.accentY}" width="${L.accentW}" height="2.5" fill="${t.accent}"/>`,
    monoText({ x: 0, y: L.roleY, size: L.roleSize, tracking: 1.8, fill: t.mut, children: profile.role }),
  ];

  if (L.fig.annotate) {
    body.push(monoText({
      x: L.W, y: L.H - 4, size: 9, tracking: 1.4, fill: t.mut, anchor: 'end',
      children: `FIG.01 / ${L.fig.w}×${L.fig.h}`,
    }));
  }

  return document({
    width: L.W,
    height: L.H,
    label: `${profile.name} — ${profile.role}. ${profile.location}.`,
    body,
  });
}
