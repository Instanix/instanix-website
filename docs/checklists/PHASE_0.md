# Phase 0 — Repository & Design Foundation: checklist

Source: `docs/06_MVP_ROADMAP_ACCEPTANCE.md`.

## Delivered
- [x] Monorepo: pnpm workspaces + Turborepo, TypeScript strict
- [x] `apps/web` public site shell (`/en`, `/ar`, statically generated)
- [x] `apps/command` customer app shell (sidebar, top bar, mobile tab bar, all 12 nav destinations)
- [x] `packages/ui` design tokens (Light canonical, Dark parity), logo, primitives
- [x] `packages/i18n` EN/AR dictionaries, direction, locale-aware formatters
- [x] `packages/agents` canonical IX Team registry (IDs IX-001…IX-012)
- [x] Official transparent character art for all 12 agents, optimized by `pnpm agent-art` from `Mascots team/`
- [x] Public site rebuilt to the IX-UI mockups: team hero, agent carousel, how-it-works band, solutions, business applications, goal-based team builder, IX Command preview, IX Guard
- [x] Theme and locale persist (theme: localStorage, applied before paint; locale: cookie)
- [x] Arabic RTL structurally correct (`lang`/`dir`, logical CSS properties, LTR brand tokens)
- [x] Loading / empty / error / not-found states in the command shell
- [x] CI baseline: lint, typecheck, test, build
- [x] Specs moved into `docs/`
- [x] Public site pages: Home, Platform, IX Agents (+ one page per agent), Solutions, Business Applications, Integrations
- [x] Home cover uses the team key visual; tool strip lists automation and AI tools (n8n, Make, Zapier, OpenAI, Claude, Gemini, Notion, Airtable, Supabase, WhatsApp)
- [x] No pricing page, by decision
- [x] Services and Our Work (SCANNO) pages; services-led navigation
- [x] ZEUS project assessment: `packages/ai` runtime (OpenAI adapter, structured output, validation, rate limit) + `/api/v1/assessment` + `/assessment` page
- [x] Technical SEO: sitemap, robots (AI crawlers allowed), canonical + hreflang, Organization/WebSite structured data, social image
- [x] Floating "Ask ZEUS" launcher on every public page
- [x] Search content: one page per service (answer-first definition, deliverables, use cases, FAQ) with Service, FAQPage and BreadcrumbList structured data; general FAQ page; privacy policy
- [x] Assessment verified against the live OpenAI API in English and Arabic; model set to `gpt-4.1` after a side-by-side with `gpt-4.1-mini`
- [x] Industry pages: car showrooms & inspection (with SCANNO proof), real estate, clinics, company operations — problem scene, pains, agent flow, before/after, FAQ, structured data
- [x] Live demo: scripted WhatsApp conversation with CRM record and agent activity, three scenarios, on `/demo`, the home page and industry pages. Labelled as simulated with fictional data
- [x] WhatsApp button after the assessment carries the summary and recommended team
- [x] About page with the founder profile and photos; company facts in structured data
- [x] Lead capture: `packages/db` (Supabase REST, service role, idempotent per assessment), `supabase/migrations` (organizations + leads, RLS on with no public policies), `/api/v1/leads`, and a consent-based gate that unlocks the full report. Verified against a local stand-in, not yet against a real Supabase project

## Needed before the assessment works for real
- [x] `OPENAI_API_KEY`, `OPENAI_MODEL`, `NEXT_PUBLIC_BOOKING_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` set in `apps/web/.env.local` (local only; production needs the same values in the host's settings)
- [ ] Create the Supabase project, run the migration, and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (at build time too: the pages are static, so the gate is decided when the site is built)
- [x] New-lead email to the owner over SMTP (`packages/integrations`), sent once per lead. Built and unit-tested; a real send needs `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- [x] Lead storage verified against the real Supabase project (insert, duplicate ignored, public key denied)
- [x] Hostinger plan confirmed by the owner to support Node.js; deployment steps still to be prepared
- [ ] Hosting: the app needs a Node.js server; the current Hostinger plan must be confirmed to support it, or the app moves to Vercel/VPS
- [ ] Replace the in-memory rate limiter with a shared store before public launch
- [ ] Privacy policy drafted from actual site behavior; needs a contact email and a legal review before launch

## Decision to revisit before public launch
- [ ] The owner asked for all "Coming soon" / "First release" labels to be removed from the site and IX Command. `docs/00_MASTER_BLUEPRINT.md` §11 says public capability claims must map to functionality in production or be marked "Coming soon". Before the site goes public, either the listed agents, solutions and integrations are live, or §11 is updated.

## Not in Phase 0 (by design)
- [ ] `apps/admin` — starts with platform roles in Phase 1
- [ ] Auth, organizations, RLS, audit — Phase 1
- [ ] `packages/ai`, `security`, `db`, `events`, `integrations`, `billing` — created when their phase starts, not as empty stubs
- [ ] Content-Security-Policy with nonces (baseline security headers are set; CSP lands with auth)

## Open inputs needed from the brand owner
- [ ] Master vector logo (SVG) — the mark is currently a vector redraw of `IX-LOGO/ICON.png`
- [ ] Final brand blue (`#0091FF` in the spec vs `#00B4FF` on the brand sheet) and per-agent accent colors
- [ ] Official logo files for Microsoft 365, Teams, Slack and Salesforce (shown by name only for now)
- [x] Wordmark follows the UI mockups and brand sheet: **Instanix** (logo PNG files still read InstanIX)
- [ ] Role names on the `Mascots team/COVER.png` poster differ from `docs/00_MASTER_BLUEPRINT.md` §3; the site follows the blueprint
