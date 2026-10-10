# Owner Decisions

Decisions made by the owner after the original blueprint (docs 00–06). Where a decision
conflicts with an earlier document, **this file wins** and the earlier text is superseded.

## 2026-10-07

### D1 — The platform is internal first
The platform (IX Command, on a subdomain of `instanix.ae`) is built to run **Instanix's own
operations**. It is not offered to customers for now.

- Supersedes: "IX is SaaS, not an internal tool later converted to SaaS" (CLAUDE.md, 00 §1).
- Kept: every tenant-owned table still carries `organization_id` with RLS, so offering the
  platform to customers later needs no data-model rewrite.
- Deferred until there is real demand: billing, plans/entitlements, customer self-signup,
  `apps/admin`.

### D2 — The public website sells Instanix services
`instanix.ae` markets what Instanix delivers today: business automation, AI agents, business
and management systems, and integrations. The IX team is the brand and delivery method.

- Markets, in priority order: UAE, Qatar, Saudi Arabia, rest of the Gulf, Egypt.
- Languages: English and Arabic.
- The site is built to be found by search engines **and** AI answer engines (SEO / AEO / GEO):
  sitemap, hreflang, structured data, crawlable server-rendered content, AI crawlers allowed.
- No pricing page.

### D3 — No "Coming soon" labels
All "Coming soon" / "First release" labels were removed from the site and IX Command.

- Supersedes the labelling half of 00 §11. The other half still stands: **claims must be true**.
  Before the site is public, listed capabilities must be things Instanix actually delivers.
- Unchanged: no fake testimonials, customers, metrics, partners, certifications or results.

### D4 — ZEUS project assessment on the public site
Visitors describe a business problem and ZEUS returns a preliminary assessment, then offers a
consultation (Calendly) or WhatsApp.

- Provider: OpenAI, through `packages/ai` (provider abstraction, Responses API, structured output).
- One bounded model call, no tools, no side effects. Agents come from the fixed IX roster only.
- Never states prices, timelines, savings or guarantees. Always labelled preliminary.
- Visitor text is untrusted data; it is not stored and not logged.
- Rate-limited per visitor and globally. The current limiter is in-memory and must move to a
  shared store before public launch.

### D5 — Portfolio
Only real, live work is shown. Today that is **SCANNO** (`scanno.qa`), the AI-assisted vehicle
inspection service in Qatar. Instanix itself becomes the second case once it runs on the platform.

### D6 — Brand
Wordmark: **Instanix**. Domain: `instanix.ae`.

## 2026-10-08

### D7 — Services first, SaaS later
Instanix sells services and packaged offers now. The path to a product is: services, then
repeatable packaged offers, then the platform running those offers for clients, then a
self-serve SaaS once several clients use the same thing. The data model stays tenant-ready.

### D8 — The website is the lead engine and the live example
- Industry pages lead with a real, recognizable problem and show how the IX team handles it.
  Order of priority: automotive (SCANNO is the proof), real estate, clinics, company operations.
- A simulated live demo shows an agent handling a WhatsApp conversation while the CRM record
  and agent activity update. It uses fictional data and says so.
- Asking for a phone number or email before the full assessment report is approved.
  Not built yet: it needs lead storage.
- WhatsApp Business API: the owner is applying. Until it is approved, WhatsApp uses free
  click-to-chat links only.

## 2026-10-09

### D9 — Leads are stored on Supabase
Approved by the owner. The full assessment report is unlocked when the visitor leaves a name
and a WhatsApp number or email and ticks consent. Without that, nothing about the visitor is
stored. The privacy policy and the form text say so.

### D10 — Company facts
Founder: Amir Diab. Founded 2025. Headquarters: Dubai, UAE. Public contact: info@instanix.ae.

## 2026-10-10

### D11 — Design direction
The public site follows an editorial, product-first direction: large type, one accent color,
glass surfaces, scroll-driven scenes, and the IX characters as the product on show. Template
ornaments are out: no dotted eyebrow pills, no gradient text outside the logo, no gradient
icon tiles, no decorative grid backdrops. The logo is always the official master file from
`IX-LOGO`, never redrawn. Arabic uses Alexandria for headings and Readex Pro for text.

### D12 — Interactive demos say what they are
Every simulated element (workflows, the phone conversation, the office, the agent
workbenches, the before/after day, the calculator) is labelled as illustrative or as an
estimate. No agent page claims a client result. Real results replace an example only when
the owner supplies them.

### D13 — Live AI on the public site is a metered trial
The live chat (the phone demo and the office) is a real model through the AI runtime, with
no tools. A visitor gets six messages per 30 days, shared across both, then is offered a
consultation booking. Every AI endpoint sits behind one guard: same-origin check, a kill
switch for the demos, per-visitor and daily limits kept in Supabase (`usage_counters`). The
visitor is recognised by a keyed hash of the IP address, never the address itself.
In the office an agent passes the visitor to the right colleague, at most once per message.

### D14 — Voice input is not offered
It was built and removed: it was not reliable enough across browsers and microphones.
The microphone stays blocked by the site's Permissions-Policy.
