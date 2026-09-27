// Numbers from production, one tile each, every tile with a small picture of what
// the number means: dots you could count, bars you can compare, the systems a test
// suite runs on. Static: numbers should hold still.

import { document, fontFaces, n, pickLayout, pill, text, theme, tone, wrap } from './tokens.mjs';

const LAYOUTS = {
  wide: { W: 1200, cols: 6, gap: 14, tileH: 250, big: 40 },
  narrow: { W: 480, cols: 2, gap: 12, tileH: 238, big: 36 },
};

function dots({ x, y, w, count, caption }, t) {
  const pitch = 7;
  const cols = Math.floor(w / pitch);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(`<circle cx="${n(x + 2 + (i % cols) * pitch)}" cy="${n(y + 2 + Math.floor(i / cols) * pitch)}" r="2" fill="${t.accent}" opacity=".8"/>`);
  }
  const rows = Math.ceil(count / cols);
  out.push(text({ x, y: y + rows * pitch + 14, size: 10.5, mono: true, fill: t.mut, children: caption }));
  return out;
}

function bars({ x, y, w, rows }, t) {
  const max = Math.max(...rows.map((r) => r.value));
  const labelW = 88;
  return rows.flatMap((r, i) => {
    const yy = y + i * 20;
    const len = Math.max(3, ((w - labelW) * r.value) / max);
    return [
      text({ x, y: yy + 9, size: 10.5, mono: true, fill: t.mut, children: r.label }),
      `<rect x="${n(x + labelW)}" y="${yy + 2}" width="${n(len)}" height="8" rx="4" fill="${tone(t, r.tone === 'dot' ? 'mut' : r.tone)}" opacity="${r.tone === 'dot' ? 0.45 : 0.9}"/>`,
    ];
  });
}

function chips({ x, y, labels }, t) {
  const out = [];
  let cx = x;
  for (const label of labels) {
    const p = pill({ x: cx, y, label, t, size: 11, h: 22 });
    out.push(p.svg);
    cx += p.w + 5;
  }
  return out;
}

export function renderNumbers(tiles, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const rows = Math.ceil(tiles.length / L.cols);
  const tileW = (L.W - L.gap * (L.cols - 1)) / L.cols;
  const H = rows * L.tileH + (rows - 1) * L.gap;
  const body = [];

  tiles.forEach((tile, i) => {
    const x = (i % L.cols) * (tileW + L.gap);
    const y = Math.floor(i / L.cols) * (L.tileH + L.gap);
    const inner = tileW - 36;
    body.push(
      `<rect x="${n(x + 0.5)}" y="${y + 0.5}" width="${n(tileW - 1)}" height="${L.tileH - 1}" rx="18" fill="${t.bg}" stroke="${t.line}"/>`,
      text({ x: x + 18, y: y + 58, size: L.big, weight: 700, tracking: -0.03, fill: t.ink, children: tile.big }),
      `<rect x="${n(x + 18)}" y="${y + 72}" width="26" height="3" rx="1.5" fill="${t.accent}"/>`,
      ...wrap(tile.label, 13, inner).map((line, j) =>
        text({ x: x + 18, y: y + 100 + j * 18, size: 13, fill: t.mut, children: line }),
      ),
    );
    const vy = y + L.tileH - 66;
    const v = tile.viz;
    if (v.type === 'dots') body.push(...dots({ x: x + 18, y: vy - (v.count > 60 ? 12 : 0), w: inner, ...v }, t));
    if (v.type === 'bars') body.push(...bars({ x: x + 18, y: vy + 10, w: inner, rows: v.rows }, t));
    if (v.type === 'chips') body.push(...chips({ x: x + 18, y: vy + 14, labels: v.labels }, t));
  });

  return document({
    width: L.W,
    height: H,
    label: tiles.map((tile) => `${tile.big}: ${tile.label}`).join('. '),
    style: fontFaces(),
    body,
  });
}
