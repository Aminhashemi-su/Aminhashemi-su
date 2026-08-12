// Regenerates the assets/activity*.svg panel from the GitHub API.
// Run by .github/workflows/activity.yml on a daily schedule.
//
//   GITHUB_TOKEN=<token> node scripts/build-activity.mjs
//
// Pass --from <file.json> to render from a saved [{date,count}] series instead of
// calling the API — useful for checking layout changes offline.

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { renderActivity, groupIntoWeeks, summarise } from './render-activity.mjs';

const USER = process.env.GH_USER ?? 'Aminhashemi-su';
const WEEKS = 26;
const REQUEST_TIMEOUT_MS = 20_000;

// resolved from this file, so the script works from any working directory
const ASSETS = new URL('../assets/', import.meta.url);

const VARIANTS = [
  ['activity.svg', 'light', 'wide'],
  ['activity-dark.svg', 'dark', 'wide'],
  ['activity-mobile.svg', 'light', 'narrow'],
  ['activity-mobile-dark.svg', 'dark', 'narrow'],
];

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

// contributionsCollection mirrors what the profile shows, so private contributions
// are included only while "Include private contributions on my profile" is enabled.
async function fetchDays(token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${USER}-profile-activity`,
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: USER } }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  if (body.errors) throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`No contribution calendar returned for ${USER}`);

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

const days = await loadDays();
if (days.length === 0) throw new Error('No contribution data to render');

const allWeeks = groupIntoWeeks(days);
const stats = summarise(allWeeks, WEEKS);

const data = {
  updated: new Date().toISOString().slice(0, 10),
  weeks: allWeeks.slice(-WEEKS),
  stats: [
    { value: stats.total, label: 'CONTRIBUTIONS / 12 MO' },
    { value: stats.weeklyStreak, label: 'LONGEST STREAK / WEEKS' },
    { value: stats.cadence, label: 'SHIPPING CADENCE' },
    // a public repo count understates the work; most of it ships from private repos
    { value: 'Private', label: 'MOST REPOSITORIES' },
  ],
  alt:
    `${stats.total} contributions in the last year, ` +
    `longest streak ${stats.weeklyStreak} weeks, ` +
    `${stats.cadence.toLowerCase()} shipping cadence, most repositories private.`,
};

mkdirSync(ASSETS, { recursive: true });
for (const [file, mode, layout] of VARIANTS) {
  writeFileSync(new URL(file, ASSETS), renderActivity(data, mode, layout));
}

console.log(
  `activity: ${stats.total} contributions, longest ${stats.weeklyStreak} weeks, ` +
    `${stats.activeWeeks}/${WEEKS} weeks active, cadence ${stats.cadence}, peak ${stats.best}/day`,
);
