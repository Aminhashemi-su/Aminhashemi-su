// The masthead, drawn to match the aminhashemi.com hero and its link preview: an
// availability line, the name, the role in the accent colour, one proof line, the
// address, and on wide screens the grayscale portrait.
//
// Static on purpose. GitHub's mobile app and some image proxies show an SVG's first
// frame, so anything that starts hidden and animates in can end up invisible there.

import { dataUri, document, fontFaces, pickLayout, text, theme } from './tokens.mjs';

const LAYOUTS = {
  wide: {
    W: 1200, H: 420, R: 28, pad: 64,
    status: { y: 84, size: 18 },
    name: { y: 196, size: 96 },
    role: { y: 256, size: 38 },
    proof: { y: 322, size: 22 },
    url: { y: 358, size: 22 },
    portrait: { w: 288, h: 360, r: 24 },
  },
  // 480px holds one column, so the portrait stays with the GitHub avatar beside it
  narrow: {
    W: 480, H: 282, R: 22, pad: 28,
    status: { y: 52, size: 15 },
    name: { y: 122, size: 54 },
    role: { y: 162, size: 22 },
    proof: { y: 220, size: 16 },
    url: { y: 247, size: 16 },
    portrait: null,
  },
};

export function renderHeader(profile, mode = 'light', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const status = layout === 'narrow' ? profile.statusShort : profile.status;
  const dot = L.status.size * 0.3;

  const portrait = L.portrait
    ? (() => {
        const { w, h, r } = L.portrait;
        const x = L.W - L.pad - w;
        const y = (L.H - h) / 2;
        return [
          '<defs>',
          `<clipPath id="photo"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`,
          '</defs>',
          `<image href="${dataUri('media/portrait.jpg', 'image/jpeg')}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>`,
          `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="${t.line}"/>`,
        ];
      })()
    : [];

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

      text({ x: L.pad, y: L.proof.y, size: L.proof.size, fill: t.mut, children: profile.proof }),
      text({ x: L.pad, y: L.url.y, size: L.url.size, weight: 700, fill: t.ink, children: profile.url }),

      ...portrait,
    ],
  });
}
