// The masthead, set as a press proof: trimmed sheet, crop marks, an ink control
// strip and grain. The name prints in under a wiping roller and the role line runs
// as a flip board, because GitHub renders an SVG's own keyframes through <img> even
// though it strips every script and stylesheet from the README around it.
//
// Motion is one-shot and settles, apart from the role line. A profile that never
// stops moving is a profile nobody finishes reading.

import { FONTS, cropMarks, document, esc, grain, measure, monoText, pickLayout, theme } from './tokens.mjs';

const LAYOUTS = {
  // two columns: the name carries the left, the focus list holds the right, and the
  // measure rules tie them together. A single left-weighted block left the sheet
  // looking half-printed.
  wide: {
    W: 1200, H: 372, pad: 34, crop: { inset: 10, len: 16 },
    metaSize: 10.5, nameSize: 96, roleSize: 14, footSize: 10.5,
    metaY: 34, ruleY: 46, ticks: [0, 48, 96], nameY: 168, barY: 186, barW: 232, barH: 7,
    roleY: 232, swatchY: 270, swatch: { w: 46, h: 15, gap: 7 }, regR: 9,
    focus: { anchor: 'end', labelY: 108, y: 138, lead: 23, size: 11.5, tracking: 2.4 },
    footRuleY: 312, footY: 340,
  },
  // one column: 480px cannot hold two, so the focus list drops under the role line
  narrow: {
    W: 480, H: 330, pad: 22, crop: { inset: 7, len: 11 },
    metaSize: 8.5, nameSize: 39, roleSize: 10, footSize: 8.5,
    metaY: 26, ruleY: 36, ticks: [0, 32, 64], nameY: 108, barY: 120, barW: 104, barH: 5,
    roleY: 156, swatchY: 252, swatch: { w: 30, h: 11, gap: 5 }, regR: 7,
    focus: { anchor: null, labelY: 182, y: 202, lead: 17, size: 9, tracking: 1.8 },
    footRuleY: 286, footY: 310,
  },
};

// The flip board. One line at a time, each holding long enough to be read at a
// glance — the whole point is that a visitor learns three things, not one.
const ROLES = ['AI ENGINEER', 'AGENT & LLM SYSTEMS', 'FULL-STACK DEVELOPER'];
const CYCLE = 4.2; // seconds per line

const css = (L) => `
  .fade { opacity: 0; animation: fade .7s ease-out forwards; }
  .d1 { animation-delay: .15s } .d2 { animation-delay: .3s } .d3 { animation-delay: 1.5s }
  .wipe { transform: scaleX(0); transform-origin: 0 0;
          animation: wipe 1.05s cubic-bezier(.16,.8,.3,1) .1s forwards; }
  .bar  { transform: scaleX(0); transform-origin: ${L.pad}px 0;
          animation: wipe .5s cubic-bezier(.16,.8,.3,1) .95s forwards; }
  .ink  { opacity: 0; transform: translateY(6px);
          animation: pop .45s cubic-bezier(.16,.8,.3,1) forwards; }
  .ink1 { animation-delay: 1.15s } .ink2 { animation-delay: 1.28s } .ink3 { animation-delay: 1.41s }
  .role { opacity: 0; animation: flip ${(CYCLE * ROLES.length).toFixed(1)}s ease-in-out infinite; }
${ROLES.map((_, i) => `  .role${i + 1} { animation-delay: ${(1.6 + i * CYCLE).toFixed(2)}s }`).join('\n')}

  @keyframes fade { to { opacity: 1 } }
  @keyframes wipe { to { transform: scaleX(1) } }
  @keyframes pop  { to { opacity: 1; transform: translateY(0) } }
  @keyframes flip {
    0%  { opacity: 0; transform: translateY(7px) }
    3%  { opacity: 1; transform: translateY(0) }
    ${(100 / ROLES.length - 4).toFixed(1)}% { opacity: 1; transform: translateY(0) }
    ${(100 / ROLES.length).toFixed(1)}% { opacity: 0; transform: translateY(-7px) }
    100% { opacity: 0; transform: translateY(-7px) }
  }

  /* Motion is decoration here; the sheet has to read the same without it. */
  @media (prefers-reduced-motion: reduce) {
    .fade, .ink { opacity: 1; transform: none; animation: none }
    .wipe, .bar { transform: scaleX(1); animation: none }
    .role { animation: none; opacity: 0 }
    .role1 { opacity: 1 }
  }
`;

/** Registration mark: the crosshair a press uses to check the plates line up. */
function registration(cx, cy, r, color) {
  return [
    `<g stroke="${color}" stroke-width="1" fill="none">`,
    `<circle cx="${cx}" cy="${cy}" r="${r}"/>`,
    `<line x1="${cx - r - 5}" y1="${cy}" x2="${cx + r + 5}" y2="${cy}"/>`,
    `<line x1="${cx}" y1="${cy - r - 5}" x2="${cx}" y2="${cy + r + 5}"/>`,
    '</g>',
    `<circle cx="${cx}" cy="${cy}" r="${(r / 3).toFixed(2)}" fill="${color}"/>`,
  ];
}

/**
 * What he actually does, set as the sheet's second column. It lives here rather than
 * in the README body so the masthead answers the visitor's first question without
 * the page saying the same three things twice.
 */
function focusBlock(L, t, lines, right) {
  const { focus } = L;
  const x = focus.anchor === 'end' ? right : L.pad;
  const at = (i) => focus.y + i * focus.lead;

  return [
    monoText({
      x, y: focus.labelY, size: L.footSize - 1.5, tracking: 1.7, fill: t.mut,
      anchor: focus.anchor, cls: 'fade d3', children: 'FOCUS',
    }),
    ...lines.map((line, i) =>
      monoText({
        x, y: at(i), size: focus.size, tracking: focus.tracking, fill: t.ink,
        anchor: focus.anchor, cls: 'fade d3', children: line,
      }),
    ),
    // one accent tick, aligned to the list's edge — the only colour outside the strip
    `<rect class="fade d3" x="${focus.anchor === 'end' ? right - 18 : L.pad}" y="${focus.labelY - 16}" width="18" height="2" fill="${t.accent}"/>`,
  ];
}

/** Ink control strip — the swatches double as the page's whole colour licence. */
function controlStrip(L, t) {
  const { w, h, gap } = L.swatch;
  return t.inks.flatMap((hex, i) => [
    `<rect class="ink ink${i + 1}" x="${L.pad + i * (w + gap)}" y="${L.swatchY}" width="${w}" height="${h}" fill="${hex}"/>`,
  ]);
}

export function renderHeader(profile, mode = 'dark', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const right = L.W - L.pad;
  const location = layout === 'narrow' ? profile.locationShort : profile.location;
  const name = profile.name.toUpperCase();

  // The roller: a mask whose rect scales out from the left, so the name is laid down
  // rather than faded in. Scale rather than an animated width — geometry properties
  // are still uneven across engines, transforms are not.
  const wipe = [
    '<defs>',
    '<mask id="roller">',
    `<rect class="wipe" x="0" y="${L.nameY - L.nameSize}" width="${L.W}" height="${L.nameSize * 1.4}" fill="#fff"/>`,
    '</mask>',
    '</defs>',
  ];

  return document({
    width: L.W,
    height: L.H,
    label: `${profile.name} — ${profile.role}. ${profile.location}. Available for new work.`,
    style: css(L),
    body: [
      `<rect width="${L.W}" height="${L.H}" fill="${t.bg}"/>`,
      ...cropMarks({ width: L.W, height: L.H, color: t.hair, len: L.crop.len, inset: L.crop.inset }),
      ...wipe,

      monoText({
        x: L.pad, y: L.metaY, size: L.metaSize, tracking: 1.6, fill: t.mut,
        cls: 'fade d1', children: profile.eyebrow,
      }),
      monoText({
        x: right, y: L.metaY, size: L.metaSize, tracking: 1.6, fill: t.mut,
        anchor: 'end', cls: 'fade d1', children: location,
      }),
      ...measure({ width: right, x: L.pad, y: L.ruleY, color: t.hair, ticks: L.ticks, tickLength: 7 }),

      `<g mask="url(#roller)"><text x="${L.pad}" y="${L.nameY}" font-family="${FONTS.serif}" font-size="${L.nameSize}" font-weight="700" letter-spacing="${layout === 'narrow' ? -1 : -2.5}" fill="${t.ink}">${esc(name)}</text></g>`,
      `<rect class="bar" x="${L.pad}" y="${L.barY}" width="${L.barW}" height="${L.barH}" fill="${t.accent}"/>`,

      ...ROLES.map((line, i) =>
        monoText({
          x: L.pad, y: L.roleY, size: L.roleSize, tracking: 3.4, fill: t.ink,
          cls: `role role${i + 1}`, children: line,
        }),
      ),

      ...focusBlock(L, t, profile.focus, right),
      ...controlStrip(L, t),
      ...registration(right - L.regR - 2, L.swatchY + L.swatch.h / 2, L.regR, t.hair),
      monoText({
        x: right - L.regR * 2 - 24, y: L.swatchY + L.swatch.h - 3, size: L.footSize, tracking: 1.5,
        fill: t.mut, anchor: 'end', cls: 'fade d3', children: 'REG.',
      }),

      ...measure({ width: right, x: L.pad, y: L.footRuleY, color: t.rule }),
      monoText({
        x: L.pad, y: L.footY, size: L.footSize, tracking: 1.5, fill: t.mut,
        cls: 'fade d3', children: 'AVAILABLE FOR NEW WORK',
      }),
      monoText({
        x: right, y: L.footY, size: L.footSize, tracking: 1.5, fill: t.mut,
        anchor: 'end', cls: 'fade d3', children: 'AMINHASHEMI.COM',
      }),

      ...grain('g', { width: L.W, height: L.H, ...t.grain }),
    ],
  });
}
