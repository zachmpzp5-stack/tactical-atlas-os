# Tactical Atlas Knowledge Baseline

Updated: 2026-08-04

## Product identity

Tactical Atlas is an independent intelligence, research, operations, archive, and media-production platform. It is not an Amazon product and must not depend on Amazon branding or proprietary product identity. The production web target is Vercel, backed by GitHub.

## Authority and governance

- Founder/Commander: General HIIIT, OMEGA clearance, final authority.
- Permission classes: Read, Draft, Execute, Restricted.
- Human approval gates are required for consequential actions.
- Every execution-capable workflow must support pause, review, audit, and rollback.
- Status labels must be truthful: `ONLINE` only when a service responds; otherwise use `READY`, `ADAPTER READY`, or `CONFIGURATION REQUIRED`.

## Core architecture

- **Atlas Kernel:** shared application and policy foundation.
- **Atlas Task Engine:** task routing, queues, approvals, and durable work state.
- **Atlas Connect:** provider-neutral integration boundary.
- **TAIM — Tactical Atlas Intelligence Model:** governed context, memory, doctrine, retrieval, provenance, and permissions.
- **TAAN — Tactical Atlas Agent Network:** the internal specialist-agent network.
- **LYRA:** Commander-facing coordinator. LYRA interprets intent, applies TAIM context, routes through TAAN, and reports outcomes without falsely claiming execution.

Canonical command flow:

`LYRA → TAIM → TAAN → Departments → INSPECTOR → LEGION → Approval → ARCHIVES → LYRA`

## TAAN departments

1. **HOTEL** — research and innovation.
2. **ORBIT** — digital operations.
3. **LEGION** — security and defense.
4. **INSPECTOR** — verification and quality.
5. **ACADEMY** — training and doctrine.
6. **COMMS** — media and messaging.
7. **ARCHIVES** — knowledge and memory.
8. **PMO** — mission control.
9. **ATELIER** — design and brand.

## Headquarters visual doctrine

- Dense black/emerald/antique-gold intelligence command center.
- Left command navigation, compact Commander header, core status rail.
- Primary **Global Situation Wall uses a circular flat-earth polar projection**, not a globe or Mercator map.
- Mission Theater sits beside the situation wall.
- LYRA Command Core, TAIM governance, production pipeline, TAAN nodes, intelligence feed, approval queue, and Guardian Protocol remain visible and operational.
- Boot sequence offers deliberate entry with synthesized audio or silent entry.

## LYRA presentation policy

- General HIIIT with `OMEGA` clearance receives the private OMEGA portrait view.
- All other operators receive LYRA in a modest, fully covered Tactical Atlas command uniform.
- LYRA has a warm female system voice controlled by an explicit on/off control.
- Clearance is stored locally for the current prototype and must move to verified server-side authentication before public multi-user launch.

## Current application surface

- Headquarters
- Operations
- Grand Library
- Atlas Archives
- Media Vault
- Research Network
- Case Files
- AI Production
- Analytics
- System Status
- Settings
- Login, signup, and terms routes

## Vercel services

- `api/health.js` — truthful system readiness.
- `api/departments.js` — TAAN department states.
- `api/lyra.js` — validated, rate-limited LYRA gateway route.
- Vercel AI Gateway uses `VERCEL_OIDC_TOKEN` automatically when enabled; `AI_GATEWAY_API_KEY` is an optional fallback.
- `DATABASE_URL` remains optional until persistent Archives/task storage is connected.
- No secret belongs in source control or client-side code.

## Deployment identity

- GitHub repository: `zachmpzp5-stack/tactical-atlas-os`
- Production branch: `main`
- Working branch: `hq-visual-rebuild`
- Vercel team: Tactical Atlas
- Vercel project: `tactical-atlas-os`
- Production URL: `https://tactical-atlas-os.vercel.app`
