// The rest of the work, as cards. Each card carries one small drawing of the thing
// that made the project worth doing: the Big Five chart the report is built on, the
// three game worlds, the load time that fell, the language switch, the two rebuilds.

import { document, fontFaces, n, pickLayout, pill, text, theme, wrap } from './tokens.mjs';

const LAYOUTS = {
  wide: { W: 1200, cols: 3, gap: 16, cardH: 272 },
  narrow: { W: 480, cols: 1, gap: 14, cardH: 250 },
};

const arrow = (x, y, t) =>
  `<path d="M${n(x)},${n(y)} h10 m-4,-4 l4,4 l-4,4" fill="none" stroke="${t.mut}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;

// ------------------------------------------------------------ small drawings
const VIZ = {
  // Big Five: one person's profile against a dashed average
  radar({ x, y, caption }, t) {
    const cx = x + 32;
    const cy = y + 28;
    const R = 29;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`;
    };
    const poly = (vals) => vals.map((v, i) => pt(i, R * v)).join(' ');
    return [
      `<polygon points="${poly([1, 1, 1, 1, 1])}" fill="none" stroke="${t.line}"/>`,
      `<polygon points="${poly([0.5, 0.5, 0.5, 0.5, 0.5])}" fill="none" stroke="${t.line}"/>`,
      `<polygon points="${poly([0.6, 0.6, 0.6, 0.6, 0.6])}" fill="none" stroke="${t.mut}" stroke-dasharray="2 2"/>`,
      `<polygon points="${poly([0.9, 0.55, 0.78, 0.42, 0.7])}" fill="${t.accent}" fill-opacity=".18" stroke="${t.accent}" stroke-width="1.6"/>`,
      ...wrap(caption, 12, 190).map((line, i) => text({ x: x + 80, y: y + 24 + i * 16, size: 12, fill: t.mut, children: line })),
    ];
  },
  // three worlds, one line through them
  worlds({ x, y, labels, stat }, t) {
    const out = [];
    let cx = x;
    labels.forEach((label, i) => {
      const p = pill({ x: cx, y: y + 4, label, t, size: 12, h: 26, tone: 'ink', fill: t.card });
      out.push(p.svg);
      cx += p.w + 16;
      if (i < labels.length - 1) out.push(`<line x1="${n(cx - 15)}" y1="${y + 17}" x2="${n(cx - 1)}" y2="${y + 17}" stroke="${t.line}" stroke-width="2"/>`);
    });
    out.push(text({ x, y: y + 54, size: 14, weight: 700, fill: t.accent, children: stat }));
    return out;
  },
  // a dashboard, in seven bars
  bars({ x, y, caption, stat }, t) {
    const heights = [18, 30, 24, 40, 34, 44, 28];
    const out = heights.map(
      (h, i) => `<rect x="${x + i * 14}" y="${y + 46 - h}" width="9" height="${h}" rx="2" fill="${t.accent}" opacity="${i === 5 ? 0.95 : 0.45}"/>`,
    );
    out.push(`<line x1="${x - 2}" y1="${y + 46.5}" x2="${x + 100}" y2="${y + 46.5}" stroke="${t.line}"/>`);
    out.push(text({ x: x + 118, y: y + 20, size: 12, fill: t.mut, children: caption }));
    out.push(text({ x: x + 118, y: y + 42, size: 14, weight: 700, fill: t.accent, children: stat }));
    return out;
  },
  // page load, before and after, plus the grade
  speed({ x, y, before, after, from, to }, t) {
    const scale = 38;
    return [
      text({ x, y: y + 12, size: 10.5, mono: true, fill: t.mut, children: `before ${before} s` }),
      `<rect x="${x + 86}" y="${y + 4}" width="${n(Number(before) * scale)}" height="9" rx="4.5" fill="${t.mut}" opacity=".4"/>`,
      text({ x, y: y + 34, size: 10.5, mono: true, fill: t.mut, children: `after ${after} s` }),
      `<rect x="${x + 86}" y="${y + 26}" width="${n(Number(after) * scale)}" height="9" rx="4.5" fill="${t.accent}"/>`,
      pill({ x: x + 86, y: y + 44, label: `GTmetrix ${from}`, t, size: 11, h: 22, tone: 'warn' }).svg,
      arrow(x + 186, y + 55, t),
      pill({ x: x + 204, y: y + 44, label: to, t, size: 11, h: 22, tone: 'ok' }).svg,
    ];
  },
  // one listing, two languages
  translate({ x, y, pair, stat }, t) {
    const a = pill({ x, y: y + 6, label: pair[0], t, size: 13, h: 28, tone: 'ink', fill: t.card });
    const bx = x + a.w + 40;
    return [
      a.svg,
      `<path d="M${n(x + a.w + 8)},${y + 15} h24 m-4,-4 l4,4 l-4,4 M${n(bx - 8)},${y + 25} h-24 m4,-4 l-4,4 l4,4" fill="none" stroke="${t.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      pill({ x: bx, y: y + 6, label: pair[1], t, size: 13, h: 28, tone: 'ink', fill: t.card }).svg,
      text({ x, y: y + 56, size: 14, weight: 700, fill: t.accent, children: stat }),
    ];
  },
  // the same site, three stacks
  steps({ x, y, labels }, t) {
    const out = [];
    let cx = x;
    labels.forEach((label, i) => {
      const last = i === labels.length - 1;
      const p = pill({ x: cx, y: y + 12, label, t, size: 12, h: 26, tone: last ? 'accent' : 'ink', fill: t.card });
      out.push(p.svg);
      cx += p.w;
      if (!last) {
        out.push(arrow(cx + 6, y + 25, t));
        cx += 24;
      }
    });
    return out;
  },
};

export function renderProjects(projects, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const rows = Math.ceil(projects.length / L.cols);
  const cardW = (L.W - L.gap * (L.cols - 1)) / L.cols;
  const H = rows * L.cardH + (rows - 1) * L.gap;
  const body = [];

  projects.forEach((p, i) => {
    const x = (i % L.cols) * (cardW + L.gap);
    const y = Math.floor(i / L.cols) * (L.cardH + L.gap);
    const inner = cardW - 44;
    const desc = wrap(p.desc, 14, inner).slice(0, 3);
    body.push(
      `<rect x="${n(x + 0.5)}" y="${y + 0.5}" width="${n(cardW - 1)}" height="${L.cardH - 1}" rx="20" fill="${t.bg}" stroke="${t.line}"/>`,
      text({ x: x + 22, y: y + 36, size: 11, mono: true, tracking: 0.06, fill: t.accent, children: p.kicker }),
      text({ x: x + 21, y: y + 68, size: 23, weight: 700, tracking: -0.02, fill: t.ink, children: p.name }),
      ...desc.map((line, j) => text({ x: x + 22, y: y + 96 + j * 20, size: 14, fill: t.mut, children: line })),
      ...VIZ[p.viz.type]({ x: x + 22, y: y + L.cardH - 112, ...p.viz }, t),
      `<line x1="${x + 22}" y1="${y + L.cardH - 44}" x2="${n(x + cardW - 22)}" y2="${y + L.cardH - 44}" stroke="${t.line}"/>`,
      text({ x: x + 22, y: y + L.cardH - 20, size: 11.5, mono: true, fill: t.mut, children: p.stack }),
    );
  });

  return document({
    width: L.W,
    height: H,
    label: projects.map((p) => `${p.name}: ${p.desc}`).join(' '),
    style: fontFaces(),
    body,
  });
}
