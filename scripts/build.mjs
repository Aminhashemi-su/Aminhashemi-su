// Generates every SVG in assets/ from the facts below. No network, no token, no
// stats widget: each number here comes from production data or a public benchmark,
// so the output is a pure function of this file and the renderers beside it.
//
//   node scripts/build.mjs
//
// Run by .github/workflows/assets.yml whenever scripts/ changes, which keeps the
// committed assets in step with the code that draws them.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { MODES } from './tokens.mjs';
import { renderHero } from './render-hero.mjs';
import { renderSystem } from './render-system.mjs';
import { renderNumbers } from './render-numbers.mjs';
import { renderProjects } from './render-projects.mjs';
import { renderStack } from './render-stack.mjs';
import { renderDivider } from './render-divider.mjs';

// ------------------------------------------------------------------ the facts

// Same wording as the aminhashemi.com hero, so the two agree.
const PROFILE = {
  name: 'Amin Hashemi',
  role: 'AI Engineer & Full-Stack Developer',
  location: 'Stockholm, Sweden',
  status: 'Open to full-time roles · Stockholm · Right to work in Sweden',
  statusShort: 'Open to full-time roles · Stockholm',
  intro: 'I build AI products end to end, and the parts that let a company trust them with real data.',
  url: 'aminhashemi.com',
};

// RoleLens and its two companion scouts, 29 Aug – 24 Sep 2026
const STREAM = {
  lensLabel: 'rank · rules · AI judge',
  sent: '685',
  sentLabel: 'sent to me, under 2% of all read',
  read: '~37,100 job ads and opportunities read',
  source: 'RoleLens + two companion scouts · 29 Aug – 24 Sep 2026',
};

const TALERO_ATS = {
  kicker: 'TALERO AI · SOLE ENGINEER',
  title: 'Talero ATS',
  summary:
    'An AI hiring platform that explains every score and keeps candidate data in the EU. Ranking people is high-risk AI under the EU AI Act, so the trust is designed in, not added.',
  badges: [{ label: 'In production', tone: 'ok' }, { label: '300+ CVs · 4 languages' }],
  nodes: [
    { title: 'CV arrives', notes: [{ text: 'PDF in any of four languages' }, { text: 'Unreadable or empty? It stops with an error, never a score', tone: 'warn' }] },
    { title: 'Pseudonymise', notes: [{ text: 'Only whitelisted fields go on: no name, contact details or raw CV text' }] },
    { title: 'Gemini in the EU', notes: [{ text: 'Vertex AI, one provider, no fallback that could send data elsewhere' }, { text: '6–10 s, chosen by measurement', tone: 'accent' }] },
    { title: 'Four-part review', notes: [{ text: 'Eligibility, skills fit, evidence and uncertainty, summarised into one recommendation' }] },
    { title: 'Audit log', notes: [{ text: 'Model, engine version and region for every decision; a PDF audit trail per application' }] },
    { title: 'Recruiter decides', tone: 'accent', notes: [{ text: 'A person makes every hiring decision. Prompts may not say "hire" or "reject"' }] },
  ],
  // every CV reaches a recruiter, unless it cannot be read
  packets: [
    { stop: 5, kind: 'end', phase: 0.0 },
    { stop: 5, kind: 'end', phase: 0.17 },
    { stop: 0, kind: 'warn', phase: 0.3 },
    { stop: 5, kind: 'end', phase: 0.42 },
    { stop: 5, kind: 'end', phase: 0.58 },
    { stop: 5, kind: 'end', phase: 0.75 },
    { stop: 5, kind: 'end', phase: 0.9 },
  ],
  footer:
    'Node.js/TypeScript API · Python/FastAPI AI pipeline · React · PostgreSQL + pgvector · Redis queues · Google Cloud · zero-downtime deploys in ~4 min',
  cta: 'Read the case study ›',
};

const ROLELENS = {
  kicker: 'OPEN SOURCE · MIT · CREATOR',
  title: 'RoleLens',
  summary:
    'Reads every new job ad in Sweden and sends me the few worth applying to. Cheap ranking and rules come first, an AI judges only what is left, and plain Python decides.',
  badges: [{ label: 'v2.0' }, { label: '216 offline tests', tone: 'ok' }],
  nodes: [
    { title: 'Every new ad', notes: [{ text: 'Platsbanken plus eight career-site platforms' }, { text: '~37,100 in 4 weeks', tone: 'accent' }] },
    { title: 'Rank, no AI', notes: [{ text: 'Role vocabulary, embeddings and skill data, fused. The top 15% kept 101 of 102 good matches' }] },
    { title: 'Rule checks', notes: [{ text: 'Clear mismatches out before a model sees them, like mandatory fluent Swedish' }] },
    { title: 'Cheap first read', notes: [{ text: 'Settles ~75% of ads. Cost per ad from $0.0037 to $0.0010' }] },
    { title: 'AI judge', notes: [{ text: 'Gemini with a strict JSON schema; GPT-5 mini only if Vertex AI cannot answer' }, { text: '~12,300 evaluations', tone: 'accent' }] },
    { title: 'Python decides', tone: 'accent', notes: [{ text: 'Near the line? Judged twice, decided on the average' }, { text: '685 sent to Telegram', tone: 'accent' }] },
  ],
  // most ads drop out early; very few reach the end
  packets: [
    { stop: 1, kind: 'drop', phase: 0.0 },
    { stop: 1, kind: 'drop', phase: 0.08 },
    { stop: 2, kind: 'drop', phase: 0.15 },
    { stop: 1, kind: 'drop', phase: 0.22 },
    { stop: 3, kind: 'drop', phase: 0.29 },
    { stop: 1, kind: 'drop', phase: 0.36 },
    { stop: 2, kind: 'drop', phase: 0.43 },
    { stop: 5, kind: 'end', phase: 0.5 },
    { stop: 1, kind: 'drop', phase: 0.57 },
    { stop: 3, kind: 'drop', phase: 0.64 },
    { stop: 1, kind: 'drop', phase: 0.71 },
    { stop: 4, kind: 'drop', phase: 0.78 },
    { stop: 2, kind: 'drop', phase: 0.85 },
    { stop: 1, kind: 'drop', phase: 0.92 },
  ],
  footer:
    'Python 3.11 · SQLite · Vertex AI · CI on Linux, macOS and Windows · ~$0.0012 per AI evaluation · counts include two companion scouts, 29 Aug – 24 Sep 2026',
  cta: 'Open the repository ›',
};

const NUMBERS = [
  { big: '300+', label: 'CVs processed by Talero ATS, in four languages', viz: { type: 'dots', count: 30, caption: 'one dot = 10 CVs' } },
  { big: '1,000+', label: "players of Talero's career-assessment game", viz: { type: 'dots', count: 100, caption: 'one dot = 10 players' } },
  { big: '216', label: 'offline tests in RoleLens, no network or API key', viz: { type: 'chips', labels: ['Linux', 'macOS', 'Windows'] } },
  {
    big: '0.93',
    label: 'ranking accuracy for Gemini in the public RoleLens benchmark',
    viz: { type: 'bars', rows: [{ label: 'Gemini', value: 0.93, tone: 'accent' }, { label: 'GPT-5 mini', value: 0.78, tone: 'dot' }] },
  },
  {
    big: '45 s',
    label: 'to restore a stuck container, after a 31-minute outage',
    viz: { type: 'bars', rows: [{ label: 'outage 31 min', value: 1860, tone: 'warn' }, { label: 'now 45 s', value: 45, tone: 'accent' }] },
  },
  {
    big: '6–10 s',
    label: 'per request with the smallest EU Gemini model, the one that went live',
    viz: { type: 'bars', rows: [{ label: 'larger 35–94 s', value: 94, tone: 'dot' }, { label: 'chosen 6–10 s', value: 10, tone: 'accent' }] },
  },
];

const PROJECTS = [
  {
    kicker: 'TALERO AI · DASHBOARD',
    name: 'Talero Talents',
    desc: 'Turns game results into a personal career report: seven report tabs, paid plans and a portal for career coaches.',
    viz: { type: 'radar', caption: 'Big Five traits against world, EU and country averages' },
    stack: 'React · TypeScript · Supabase · Stripe',
  },
  {
    kicker: 'TALERO AI · GAME BACKEND',
    name: 'Talero Wise',
    desc: 'A 15-minute story game that suggests careers. I own the technical decisions, the backend it runs on and sign-in.',
    viz: { type: 'worlds', labels: ['Viking', 'Samurai', 'Roman'], stat: '1,000+ players' },
    stack: 'Unity WebGL · Node.js · Google sign-in',
  },
  {
    kicker: 'TALERO AI · UNIVERSITY PROGRAMME',
    name: 'Advisor dashboard',
    desc: "For Talero's first paying university partner: a game build, a student dashboard and an advisor view for one-to-one talks.",
    viz: { type: 'bars', caption: 'reach · completion · per student', stat: '200+ students' },
    stack: 'Game build · two dashboards · integration',
  },
  {
    kicker: 'WEB PROJECT · 2026',
    name: 'Z17',
    desc: "Moved a dental clinic's slow Joomla site to React on Cloudflare Workers, built alone.",
    viz: { type: 'speed', before: '3.4', after: '1.0', from: 'F', to: 'A' },
    stack: 'React · TanStack Start · Cloudflare Workers · R2',
  },
  {
    kicker: 'VOLUNTEER · 2026',
    name: 'Akademisk Kvart',
    desc: "Stockholm's non-profit student-housing platform: listing translation, a step-by-step ad form and paid ad cards.",
    viz: { type: 'translate', pair: ['Svenska', 'English'], stat: '~5,000 users' },
    stack: 'Next.js · TypeScript · Vercel',
  },
  {
    kicker: 'WEB PROJECT · 2024–2026',
    name: 'Pro-Cars',
    desc: 'A car-workshop site rebuilt twice as the business changed, keeping the pages that ranked in search.',
    viz: { type: 'steps', labels: ['Joomla', 'WordPress', 'React'] },
    stack: 'WordPress · React · TanStack Start · Cloudflare',
  },
];

const STACK = [
  { name: 'Interface', note: 'what people use', items: ['React', 'TypeScript', 'Next.js', 'TanStack Start', 'Tailwind CSS', 'Server-sent events'] },
  { name: 'API', note: 'where requests land', items: ['Node.js', 'Express', 'Zod', 'Python', 'FastAPI', 'REST', 'Stripe'] },
  { name: 'AI', note: 'where the model sits', items: ['Gemini on Vertex AI', 'OpenAI', 'Azure OpenAI', 'Embeddings', 'Rank fusion', 'LLM evaluation', 'n8n', 'Ollama'] },
  { name: 'Data', note: 'what it remembers', items: ['PostgreSQL', 'pgvector', 'Redis + BullMQ', 'Supabase', 'SQLite'] },
  { name: 'Delivery', note: 'how it ships, stays up', items: ['Docker', 'GitHub Actions', 'Google Cloud', 'Cloudflare Workers', 'Vercel', 'AWS', 'Sentry', 'Caddy', 'Linux'] },
  { name: 'Trust', note: 'why a company says yes', tone: 'accent', items: ['EU data residency', 'Pseudonymisation', 'Audit logs', 'Row-level security', 'Human oversight', 'GDPR', 'EU AI Act'] },
];

// ------------------------------------------------------------------ the build

// assets/ resolved from this file, so the script runs from any working directory
const ASSETS = new URL('../assets/', import.meta.url);

// Start clean, so a renamed or retired asset never lingers in the repository
rmSync(ASSETS, { recursive: true, force: true });
mkdirSync(ASSETS, { recursive: true });

const PANELS = {
  hero: (mode, layout) => renderHero(PROFILE, STREAM, mode, layout),
  'talero-ats': (mode, layout) => renderSystem(TALERO_ATS, mode, layout),
  rolelens: (mode, layout) => renderSystem(ROLELENS, mode, layout),
  numbers: (mode, layout) => renderNumbers(NUMBERS, mode, layout),
  projects: (mode, layout) => renderProjects(PROJECTS, mode, layout),
  stack: (mode, layout) => renderStack(STACK, mode, layout),
};

for (const [name, render] of Object.entries(PANELS)) {
  for (const mode of MODES) {
    for (const layout of ['wide', 'narrow']) {
      const file = `${name}${layout === 'narrow' ? '-narrow' : ''}${mode === 'dark' ? '-dark' : ''}.svg`;
      writeFileSync(new URL(file, ASSETS), render(mode, layout));
    }
  }
}
writeFileSync(new URL('divider.svg', ASSETS), renderDivider());

console.log(`built ${readdirSync(ASSETS).length} assets`);
