// FIG.02 — the shape every system here converges on: one stochastic cell with
// deterministic contracts on either side of it, and a replay path back to the start.
//
// Hand-authored rather than generated from API data. The profile page already draws a
// contribution calendar directly beneath this panel, so a second copy of it added
// nothing except a number that drifted out of date between daily builds.
//
// Pure — layout in, SVG string out — so a local dry run and the workflow agree.

import { FONTS, document, esc, measure, monoText, pickLayout, theme } from './tokens.mjs';

// Read left to right: the model sits in the middle, fenced by stages that behave the
// same way on every run. `stochastic` marks the one cell allowed to be unpredictable.
export const STAGES = [
  { key: 'INGEST', note: 'SOURCES NORMALISED' },
  { key: 'POLICY', note: 'HARD RULES / NO MODEL' },
  { key: 'MODEL', note: 'THE STOCHASTIC CELL', stochastic: true },
  { key: 'CONTRACT', note: 'TYPED / VALIDATED / RETRIED' },
  { key: 'STATE', note: 'DURABLE / REPLAYABLE' },
];

const RETURN_LABEL = 'REPLAY / BACKFILL';
const FOOTNOTE = 'APPLIED IN — ROLELENS / TALERO ATS / TALERO TALENTS';

const LAYOUTS = {
  // stages in a row: the claim is about order, and a row states order fastest
  wide: {
    W: 1200, H: 262, orient: 'row',
    metaSize: 10, headSize: 26, keySize: 12, noteSize: 8.5, tickSize: 9,
    metaY: 14, ruleY: 26, ticks: [0, 40, 80],
    head: ['One stochastic cell — deterministic contracts on both sides.'],
    headY: 76, headLead: 32, accentY: 90, accentW: 36,
    box: { y: 126, h: 62, gap: 55, padX: 14, keyY: 26, noteY: 44 },
    returnY: 218, footY: 250,
  },
  // stacked, because five 196px boxes stop being readable once GitHub scales the
  // image down to a phone; the return path moves into a channel on the right
  narrow: {
    W: 480, H: 416, orient: 'column',
    metaSize: 9, headSize: 17, keySize: 11, noteSize: 8, tickSize: 8,
    metaY: 12, ruleY: 20, ticks: [0, 32, 64],
    head: ['One stochastic cell —', 'deterministic contracts', 'on both sides.'],
    headY: 52, headLead: 22, accentY: 112, accentW: 28,
    box: { y: 134, h: 38, gap: 12, w: 438, padX: 12, keyY: 17, noteY: 30 },
    returnX: 462, footY: 402,
  },
};

/**
 * Hairline with a chevron head. The wings are set back along the direction of travel,
 * so the head still points forwards on the return path, which runs up and to the left.
 * Kept out of the crispEdges groups — diagonals alias under it.
 */
function arrow({ x1, y1, x2, y2 }) {
  const BACK = 5;
  const WING = 3.5;
  const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

  if (x1 === x2) {
    const back = y2 - Math.sign(y2 - y1) * BACK;
    return [line, `<polyline points="${x2 - WING},${back} ${x2},${y2} ${x2 + WING},${back}"/>`];
  }
  const back = x2 - Math.sign(x2 - x1) * BACK;
  return [line, `<polyline points="${back},${y2 - WING} ${x2},${y2} ${back},${y2 + WING}"/>`];
}

/** Diagonal hatching inside a cell — the header figure's motif for "not solid". */
function hatch(x, y, w, h, t) {
  const lines = [];
  for (let offset = 5; offset < w + h; offset += 5) {
    const x1 = x + Math.max(0, offset - h);
    const y1 = y + Math.min(offset, h);
    const x2 = x + Math.min(offset, w);
    const y2 = y + Math.max(0, offset - w);
    lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
  }
  return [`<g stroke="${t.hair}" stroke-width="1" stroke-opacity="0.75">`, ...lines, '</g>'];
}

/** Box geometry for stage i, in whichever direction the layout runs. */
function slot(L, i) {
  const { box } = L;
  if (L.orient === 'row') {
    const w = Math.round((L.W - box.gap * (STAGES.length - 1)) / STAGES.length);
    return { x: i * (w + box.gap), y: box.y, w, h: box.h };
  }
  return { x: 0, y: box.y + i * (box.h + box.gap), w: box.w, h: box.h };
}

function stages(L, t) {
  const { box } = L;
  const frames = [];
  const marks = [];
  const labels = [];

  for (const [i, stage] of STAGES.entries()) {
    const { x, y, w, h } = slot(L, i);
    frames.push(`<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}"/>`);

    if (stage.stochastic) {
      marks.push(...hatch(x + 1, y + 1, w - 2, h - 2, t));
      // flagged on the edge rather than above the label: the narrow rows are only
      // 38px tall, and anything inside the cell strikes through the word
      marks.push(`<rect x="${x}" y="${y}" width="2.5" height="${h}" fill="${t.accent}"/>`);
    }

    labels.push(
      monoText({ x: x + box.padX, y: y + box.keyY, size: L.keySize, tracking: 1.7, fill: t.ink, children: stage.key }),
      monoText({ x: x + box.padX, y: y + box.noteY, size: L.noteSize, tracking: 1.2, fill: t.mut, children: stage.note }),
      monoText({
        x: x + w - box.padX, y: y + box.keyY, size: L.noteSize, tracking: 1.2,
        fill: t.mut, anchor: 'end', children: String(i + 1).padStart(2, '0'),
      }),
    );
  }

  return { frames, marks, labels };
}

/** Arrows between consecutive stages, drawn inside the gap. */
function connectors(L) {
  const inset = 13;
  const lines = [];

  for (let i = 0; i < STAGES.length - 1; i += 1) {
    const from = slot(L, i);
    const to = slot(L, i + 1);
    if (L.orient === 'row') {
      const y = from.y + Math.round(from.h / 2) + 0.5;
      lines.push(...arrow({ x1: from.x + from.w + inset, y1: y, x2: to.x - inset, y2: y }));
    } else {
      const x = Math.round(from.w / 2) + 0.5;
      lines.push(...arrow({ x1: x, y1: from.y + from.h + 1, x2: x, y2: to.y - 1 }));
    }
  }
  return lines;
}

/**
 * State feeds back into ingest. Routed as a drawn path with the label knocked out of
 * the line, the way a drawing breaks a line rather than crowding text alongside it.
 */
function returnPath(L, t) {
  const first = slot(L, 0);
  const last = slot(L, STAGES.length - 1);

  if (L.orient === 'row') {
    const y = L.returnY + 0.5;
    const fromX = last.x + Math.round(last.w / 2) + 0.5;
    const toX = first.x + Math.round(first.w / 2) + 0.5;
    const labelX = toX + 132;
    const labelW = RETURN_LABEL.length * (L.tickSize * 0.62 + 1.3) + 20;
    return {
      path: [
        `<line x1="${fromX}" y1="${last.y + last.h + 1}" x2="${fromX}" y2="${y}"/>`,
        `<line x1="${fromX}" y1="${y}" x2="${toX}" y2="${y}"/>`,
        ...arrow({ x1: toX, y1: y, x2: toX, y2: first.y + first.h + 1 }),
      ],
      label: [
        `<rect x="${labelX - labelW / 2}" y="${y - 7}" width="${labelW}" height="14" fill="${t.bg}"/>`,
        monoText({ x: labelX, y: y + 3.5, size: L.tickSize, tracking: 1.3, fill: t.mut, anchor: 'middle', children: RETURN_LABEL }),
      ],
    };
  }

  const x = L.returnX + 0.5;
  const fromY = last.y + Math.round(last.h / 2) + 0.5;
  const toY = first.y + Math.round(first.h / 2) + 0.5;
  const midY = (fromY + toY) / 2;
  return {
    path: [
      `<line x1="${last.x + last.w + 1}" y1="${fromY}" x2="${x}" y2="${fromY}"/>`,
      `<line x1="${x}" y1="${fromY}" x2="${x}" y2="${toY}"/>`,
      ...arrow({ x1: x, y1: toY, x2: first.x + first.w + 1, y2: toY }),
    ],
    // set sideways, so the channel stays 40px wide instead of the label's length
    label: [
      `<text x="${x - 7}" y="${midY}" font-family="${FONTS.mono}" font-size="${L.tickSize}" letter-spacing="1.3" fill="${t.mut}" text-anchor="middle" transform="rotate(-90 ${x - 7} ${midY})">REPLAY</text>`,
    ],
  };
}

export function renderSystem(mode = 'dark', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const { frames, marks, labels } = stages(L, t);
  const back = returnPath(L, t);

  const headline = L.head.map(
    (line, i) =>
      `<text x="0" y="${L.headY + i * L.headLead}" font-family="${FONTS.serif}" font-size="${L.headSize}" letter-spacing="-0.3" fill="${t.ink}">${esc(line)}</text>`,
  );

  return document({
    width: L.W,
    height: L.H,
    label:
      'System shape: ingest, policy, model, contract, state. One stochastic cell with ' +
      'deterministic contracts on both sides, and a replay path from state back to ingest. ' +
      'Applied in RoleLens, Talero ATS and Talero Talents.',
    body: [
      `<rect width="${L.W}" height="${L.H}" fill="${t.bg}"/>`,
      monoText({ x: 0, y: L.metaY, size: L.metaSize, tracking: 1.5, fill: t.mut, children: 'FIG.02 / SYSTEM SHAPE' }),
      monoText({
        x: L.W, y: L.metaY, size: L.metaSize, tracking: 1.5, fill: t.mut,
        anchor: 'end', children: 'DETERMINISTIC AT THE EDGES',
      }),
      ...measure({ width: L.W, y: L.ruleY, color: t.hair, ticks: L.ticks }),
      ...headline,
      `<rect x="0" y="${L.accentY}" width="${L.accentW}" height="2.5" fill="${t.accent}"/>`,
      ...marks,
      `<g stroke="${t.rule}" stroke-width="1" fill="none" shape-rendering="crispEdges">`,
      ...frames,
      '</g>',
      `<g stroke="${t.hair}" stroke-width="1" fill="none" stroke-linecap="square">`,
      ...connectors(L),
      ...back.path,
      '</g>',
      ...back.label,
      ...labels,
      monoText({ x: 0, y: L.footY, size: L.noteSize + 1, tracking: 1.3, fill: t.mut, children: FOOTNOTE }),
    ],
  });
}
