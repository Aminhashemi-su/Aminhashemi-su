// The masthead. Above: availability, the name, the role and one line of intent.
// Below: the idea behind most of the work, drawn as data. A stream of job ads flows
// left into a lens; almost all of them stop there, and a few pass through to the
// count of what was actually worth reading.
//
// Animated, but every frame is complete. GitHub's mobile app and some image proxies
// show only the first frame, so nothing starts hidden: each dot is drawn where its
// animation would be at t = 0, and the motion is expressed relative to that point.
//
// No portrait: GitHub shows the avatar immediately to the left of this image.

import { document, fontFaces, frame, n, pickLayout, rng, text, theme, wrap } from './tokens.mjs';

const LAYOUTS = {
  wide: {
    W: 1200, H: 572, R: 28, pad: 64,
    status: { y: 82, size: 18 }, statusKey: 'status', urlTop: true,
    name: { y: 190, size: 96 },
    role: { y: 244, size: 36 },
    intro: { y: 292, size: 20, lh: 28 },
    band: { x0: 64, y0: 360, y1: 504 },
    lens: { x: 846, y: 432, ry: 80, bulge: 24 },
    out: { x: 986, y: 432 },
    count: { x: 1136, y: 448, size: 64, subY: 478, subSize: 15 },
    foot: [{ y: 544, anchor: 'start', key: 'read' }, { y: 544, anchor: 'end', key: 'source' }],
    footSize: 13, dots: 170, chosen: 7,
  },
  // 480px is one column: the stream runs down the middle, the count sits under it
  narrow: {
    W: 480, H: 752, R: 22, pad: 28,
    status: { y: 54, size: 15 }, statusKey: 'statusShort', urlTop: false,
    name: { y: 124, size: 54 },
    role: { y: 164, size: 21 },
    intro: { y: 204, size: 16, lh: 23 },
    band: { x0: 28, y0: 300, y1: 536 },
    lens: { x: 318, y: 418, ry: 112, bulge: 20 },
    out: { x: 420, y: 418 },
    count: { x: 452, y: 612, size: 52, subY: 638, subSize: 13 },
    foot: [{ y: 688, anchor: 'start', key: 'read' }, { y: 710, anchor: 'start', key: 'source' }],
    footSize: 11.5, dots: 100, chosen: 5,
  },
};

const quad = (a, c, b, s) => ({
  x: (1 - s) ** 2 * a.x + 2 * (1 - s) * s * c.x + s * s * b.x,
  y: (1 - s) ** 2 * a.y + 2 * (1 - s) * s * c.y + s * s * b.y,
});
const lerp = (a, b, s) => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });
// animateMotion translates from the element's own position, so paths are written relative to it
const rel = (p, o) => `${n(p.x - o.x)},${n(p.y - o.y)}`;

function loop(attr, values, keyTimes, dur, phase) {
  return `<animate attributeName="${attr}" values="${values}" keyTimes="${keyTimes}" dur="${n(dur)}s" begin="-${n(phase * dur)}s" repeatCount="indefinite"/>`;
}

export function renderHero(profile, stream, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const R = rng(20260927);
  const { band: B, lens, out: O } = L;
  const body = [
    '<defs>',
    `<pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="${t.line}"/></pattern>`,
    `<radialGradient id="halo"><stop offset="0" stop-color="${t.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>`,
    '</defs>',
    frame(L.W, L.H, L.R, t),
  ];

  // ---------------------------------------------------------------- words
  const s = L.status;
  const dot = s.size * 0.3;
  body.push(
    `<circle cx="${n(L.pad + dot)}" cy="${n(s.y - s.size * 0.34)}" r="${n(dot)}" fill="${t.ok}">` +
      `<animate attributeName="opacity" values="1;.35;1" dur="2.8s" repeatCount="indefinite"/></circle>`,
    text({ x: L.pad + dot * 2 + 10, y: s.y, size: s.size, fill: t.mut, children: profile[L.statusKey] }),
  );
  if (L.urlTop) {
    body.push(text({ x: L.W - L.pad, y: s.y, size: s.size, weight: 700, anchor: 'end', fill: t.ink, children: profile.url }));
  }
  body.push(
    text({ x: L.pad - 3, y: L.name.y, size: L.name.size, weight: 700, tracking: -0.03, fill: t.ink, children: profile.name }),
    text({ x: L.pad, y: L.role.y, size: L.role.size, tracking: -0.02, fill: t.accent, children: profile.role }),
  );
  wrap(profile.intro, L.intro.size, L.W - 2 * L.pad).forEach((line, i) =>
    body.push(text({ x: L.pad, y: L.intro.y + i * L.intro.lh, size: L.intro.size, fill: t.mut, children: line })),
  );

  // ---------------------------------------------------------------- the stream
  const gx = B.x0 - 14;
  body.push(
    `<rect x="${gx}" y="${B.y0 - 18}" width="${lens.x - gx - 36}" height="${B.y1 - B.y0 + 36}" rx="16" fill="url(#grid)" opacity=".7"/>`,
  );

  // Ads that stop at the lens: grey, fading as they arrive
  for (let i = 0; i < L.dots; i++) {
    const S = { x: B.x0 + R() * 18, y: B.y0 + R() * (B.y1 - B.y0) };
    const E = { x: lens.x - 3, y: lens.y + (R() - 0.5) * lens.ry * 0.85 };
    const C = { x: B.x0 + (lens.x - B.x0) * (0.45 + R() * 0.3), y: S.y };
    const dur = 9 + R() * 7;
    const phase = R();
    const r = 1.5 + R() * 1.9;
    const P = quad(S, C, E, phase);
    const op = phase < 0.1 ? phase / 0.1 : phase > 0.86 ? (1 - phase) / 0.14 : 1;
    body.push(
      `<circle cx="${n(P.x)}" cy="${n(P.y)}" r="${n(r)}" fill="${t.dot}" opacity="${n(op * 0.9)}">` +
        `<animateMotion dur="${n(dur)}s" begin="-${n(phase * dur)}s" repeatCount="indefinite" path="M${rel(S, P)} Q${rel(C, P)} ${rel(E, P)}"/>` +
        loop('opacity', '0;.9;.9;0', '0;.1;.86;1', dur, phase) +
        '</circle>',
    );
  }

  // The lens itself: a biconvex outline with a soft halo
  const { x: lx, y: ly, ry, bulge: bx } = lens;
  body.push(
    `<ellipse cx="${lx}" cy="${ly}" rx="${bx * 3.2}" ry="${n(ry * 1.15)}" fill="url(#halo)"/>`,
    `<path d="M${lx},${ly - ry} Q${lx + bx * 2},${ly} ${lx},${ly + ry} Q${lx - bx * 2},${ly} ${lx},${ly - ry}Z" fill="${t.accent}" fill-opacity=".13" stroke="${t.accent}" stroke-width="2"/>`,
    text({ x: lx, y: ly - ry - 16, size: 12, mono: true, anchor: 'middle', fill: t.mut, children: stream.lensLabel }),
    `<path d="M${lx + 6},${ly} L${O.x},${O.y}" stroke="${t.accent}" stroke-width="1.6" stroke-dasharray="3 6" opacity=".75">` +
      `<animate attributeName="stroke-dashoffset" values="18;0" dur="1.2s" repeatCount="indefinite"/></path>`,
  );

  // Ads that pass: blue, through the lens to the count
  for (let i = 0; i < L.chosen; i++) {
    const S = { x: B.x0 + R() * 18, y: B.y0 + (0.12 + R() * 0.76) * (B.y1 - B.y0) };
    const M = { x: lx, y: ly + (R() - 0.5) * 12 };
    const C = { x: B.x0 + (lx - B.x0) * 0.6, y: S.y };
    const dur = 12;
    const phase = (i + R() * 0.6) / L.chosen;
    const split = 0.74;
    const P = phase < split ? quad(S, C, M, phase / split) : lerp(M, O, (phase - split) / (1 - split));
    const op = phase < 0.06 ? phase / 0.06 : phase > 0.94 ? (1 - phase) / 0.06 : 1;
    body.push(
      `<circle cx="${n(P.x)}" cy="${n(P.y)}" r="3.6" fill="${t.accent}" opacity="${n(op)}">` +
        `<animateMotion dur="${dur}s" begin="-${n(phase * dur)}s" repeatCount="indefinite" path="M${rel(S, P)} Q${rel(C, P)} ${rel(M, P)} L${rel(O, P)}"/>` +
        loop('opacity', '0;1;1;0', '0;.06;.94;1', dur, phase) +
        '</circle>',
    );
  }

  // Where they land
  body.push(
    `<circle cx="${O.x}" cy="${O.y}" r="6.5" fill="none" stroke="${t.accent}" opacity=".6">` +
      `<animate attributeName="r" values="6.5;20" dur="2.4s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values=".6;0" dur="2.4s" repeatCount="indefinite"/></circle>`,
    `<circle cx="${O.x}" cy="${O.y}" r="6.5" fill="${t.accent}"/>`,
    text({ x: L.count.x, y: L.count.y, size: L.count.size, weight: 700, tracking: -0.03, anchor: 'end', fill: t.accent, children: stream.sent }),
    text({ x: L.count.x, y: L.count.subY, size: L.count.subSize, anchor: 'end', fill: t.mut, children: stream.sentLabel }),
  );

  for (const f of L.foot) {
    const x = f.anchor === 'end' ? L.W - L.pad : L.pad;
    body.push(text({ x, y: f.y, size: L.footSize, mono: true, anchor: f.anchor === 'end' ? 'end' : undefined, fill: t.mut, children: stream[f.key] }));
  }

  return document({
    width: L.W,
    height: L.H,
    label: `${profile.name}, ${profile.role} in ${profile.location}. ${profile.status}. ${profile.intro} ${stream.read}; ${stream.sent} ${stream.sentLabel}.`,
    style: fontFaces(),
    body,
  });
}
