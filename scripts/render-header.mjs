// The masthead, drawn to match the aminhashemi.com hero and its link preview: an
// availability line, the name, the role in the accent colour, one proof line and
// the address.
//
// No portrait: GitHub shows the avatar immediately to the left of this image, and
// the same face twice reads as a mistake. The wide sheet balances instead by
// setting the address against the right edge, on the proof line's baseline.
//
// Static on purpose. GitHub's mobile app and some image proxies show an SVG's first
// frame, so anything that starts hidden and animates in can end up invisible there.

import { document, fontFaces, pickLayout, text, theme } from './tokens.mjs';

const LAYOUTS = {
  wide: {
    W: 1200, H: 316, R: 28, pad: 64,
    status: { y: 78, size: 18 },
    name: { y: 180, size: 96 },
    role: { y: 238, size: 38 },
    foot: { y: 282, size: 21 },
    footRight: true,
  },
  // 480px is one column, so the address sits under the proof line instead of beside it
  narrow: {
    W: 480, H: 282, R: 22, pad: 28,
    status: { y: 52, size: 15 },
    name: { y: 122, size: 54 },
    role: { y: 162, size: 22 },
    foot: { y: 220, size: 16 },
    footRight: false,
  },
};

export function renderHeader(profile, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const status = layout === 'narrow' ? profile.statusShort : profile.status;
  const dot = L.status.size * 0.3;
  const right = L.W - L.pad;

  const address = L.footRight
    ? text({ x: right, y: L.foot.y, size: L.foot.size, weight: 700, anchor: 'end', fill: t.ink, children: profile.url })
    : text({ x: L.pad, y: L.foot.y + L.foot.size * 1.7, size: L.foot.size, weight: 700, fill: t.ink, children: profile.url });

  return document({
    width: L.W,
    height: L.H,
    label: `${profile.name}, ${profile.role} in ${profile.location}. ${profile.status}.`,
    style: fontFaces(),
    body: [
      `<rect x="0.5" y="0.5" width="${L.W - 1}" height="${L.H - 1}" rx="${L.R}" fill="${t.bg}" stroke="${t.line}"/>`,

      `<circle cx="${L.pad + dot}" cy="${L.status.y - L.status.size * 0.34}" r="${dot}" fill="${t.ok}"/>`,
      text({ x: L.pad + dot * 2 + 10, y: L.status.y, size: L.status.size, fill: t.mut, children: status }),

      text({ x: L.pad - 3, y: L.name.y, size: L.name.size, weight: 700, tracking: -0.03, fill: t.ink, children: profile.name }),
      text({ x: L.pad, y: L.role.y, size: L.role.size, tracking: -0.02, fill: t.accent, children: profile.role }),

      text({ x: L.pad, y: L.foot.y, size: L.foot.size, fill: t.mut, children: profile.proof }),
      address,
    ],
  });
}
