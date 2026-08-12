// Renders the activity panel. Pure: data in, SVG string out — so the scheduled
// workflow and any local dry run produce byte-identical output.

const THEMES = {
  light: {
    bg: '#ffffff', ink: '#14161A', mut: '#787D84',
    hair: '#D9D6CF', empty: '#EFECE6', accent: '#3F6070',
    ramp: ['#C6D0D6', '#93AAB6', '#5F8296', '#3F6070'],
  },
  dark: {
    bg: '#0D1117', ink: '#E8E6E1', mut: '#7D858F',
    hair: '#2A313B', empty: '#1A2029', accent: '#7FA3B3',
    ramp: ['#2E4551', '#456776', '#628F9F', '#7FA3B3'],
  },
};

// wide sits the calendar beside the counters; narrow stacks it underneath so the
// numbers stay legible once GitHub scales the image down on a phone.
const LAYOUTS = {
  wide: {
    W: 1200, H: 268, num: 46, lab: 10, tick: 9, cell: 18, gap: 4,
    colX: [0, 236], rowY: [104, 196], calAnchor: 'right', calY: 86,
  },
  narrow: {
    W: 480, H: 372, num: 34, lab: 8.5, tick: 8, cell: 14, gap: 4,
    colX: [0, 250], rowY: [78, 148], calAnchor: 'left', calY: 226,
  },
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAY_MS = 86_400_000;

// escapes for attribute context too, since output lands in both text and aria-label
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const utc = (date) => new Date(`${date}T00:00:00Z`);

// Thresholds are relative to the busiest day in the window, so the ramp keeps its
// range whether a peak day is 8 commits or 80. Returns 0 (empty) or 1..4.
function level(count, peak) {
  if (count <= 0) return 0;
  const top = Math.max(4, peak);
  if (count >= top * 0.5) return 4;
  if (count >= top * 0.25) return 3;
  if (count >= top * 0.1) return 2;
  return 1;
}

export function renderActivity(data, mode = 'dark', layout = 'wide') {
  const t = THEMES[mode];
  const L = LAYOUTS[layout];
  if (!t) throw new Error(`unknown theme: ${mode}`);
  if (!L) throw new Error(`unknown layout: ${layout}`);

  const { W, H } = L;
  const weeks = data.weeks; // [[{date,count} x7] ...] oldest first
  const step = L.cell + L.gap;
  const calW = weeks.length * step - L.gap;
  const calX = L.calAnchor === 'right' ? W - calW : 0;
  const { calY } = L;
  const peak = weeks.flat().reduce((m, d) => Math.max(m, d.count), 0);

  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(data.alt)}">`);
  o.push(`<rect width="${W}" height="${H}" fill="${t.bg}"/>`);

  // measure rule
  o.push(`<g stroke="${t.hair}" stroke-width="1" shape-rendering="crispEdges">`);
  o.push(`<line x1="0" y1="26.5" x2="${W}" y2="26.5"/>`);
  for (const x of [0, 40, 80]) o.push(`<line x1="${x + 0.5}" y1="26" x2="${x + 0.5}" y2="32"/>`);
  o.push('</g>');

  o.push(`<g font-family="${MONO}" fill="${t.mut}">`);
  o.push(`<text x="0" y="16" font-size="${L.tick + 1}" letter-spacing="1.5">ACTIVITY / LAST ${weeks.length} WEEKS</text>`);
  o.push(`<text x="${W}" y="16" font-size="${L.tick + 1}" letter-spacing="1.5" text-anchor="end">UPDATED ${esc(data.updated)}</text>`);
  o.push('</g>');

  // counters: two columns of two
  for (const [i, s] of data.stats.slice(0, 4).entries()) {
    const x = L.colX[i % 2];
    const y = L.rowY[Math.floor(i / 2)];
    o.push(`<text x="${x}" y="${y}" font-family="${SERIF}" font-size="${L.num}" letter-spacing="-1" fill="${t.ink}">${esc(s.value)}</text>`);
    o.push(`<rect x="${x}" y="${y + 12}" width="24" height="2" fill="${t.accent}"/>`);
    o.push(`<text x="${x}" y="${y + 32}" font-family="${MONO}" font-size="${L.lab}" letter-spacing="1.3" fill="${t.mut}">${esc(s.label)}</text>`);
  }

  // month ticks above the calendar, one per month change
  o.push(`<g font-family="${MONO}" font-size="${L.tick}" letter-spacing="1.1" fill="${t.mut}">`);
  let lastMonth = -1;
  for (const [i, w] of weeks.entries()) {
    const first = w.find((d) => d.date); // leading week may be padded
    if (!first || i === weeks.length - 1) continue;
    const m = utc(first.date).getUTCMonth();
    if (m === lastMonth) continue;
    lastMonth = m;
    o.push(`<text x="${calX + i * step}" y="${calY - 12}">${MONTHS[m]}</text>`);
  }
  o.push('</g>');

  // calendar
  o.push('<g shape-rendering="crispEdges">');
  for (const [wi, w] of weeks.entries()) {
    for (const [di, d] of w.entries()) {
      if (!d.date) continue;
      const lv = level(d.count, peak);
      const fill = lv === 0 ? t.empty : t.ramp[lv - 1];
      o.push(`<rect x="${calX + wi * step}" y="${calY + di * step}" width="${L.cell}" height="${L.cell}" fill="${fill}"/>`);
    }
  }
  o.push('</g>');

  // legend
  const legY = calY + 7 * step + 12;
  const sw = L.tick + 1;
  const swatches = [t.empty, ...t.ramp];
  o.push(`<g font-family="${MONO}" font-size="${L.tick}" letter-spacing="1.1" fill="${t.mut}">`);
  o.push(`<text x="${calX}" y="${legY + sw}">LESS</text>`);
  for (const [i, c] of swatches.entries()) {
    o.push(`<rect x="${calX + 40 + i * (sw + 4)}" y="${legY}" width="${sw}" height="${sw}" fill="${c}" shape-rendering="crispEdges"/>`);
  }
  o.push(`<text x="${calX + 40 + swatches.length * (sw + 4) + 4}" y="${legY + sw}">MORE</text>`);
  o.push(`<text x="${W}" y="${legY + sw}" text-anchor="end">PEAK ${peak} / DAY</text>`);
  o.push('</g>');

  o.push('</svg>');
  return `${o.join('\n')}\n`;
}

// Groups a flat [{date,count}] series into Sunday-aligned weeks of 7, padding both
// ends with {date:null} so partial weeks keep their weekday alignment. Any gap in
// the series is filled with zeroes rather than silently shifting later days.
export function groupIntoWeeks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  const filled = [];
  let cursor = utc(sorted[0].date).getTime();
  for (const d of sorted) {
    const at = utc(d.date).getTime();
    while (cursor < at) {
      filled.push({ date: new Date(cursor).toISOString().slice(0, 10), count: 0 });
      cursor += DAY_MS;
    }
    filled.push(d);
    cursor = at + DAY_MS;
  }

  const weeks = [];
  let cur = new Array(utc(filled[0].date).getUTCDay()).fill(null).map(() => ({ date: null, count: 0 }));
  for (const d of filled) {
    cur.push(d);
    if (cur.length === 7) { weeks.push(cur); cur = []; }
  }
  if (cur.length > 0) {
    while (cur.length < 7) cur.push({ date: null, count: 0 });
    weeks.push(cur);
  }
  return weeks;
}

export function summarise(weeks, recentWeeks) {
  const sums = weeks.map((w) => w.reduce((s, d) => s + d.count, 0));
  const total = sums.reduce((s, n) => s + n, 0);
  const best = weeks.flat().reduce((m, d) => Math.max(m, d.count), 0);

  // Weeks, not days: a working week with a quiet Saturday is still a shipped week,
  // and a daily streak penalises that without saying anything about output.
  let run = 0;
  let weeklyStreak = 0;
  for (const n of sums) {
    run = n > 0 ? run + 1 : 0;
    weeklyStreak = Math.max(weeklyStreak, run);
  }

  const recent = sums.slice(-recentWeeks);
  const activeWeeks = recent.filter((n) => n > 0).length;
  const ratio = recent.length > 0 ? activeWeeks / recent.length : 0;
  const cadence = ratio >= 0.75 ? 'Weekly' : ratio >= 0.5 ? 'Steady' : 'Bursts';

  return { total, best, weeklyStreak, cadence, activeWeeks };
}
