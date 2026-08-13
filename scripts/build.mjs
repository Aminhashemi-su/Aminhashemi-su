// Generates every SVG in assets/ from one profile definition plus live contribution
// data. Run by .github/workflows/activity.yml on a daily schedule.
//
//   GITHUB_TOKEN=<token> node scripts/build.mjs
//
// Pass --from <file.json> to build from a saved snapshot instead of calling the API,
// which is how layout changes get checked offline. The file holds either a
// [{date,count}] array or { days: [...], commits: <number> }.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { MODES } from './tokens.mjs';
import { renderHeader } from './render-header.mjs';
import { renderDivider } from './render-divider.mjs';
import { ICON_NAMES, renderIcon } from './render-icons.mjs';
import {
  CALENDAR_WEEKS,
  RECENT_WINDOW_DAYS,
  groupIntoWeeks,
  renderActivity,
  summarise,
} from './render-activity.mjs';

const USER = process.env.GH_USER ?? 'Aminhashemi-su';
const REQUEST_TIMEOUT_MS = 20_000;

const PROFILE = {
  name: 'Amin Hashemi',
  role: 'AI ENGINEER · FULL-STACK DEVELOPER',
  eyebrow: 'PROFILE / 2026',
  location: 'STOCKHOLM / LINKÖPING · SWEDEN',
  locationShort: 'STOCKHOLM · SE',
  primaryLanguages: 'TYPESCRIPT / PYTHON / SQL',
};

// assets/ resolved from this file, so the script runs from any working directory
const ASSETS = new URL('../assets/', import.meta.url);
const ICONS = new URL('icons/', ASSETS);

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

/**
 * contributionsCollection mirrors what the profile itself shows, so private work is
 * included only while "Include private contributions on my profile" is enabled.
 */
async function fetchDays(token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${USER}-profile-build`,
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: USER } }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  if (body.errors) throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`No contribution data returned for ${USER}`);

  return calendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount }));
}

async function loadDays() {
  const i = process.argv.indexOf('--from');
  if (i > -1) {
    const path = process.argv[i + 1];
    if (!path) throw new Error('--from needs a file path');
    return JSON.parse(readFileSync(path, 'utf8'));
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is required (or pass --from <file.json>)');
  return fetchDays(token);
}

function activityData(days) {
  const weeks = groupIntoWeeks(days);
  const stats = summarise(weeks);

  return {
    updated: new Date().toISOString().slice(0, 10),
    weeks: weeks.slice(-CALENDAR_WEEKS),
    primary: PROFILE.primaryLanguages,
    stats: [
      { value: stats.total, label: 'CONTRIBUTIONS / 12 MO' },
      // paired with the yearly total this shows the work is still happening,
      // which a single cumulative number never does
      { value: stats.recent, label: `LAST ${RECENT_WINDOW_DAYS} DAYS` },
      { value: stats.weeklyStreak, label: 'LONGEST STREAK / WEEKS' },
      // a public repo count understates the work; most of it ships from private repos
      { value: 'Private', label: 'MOST REPOSITORIES' },
    ],
    alt:
      `${stats.total} contributions in the last year, ${stats.recent} in the last ` +
      `${RECENT_WINDOW_DAYS} days, longest streak ${stats.weeklyStreak} weeks, most repositories private.`,
    summary: stats,
  };
}

const days = await loadDays();
if (days.length === 0) throw new Error('No contribution data to render');
const data = activityData(days);

mkdirSync(ASSETS, { recursive: true });
mkdirSync(ICONS, { recursive: true });

const written = [];
const write = (url, name, svg) => {
  writeFileSync(new URL(name, url), svg);
  written.push(name);
};

for (const mode of MODES) {
  const suffix = mode === 'dark' ? '-dark' : '';
  write(ASSETS, `header${suffix}.svg`, renderHeader(PROFILE, mode, 'wide'));
  write(ASSETS, `header-mobile${suffix}.svg`, renderHeader(PROFILE, mode, 'narrow'));
  write(ASSETS, `activity${suffix}.svg`, renderActivity(data, mode, 'wide'));
  write(ASSETS, `activity-mobile${suffix}.svg`, renderActivity(data, mode, 'narrow'));
}

write(ASSETS, 'divider.svg', renderDivider());
for (const name of ICON_NAMES) write(ICONS, `${name}.svg`, renderIcon(name));

const { summary } = data;
console.log(
  `built ${written.length} assets — ${summary.total} contributions (${summary.recent} in the last ` +
    `${RECENT_WINDOW_DAYS} days), longest ${summary.weeklyStreak} weeks, ` +
    `${summary.activeWeeks} weeks active, peak ${summary.best}/day`,
);
