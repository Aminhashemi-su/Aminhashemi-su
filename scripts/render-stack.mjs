// The stack as the layers of one running system rather than a wall of logos: what
// people see, where requests land, where the model sits, what it remembers, how it
// ships, and the trust layer that decides whether a company can say yes. A single
// request travels down through every layer and back up on the right.

import { document, flow, fontFaces, frame, n, pickLayout, text, theme } from './tokens.mjs';

const LAYOUTS = {
  wide: { W: 1200, pad: 22, labelW: 200, railInset: 46, chipSize: 14, chipH: 30, gapY: 10 },
  narrow: { W: 480, pad: 14, labelW: 0, railInset: 26, chipSize: 12.5, chipH: 26, gapY: 8 },
};

export function renderStack(layers, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const railX = L.W - L.pad - L.railInset;
  const body = [];
  const centers = [];
  let y = L.pad;

  for (const layer of layers) {
    const trust = layer.tone === 'accent';
    const left = L.pad + 22;
    const chipsX = L.labelW ? left + L.labelW : left;
    const chipsY = L.labelW ? y + 20 : y + 56;
    const chips = flow({
      x: chipsX, y: chipsY, maxX: railX - 34, labels: layer.items, t,
      size: L.chipSize, h: L.chipH, gapY: L.gapY, tone: trust ? 'accent' : 'ink', fill: t.card,
    });
    const chipsH = chips.rows * L.chipH + (chips.rows - 1) * L.gapY;
    const h = (chipsY - y) + chipsH + 20;
    const labelY = L.labelW ? y + h / 2 - 3 : y + 26;

    body.push(
      `<rect x="${L.pad + 0.5}" y="${n(y + 0.5)}" width="${L.W - 2 * L.pad - 1}" height="${n(h - 1)}" rx="16" fill="${t.bg}" stroke="${trust ? t.accent : t.line}"${trust ? ' stroke-dasharray="4 4"' : ''}/>`,
      text({ x: left, y: labelY, size: 12, mono: true, tracking: 0.08, fill: t.accent, children: layer.name.toUpperCase() }),
      text({ x: left, y: labelY + 19, size: 13, fill: t.mut, children: layer.note }),
      ...chips.svg,
    );
    centers.push(y + h / 2);
    y += h + 10;
  }

  // one request, down through the stack and back up
  const top = centers[0];
  const bottom = centers[centers.length - 1];
  body.push(`<line x1="${railX}" y1="${n(top)}" x2="${railX}" y2="${n(bottom)}" stroke="${t.line}" stroke-width="2"/>`);
  for (const c of centers) body.push(`<circle cx="${railX}" cy="${n(c)}" r="4" fill="${t.card}" stroke="${t.mut}" stroke-width="1.5"/>`);
  body.push(
    `<circle cx="${railX}" cy="${n(top)}" r="5.5" fill="${t.accent}">` +
      `<animate attributeName="cy" values="${n(top)};${n(bottom)};${n(top)}" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="7s" repeatCount="indefinite"/></circle>`,
  );

  const H = y - 10 + L.pad;
  return document({
    width: L.W,
    height: H,
    label: layers.map((l) => `${l.name}: ${l.items.join(', ')}`).join('. '),
    style: fontFaces(),
    body: [frame(L.W, H, 26, t), ...body],
  });
}
