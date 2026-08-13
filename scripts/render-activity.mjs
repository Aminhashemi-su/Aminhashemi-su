// Activity panel: four counters in large serif with small uppercase labels, a
// twelve-month contribution calendar, and a primary-language annotation.
// Pure — data in, SVG string out — so the workflow and a local dry run agree.

import { FONTS, document, esc, measure, monoText, pickLayout, theme } from './tokens.mjs';

export const CALENDAR_WEEKS = 52;
export const RECENT_WINDOW_DAYS = 90;
const DAY_MS = 86_400_000;
const DAYS_PER_WEEK = 7;

const LAYOUTS = {
  // counters left, calendar right: the shortest arrangement that still fits a year
  wide: {
    W: 1200, H: 250, num: 40, lab: 9.5, tick: 9, cell: 11, gap: 3,
    colX: [0, 200], rowY: [100, 180], calAnchor: 'right', calY: 62, noteY: 236,
  },
  // stacked, so the numbers stay readable once GitHub scales the image to a phone
  narrow: {
    W: 480, H: 312, num: 32, lab: 8, tick: 8, cell: 7, gap: 2,
    colX: [0, 250], rowY: [76, 146], calAnchor: 'left', calY: 212, noteY: 188,
  },
};

/** Ramp position 0..4, scaled to the busiest day so the range holds at any volume. */
function level(count, peak) {
  if (count <= 0) return 0;
  const top = Math.max(4, peak);
  if (count >= top * 0.5) return 4;
  if (count >= top * 0.25) return 3;
  if (count >= top * 0.1) return 2;
  return 1;
}

const utc = (date) => new Date(`${date}T00:00:00Z`);
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function counters(stats, L, t) {
  return stats.slice(0, 4).flatMap((stat, i) => {
    const x = L.colX[i % 2];
    const y = L.rowY[Math.floor(i / 2)];
    return [
      `<text x="${x}" y="${y}" font-family="${FONTS.serif}" font-size="${L.num}" letter-spacing="-1" fill="${t.ink}">${esc(stat.value)}</text>`,
      `<rect x="${x}" y="${y + 11}" width="24" height="2" fill="${t.accent}"/>`,
      monoText({ x, y: y + 29, size: L.lab, tracking: 1.3, fill: t.mut, children: stat.label }),
    ];
  });
}

function monthTicks(weeks, { calX, calY, step, L, t }) {
  const marks = [];
  let last = -1;
  for (const [i, week] of weeks.entries()) {
    const first = week.find((d) => d.date); // a leading week may be padded
    if (!first || i === weeks.length - 1) continue;
    const month = utc(first.date).getUTCMonth();
    if (month === last) continue;
    last = month;
    marks.push(`<text x="${calX + i * step}" y="${calY - 10}">${MONTHS[month]}</text>`);
  }
  return [`<g font-family="${FONTS.mono}" font-size="${L.tick}" letter-spacing="1.1" fill="${t.mut}">`, ...marks, '</g>'];
}

function calendar(weeks, { calX, calY, step, L, t, peak }) {
  const cells = [];
  for (const [wi, week] of weeks.entries()) {
    for (const [di, day] of week.entries()) {
      if (!day.date) continue;
      const lv = level(day.count, peak);
      const fill = lv === 0 ? t.empty : t.ramp[lv - 1];
      cells.push(`<rect x="${calX + wi * step}" y="${calY + di * step}" width="${L.cell}" height="${L.cell}" fill="${fill}"/>`);
    }
  }
  return ['<g shape-rendering="crispEdges">', ...cells, '</g>'];
}

function legend({ calX, calY, step, L, t, peak, W }) {
  const y = calY + DAYS_PER_WEEK * step + 12;
  const sw = L.tick + 1;
  const swatches = [t.empty, ...t.ramp];
  const boxes = swatches.map(
    (c, i) => `<rect x="${calX + 40 + i * (sw + 4)}" y="${y}" width="${sw}" height="${sw}" fill="${c}" shape-rendering="crispEdges"/>`,
  );
  return [
    `<g font-family="${FONTS.mono}" font-size="${L.tick}" letter-spacing="1.1" fill="${t.mut}">`,
    `<text x="${calX}" y="${y + sw}">LESS</text>`,
    ...boxes,
    `<text x="${calX + 40 + swatches.length * (sw + 4) + 4}" y="${y + sw}">MORE</text>`,
    `<text x="${W}" y="${y + sw}" text-anchor="end">PEAK ${peak} / DAY</text>`,
    '</g>',
  ];
}

export function renderActivity(data, mode = 'dark', layout = 'wide') {
  const t = theme(mode);
  const L = pickLayout(LAYOUTS, layout);
  const { W, H } = L;
  const { weeks } = data;

  const step = L.cell + L.gap;
  const calW = weeks.length * step - L.gap;
  const calX = L.calAnchor === 'right' ? W - calW : 0;
  const peak = weeks.flat().reduce((m, d) => Math.max(m, d.count), 0);
  const geom = { calX, calY: L.calY, step, L, t, peak, W };

  return document({
    width: W,
    height: H,
    label: data.alt,
    body: [
      `<rect width="${W}" height="${H}" fill="${t.bg}"/>`,
      monoText({ x: 0, y: 16, size: L.tick + 1, tracking: 1.5, fill: t.mut, children: 'ACTIVITY / LAST 12 MONTHS' }),
      monoText({ x: W, y: 16, size: L.tick + 1, tracking: 1.5, fill: t.mut, anchor: 'end', children: `UPDATED ${data.updated}` }),
      ...measure({ width: W, y: 26, color: t.hair, ticks: [0, 40, 80] }),
      ...counters(data.stats, L, t),
      monoText({ x: 0, y: L.noteY, size: L.lab, tracking: 1.3, fill: t.mut, children: `PRIMARY — ${data.primary}` }),
      ...monthTicks(weeks, geom),
      ...calendar(weeks, geom),
      ...legend(geom),
    ],
  });
}

/**
 * Groups a flat [{date,count}] series into Sunday-aligned weeks of seven, padding
 * both ends with {date:null} so partial weeks keep their weekday alignment. Gaps in
 * the series are filled with zeroes rather than silently shifting later days.
 */
export function groupIntoWeeks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  const filled = [];
  let cursor = utc(sorted[0].date).getTime();
  for (const day of sorted) {
    const at = utc(day.date).getTime();
    while (cursor < at) {
      filled.push({ date: new Date(cursor).toISOString().slice(0, 10), count: 0 });
      cursor += DAY_MS;
    }
    filled.push(day);
    cursor = at + DAY_MS;
  }

  const pad = () => ({ date: null, count: 0 });
  const weeks = [];
  let week = Array.from({ length: utc(filled[0].date).getUTCDay() }, pad);
  for (const day of filled) {
    week.push(day);
    if (week.length === DAYS_PER_WEEK) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < DAYS_PER_WEEK) week.push(pad());
    weeks.push(week);
  }
  return weeks;
}

export function summarise(weeks, { recentDays = RECENT_WINDOW_DAYS } = {}) {
  const sums = weeks.map((w) => w.reduce((s, d) => s + d.count, 0));
  const total = sums.reduce((s, n) => s + n, 0);
  const dated = weeks.flat().filter((d) => d.date);
  const best = dated.reduce((m, d) => Math.max(m, d.count), 0);

  // Recent volume alongside the yearly total: two numbers that together show both
  // scale and whether the work is still happening.
  const recent = dated.slice(-recentDays).reduce((s, d) => s + d.count, 0);

  // Weeks, not days: a working week with a quiet Saturday is still a shipped week,
  // and a daily streak penalises that without saying anything about output.
  let run = 0;
  let weeklyStreak = 0;
  for (const n of sums) {
    run = n > 0 ? run + 1 : 0;
    weeklyStreak = Math.max(weeklyStreak, run);
  }

  return { total, recent, best, weeklyStreak, activeWeeks: sums.filter((n) => n > 0).length };
}
