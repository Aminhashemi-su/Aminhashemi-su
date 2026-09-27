// One product drawn as the pipeline it really is: numbered stages, a rail beneath
// them, and packets of data travelling the rail. Each packet stops where the real
// system stops that kind of input, so the motion tells the story: in Talero ATS
// every CV reaches a recruiter unless it cannot be read; in RoleLens most ads drop
// out early and very few reach the end.
//
// Wide: stages side by side, notes under each stage. Narrow: the same stages as a
// vertical timeline, so it stays readable at phone width.

import { document, flow, fontFaces, frame, n, pill, text, theme, tone, wrap } from './tokens.mjs';

const LOOP = 10; // seconds for one packet journey

/** Packets on a rail. `stops` are the stage positions along the rail's axis. */
function packets(list, stops, across, axis, t) {
  const first = stops[0];
  const span = Math.abs(stops[stops.length - 1] - first) || 1;
  const along = axis === 'x' ? 'cx' : 'cy';
  const other = axis === 'x' ? 'cy' : 'cx';
  return list.map(({ stop, kind, phase }) => {
    const to = stops[stop];
    const arrive = n(0.06 + (0.78 * Math.abs(to - first)) / span);
    const gone = n(Math.min(arrive + 0.08, 0.98));
    const fill = kind === 'warn' ? t.warn : kind === 'end' ? t.accent : t.dot;
    const r = kind === 'end' ? 5.5 : 4.5;
    // where the animation is at t = 0, so a still frame shows the same picture
    const progress = phase <= 0.04 ? 0 : phase >= arrive ? 1 : (phase - 0.04) / (arrive - 0.04);
    const opacity = phase < 0.04 ? phase / 0.04 : phase <= arrive ? 1 : phase <= gone ? 1 - (phase - arrive) / (gone - arrive) : 0;
    const begin = `-${n(phase * LOOP)}s`;
    return (
      `<circle ${along}="${n(first + (to - first) * progress)}" ${other}="${n(across)}" r="${r}" fill="${fill}" opacity="${n(opacity)}">` +
      `<animate attributeName="${along}" values="${n(first)};${n(first)};${n(to)};${n(to)}" keyTimes="0;.04;${arrive};1" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.04;${arrive};${gone};1" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite"/>` +
      '</circle>'
    );
  });
}

/** A soft ring that pulses where the finished packets land. */
const landing = (cx, cy, t) =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="7" fill="none" stroke="${t.accent}" opacity=".5">` +
  `<animate attributeName="r" values="7;17" dur="2.2s" repeatCount="indefinite"/>` +
  `<animate attributeName="opacity" values=".5;0" dur="2.2s" repeatCount="indefinite"/></circle>`;

function notes(list, x, y, maxW, t, size = 13, lh = 18) {
  const out = [];
  for (const note of list) {
    const weight = note.tone === 'accent' ? 700 : 500;
    const lines = wrap(note.text, size, maxW, { weight });
    lines.forEach((line, i) => out.push(text({ x, y: y + i * lh, size, weight, fill: tone(t, note.tone), children: line })));
    y += lines.length * lh + 8;
  }
  return { svg: out, bottom: y };
}

const label = (sys) => `${sys.title}. ${sys.summary} ${sys.nodes.map((s, i) => `${i + 1}. ${s.title}`).join('; ')}.`;

function wide(sys, t) {
  const W = 1200;
  const pad = 56;
  const body = [];

  body.push(text({ x: pad, y: 74, size: 12.5, mono: true, tracking: 0.08, fill: t.accent, children: sys.kicker }));
  body.push(text({ x: pad - 2, y: 128, size: 46, weight: 700, tracking: -0.02, fill: t.ink, children: sys.title }));
  const summary = wrap(sys.summary, 18, 720);
  summary.forEach((line, i) => body.push(text({ x: pad, y: 168 + i * 26, size: 18, fill: t.mut, children: line })));

  let bx = W - pad;
  for (const b of [...sys.badges].reverse()) {
    const p = pill({ x: bx, y: 54, label: b.label, tone: b.tone, t, anchor: 'end' });
    body.push(p.svg);
    bx -= p.w + 10;
  }

  // stages
  const top = 168 + (summary.length - 1) * 26 + 48;
  const k = sys.nodes.length;
  const gap = 26;
  const w = (W - 2 * pad - gap * (k - 1)) / k;
  const titles = sys.nodes.map((s) => wrap(s.title, 15.5, w - 28, { weight: 700 }));
  const nodeH = 50 + Math.max(...titles.map((l) => l.length)) * 19;
  const cols = sys.nodes.map((_, i) => ({ x: pad + i * (w + gap), cx: pad + i * (w + gap) + w / 2 }));
  const rail = top + nodeH + 30;

  body.push(`<line x1="${n(cols[0].cx)}" y1="${rail}" x2="${n(cols[k - 1].cx)}" y2="${rail}" stroke="${t.line}" stroke-width="2"/>`);
  cols.forEach((c, i) => {
    const s = sys.nodes[i];
    body.push(
      `<line x1="${n(c.cx)}" y1="${top + nodeH}" x2="${n(c.cx)}" y2="${rail - 6}" stroke="${t.line}" stroke-dasharray="2 3"/>`,
      `<rect x="${n(c.x + 0.5)}" y="${top + 0.5}" width="${n(w - 1)}" height="${nodeH - 1}" rx="14" fill="${t.card}" stroke="${s.tone === 'accent' ? t.accent : t.line}"/>`,
      text({ x: c.x + 14, y: top + 25, size: 11, mono: true, fill: t.accent, children: String(i + 1).padStart(2, '0') }),
      ...titles[i].map((line, j) => text({ x: c.x + 14, y: top + 49 + j * 19, size: 15.5, weight: 700, fill: t.ink, children: line })),
      `<circle cx="${n(c.cx)}" cy="${rail}" r="4.5" fill="${t.card}" stroke="${s.tone === 'accent' ? t.accent : t.mut}" stroke-width="1.5"/>`,
    );
    if (i < k - 1) {
      const gx = c.x + w + gap / 2;
      const cy = top + nodeH / 2;
      body.push(`<path d="M${n(gx - 3)},${n(cy - 5)} L${n(gx + 3)},${n(cy)} L${n(gx - 3)},${n(cy + 5)}" fill="none" stroke="${t.mut}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  });
  body.push(landing(cols[k - 1].cx, rail, t), ...packets(sys.packets, cols.map((c) => c.cx), rail, 'x', t));

  let bottom = rail;
  cols.forEach((c, i) => {
    const nt = notes(sys.nodes[i].notes, c.x + 2, rail + 36, w - 6, t);
    body.push(...nt.svg);
    bottom = Math.max(bottom, nt.bottom);
  });

  const fy = bottom + 20;
  body.push(`<line x1="${pad}" y1="${fy}" x2="${W - pad}" y2="${fy}" stroke="${t.line}"/>`);
  const foot = wrap(sys.footer, 13, W - 2 * pad - 230, { mono: true });
  foot.forEach((line, i) => body.push(text({ x: pad, y: fy + 32 + i * 20, size: 13, mono: true, fill: t.mut, children: line })));
  body.push(text({ x: W - pad, y: fy + 32, size: 15, weight: 700, anchor: 'end', fill: t.accent, children: sys.cta }));
  const H = fy + 32 + (foot.length - 1) * 20 + 30;

  return document({ width: W, height: H, label: label(sys), style: fontFaces(), body: [frame(W, H, 28, t), ...body] });
}

function narrow(sys, t) {
  const W = 480;
  const pad = 26;
  const body = [];

  body.push(text({ x: pad, y: 50, size: 11, mono: true, tracking: 0.08, fill: t.accent, children: sys.kicker }));
  body.push(text({ x: pad - 1, y: 94, size: 36, weight: 700, tracking: -0.02, fill: t.ink, children: sys.title }));
  const summary = wrap(sys.summary, 15, W - 2 * pad);
  summary.forEach((line, i) => body.push(text({ x: pad, y: 126 + i * 22, size: 15, fill: t.mut, children: line })));
  const badgeY = 126 + (summary.length - 1) * 22 + 18;
  const badges = flow({ x: pad, y: badgeY, maxX: W - pad, labels: sys.badges.map((b) => b.label), t, size: 12, h: 26 });
  body.push(...badges.svg);

  const railX = pad + 10;
  const tx = pad + 34;
  const maxW = W - tx - pad;
  let y = badgeY + badges.rows * 36 + 40;
  const stops = [];
  const steps = [];
  sys.nodes.forEach((s, i) => {
    stops.push(y - 5);
    steps.push(
      `<circle cx="${railX}" cy="${y - 5}" r="6" fill="${t.card}" stroke="${s.tone === 'accent' ? t.accent : t.mut}" stroke-width="1.5"/>`,
      text({ x: tx, y, size: 11, mono: true, fill: t.accent, children: String(i + 1).padStart(2, '0') }),
    );
    const title = wrap(s.title, 16, maxW - 30, { weight: 700 });
    title.forEach((line, j) => steps.push(text({ x: tx + 26, y: y + j * 20, size: 16, weight: 700, fill: t.ink, children: line })));
    const nt = notes(s.notes, tx + 26, y + title.length * 20 + 6, maxW - 26, t, 13, 18);
    steps.push(...nt.svg);
    y = nt.bottom + 22;
  });
  body.push(`<line x1="${railX}" y1="${stops[0]}" x2="${railX}" y2="${stops[stops.length - 1]}" stroke="${t.line}" stroke-width="2"/>`);
  body.push(...steps, landing(railX, stops[stops.length - 1], t), ...packets(sys.packets, stops, railX, 'y', t));

  const fy = y;
  body.push(`<line x1="${pad}" y1="${fy}" x2="${W - pad}" y2="${fy}" stroke="${t.line}"/>`);
  const foot = wrap(sys.footer, 11.5, W - 2 * pad, { mono: true });
  foot.forEach((line, i) => body.push(text({ x: pad, y: fy + 28 + i * 18, size: 11.5, mono: true, fill: t.mut, children: line })));
  const ctaY = fy + 28 + foot.length * 18 + 14;
  body.push(text({ x: pad, y: ctaY, size: 14, weight: 700, fill: t.accent, children: sys.cta }));
  const H = ctaY + 26;

  return document({ width: W, height: H, label: label(sys), style: fontFaces(), body: [frame(W, H, 22, t), ...body] });
}

export function renderSystem(sys, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  if (layout === 'wide') return wide(sys, t);
  if (layout === 'narrow') return narrow(sys, t);
  throw new Error(`Unknown layout "${layout}". Expected one of: wide, narrow`);
}
