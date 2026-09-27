<a href="https://aminhashemi.com">
  <picture>
    <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/hero-narrow-dark.svg">
    <source media="(max-width: 600px)" srcset="assets/hero-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/hero-dark.svg">
    <img src="assets/hero.svg" width="100%" alt="Amin Hashemi, AI Engineer and Full-Stack Developer in Stockholm, Sweden. Open to full-time roles, with the right to work in Sweden. Below, a stream of about 37,100 job ads flows into a lens; 685 pass through, the ones worth reading.">
  </picture>
</a>

<p align="center">
  <a href="https://aminhashemi.com"><b>Portfolio and case studies</b></a> &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/in/aminhashemi/">LinkedIn</a> &nbsp;·&nbsp;
  <a href="mailto:aminhashemi@live.com">aminhashemi@live.com</a>
</p>

### Two systems I built end to end

<a href="https://aminhashemi.com/projects/talero-ats">
  <picture>
    <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/talero-ats-narrow-dark.svg">
    <source media="(max-width: 600px)" srcset="assets/talero-ats-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/talero-ats-dark.svg">
    <img src="assets/talero-ats.svg" width="100%" alt="Talero ATS, an AI hiring platform that keeps candidate data in the EU. A CV arrives, is pseudonymised, goes to Gemini on Vertex AI in the EU with no fallback provider, gets a four-part review, is written to an audit log, and a recruiter makes the decision. An unreadable CV stops with an error instead of getting a score.">
  </picture>
</a>
<br><br>
<a href="https://github.com/Aminhashemi-su/RoleLens">
  <picture>
    <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/rolelens-narrow-dark.svg">
    <source media="(max-width: 600px)" srcset="assets/rolelens-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/rolelens-dark.svg">
    <img src="assets/rolelens.svg" width="100%" alt="RoleLens, an open-source job-discovery agent. Every new ad is ranked without AI, filtered by rules, read by a cheap first model, judged by Gemini with a strict JSON schema, and plain Python makes the final decision. About 37,100 ads read, 12,300 AI evaluations and 685 sent in four weeks, counting two companion scouts.">
  </picture>
</a>

### From production

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/numbers-narrow-dark.svg">
  <source media="(max-width: 600px)" srcset="assets/numbers-narrow.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/numbers-dark.svg">
  <img src="assets/numbers.svg" width="100%" alt="300+ CVs processed by Talero ATS in four languages. 1,000+ players of Talero's career game. 216 offline tests in RoleLens. 0.93 ranking accuracy for Gemini against 0.78 for GPT-5 mini. 45 seconds to restore a stuck container after a 31-minute outage. 6 to 10 seconds per request with the smallest EU Gemini model, against 35 to 94 seconds for the larger ones.">
</picture>

### Things that broke, and what I changed

The model is the easy part. These are the moments that decided how I build.

| Where | What broke | What I changed |
|:--|:--|:--|
| Talero ATS | A deploy left the API hung for **31 minutes**. | Health checks and a watchdog. A stuck container now comes back in **about 45 s**. |
| Talero ATS | A scanned CV with zero readable characters still got a score of **48**, and nobody was warned. | One Gemini call now reads the PDF directly, and an empty or unreadable file **stops with an error**. |
| Talero ATS | The two larger EU Gemini models took **35–94 s** and gave near-identical scores. | Tested all three on real CVs. The smallest took **6–10 s** and was the only one that told candidates apart, so it went live. |
| Talero ATS | An empty setting put production into a crash loop. | Two pre-deploy checks now stop a release before it starts. |
| RoleLens | A provider answered **200 OK** with valid JSON for only **3 of 20** jobs. | Every job must come back exactly once or it stays queued. The provider was dropped. |
| RoleLens | Two identical re-judgements disagreed on **6 of 40** matches. | Jobs near the line are judged twice and decided on the average. |
| RoleLens | Replaying stored AI answers found **two bugs** in my own Swedish-language rules. | Rule changes are replayed through the real decision code before every release. |
| RoleLens | Keyword search found **2 of 20** relevant roles. | The full JobStream feed replaced search; ranking decides what gets read. |

### More work

<a href="https://aminhashemi.com">
  <picture>
    <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/projects-narrow-dark.svg">
    <source media="(max-width: 600px)" srcset="assets/projects-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/projects-dark.svg">
    <img src="assets/projects.svg" width="100%" alt="Talero Talents, a career report dashboard. Talero Wise, a career game with 1,000+ players, where I own the backend and sign-in. An advisor dashboard for Talero's first paying university partner, 200+ students. Z17, a dental clinic site moved to React on Cloudflare, page load from 3.4 to 1.0 seconds. Akademisk Kvart, Stockholm's student-housing platform with about 5,000 users. Pro-Cars, a car-workshop site rebuilt twice.">
  </picture>
</a>

<sub>Case studies: <a href="https://aminhashemi.com/projects/talero-talents-dashboard">Talero Talents</a> · <a href="https://aminhashemi.com/projects/z17">Z17</a> · <a href="https://aminhashemi.com/projects/akademisk-kvart">Akademisk Kvart</a> · <a href="https://aminhashemi.com/projects/pro-cars">Pro-Cars</a> · <a href="https://aminhashemi.com/projects/nibela">Nibela</a> · <a href="https://aminhashemi.com/projects/talero-ai">Talero AI</a>. RoleLens is public; the other code lives in private repositories.</sub>

### The stack, layer by layer

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="assets/stack-narrow-dark.svg">
  <source media="(max-width: 600px)" srcset="assets/stack-narrow.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/stack-dark.svg">
  <img src="assets/stack.svg" width="100%" alt="Interface: React, TypeScript, Next.js, TanStack Start, Tailwind CSS, server-sent events. API: Node.js, Express, Zod, Python, FastAPI, REST, Stripe. AI: Gemini on Vertex AI, OpenAI, Azure OpenAI, embeddings, rank fusion, LLM evaluation, n8n, Ollama. Data: PostgreSQL, pgvector, Redis with BullMQ, Supabase, SQLite. Delivery: Docker, GitHub Actions, Google Cloud, Cloudflare Workers, Vercel, AWS, Sentry, Caddy, Linux. Trust: EU data residency, pseudonymisation, audit logs, row-level security, human oversight, GDPR, EU AI Act.">
</picture>

<sub>Every day: Claude Code · Codex · Cursor · Git · Figma</sub>

### Right now

- Looking for a **full-time role in Sweden** as an AI engineer or full-stack developer. Available immediately.
- **MSc Strategic Information Systems Management** at Stockholm University, graduating June 2027.
- Learning Swedish: **A2** today, **B1** exam in December 2026.

<img src="assets/divider.svg" alt="" width="100%">

<sub>Stockholm, Sweden · Right to work in Sweden, no visa sponsorship needed · <a href="mailto:aminhashemi@live.com">aminhashemi@live.com</a><br>Every image on this page is drawn by <a href="scripts/build.mjs">scripts/build.mjs</a> from one file of facts. No stats widgets, no trackers, and things only move where data moves.</sub>
