// Generates every SVG in assets/ from one profile definition. No network, no token:
// the panels are typographic, not statistical, so the output is a pure function of
// this file and the renderers beside it.
//
//   node scripts/build.mjs
//
// Run by .github/workflows/assets.yml whenever scripts/ changes, which keeps the
// committed assets in step with the code that draws them.

import { mkdirSync, writeFileSync } from 'node:fs';
import { MODES } from './tokens.mjs';
import { renderHeader } from './render-header.mjs';
import { renderDivider } from './render-divider.mjs';
import { ICON_NAMES, renderIcon } from './render-icons.mjs';

const PROFILE = {
  name: 'Amin Hashemi',
  role: 'AI ENGINEER · FULL-STACK DEVELOPER',
  eyebrow: 'PROFILE / 2026',
  location: 'STOCKHOLM / LINKÖPING · SWEDEN',
  locationShort: 'STOCKHOLM · SE',
  focus: ['AI PRODUCT SYSTEMS', 'MULTI-AGENT WORKFLOWS', 'EDGE INFRASTRUCTURE'],
};

// assets/ resolved from this file, so the script runs from any working directory
const ASSETS = new URL('../assets/', import.meta.url);
const ICONS = new URL('icons/', ASSETS);

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
}

write(ASSETS, 'divider.svg', renderDivider());
for (const name of ICON_NAMES) write(ICONS, `${name}.svg`, renderIcon(name));

console.log(`built ${written.length} assets`);
