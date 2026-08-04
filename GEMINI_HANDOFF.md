# Gemini Handoff — Tactical Atlas v4.6

## Mission

Continue the Tactical Atlas v4.6 Headquarters upgrade without rebuilding or removing existing features. Work in the real `src/` files. Preserve the router, all department pages, Git history, and Vercel target.

## Canonical source

- Repository: `https://github.com/zachmpzp5-stack/tactical-atlas-os.git`
- Branch: `hq-visual-rebuild`
- Latest visual implementation commit: `38c52fc`
- Local working copy used by Codex: `work/tactical-atlas-live`
- Original VS Code project discovered at: `C:\Users\zachm\OneDrive\Desktop\Tactical Atlas`

Do not overwrite the original VS Code folder until the updated branch or ZIP has been reviewed.

## Current user requirements

1. Match the approved HQ reference: dense green/black/gold command facility with left navigation, compact status header, large situation wall, right Mission Theater, Commander/LYRA console, production pipeline, feeds, approvals, and department status.
2. The Situation Wall must use a **flat-earth circular polar projection**.
3. LYRA is the Commander-facing AI coordinator.
4. The supplied revealing LYRA portrait is **OMEGA-clearance only for General HIIIT**.
5. Standard operators must see the generated modest high-collar Tactical Atlas uniform portrait.
6. LYRA uses an attractive warm female system voice with an explicit on/off control.
7. Preserve TAIM, TAAN, Atlas Kernel, Task Engine, Connect, governance, approvals, audit, and rollback architecture.
8. Vercel only; remove Netlify remnants. Tactical Atlas is independent and not an Amazon product.
9. Show a preview before any production deployment.

## Important assets

- `public/assets/lyra-command-avatar.png` — General HIIIT OMEGA-only view.
- `public/assets/lyra-operator-uniform.png` — modest standard-operator view.
- User HQ reference image was supplied in the prior Codex conversation.

## Important implementation files

- `src/pages/Headquarters.jsx` — HQ layout and boot sequence.
- `src/components/ExpeditionMap.jsx` — flat-earth situation wall.
- `src/components/LyraAssistantPanel.jsx` — portrait policy, voice, chat, API state.
- `src/components/TaanNetwork.jsx` — nine agents and department links.
- `src/components/Header.jsx` — operator and clearance display.
- `src/pages/Settings.jsx` — clearance-view selector.
- `api/lyra.js`, `api/health.js`, `api/departments.js` — Vercel backend functions.
- `vercel.json` — Vercel routing and security headers.
- `docs/TACTICAL_ATLAS_KNOWLEDGE.md` — canonical product and architecture knowledge.
- `setup.cjs` — corrected legacy generator; real source files are canonical.

## Operational status

- `node --check setup.cjs`: passing.
- ESLint: passing before the latest visual refinement; rerun after changes.
- Prettier: passing before the latest visual refinement; rerun after changes.
- Production source bundle: built successfully using the available Vite 8 validation runtime.
- API handler checks: health 200, departments 200, LYRA returns truthful 503 until AI Gateway is activated.
- Browser preview was validated at 1600×1000.
- Production has not been replaced; preview/production deployment still requires review.

## Required environment

- `VERCEL_OIDC_TOKEN` is supplied by Vercel when AI Gateway is enabled.
- Optional fallback: `AI_GATEWAY_API_KEY`.
- Optional persistent storage: `DATABASE_URL`.
- Never put secrets in the repository, handoff, browser UI, or ZIP.

## Validation commands

```powershell
node --check setup.cjs
npm install
npm run lint
npm run format:check
npm run build
```

Then test the boot entry, both LYRA clearance views, voice toggle, all sidebar routes, `/api/health`, `/api/departments`, and `/api/lyra`. Create a Vercel preview and obtain General HIIIT's approval before promoting it to production.

## Packaging

The prior condensed ZIP is `outputs/tactical-atlas-v4.6-vercel-ready.zip`. Regenerate it after the latest visual changes. Exclude `.git`, `node_modules`, `.env`, caches, logs, and temporary test files. Include `src`, `api`, `public`, `dist`, `vercel.json`, documentation, lockfiles, and corrected `setup.cjs`.
