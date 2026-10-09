# CLAUDE.md — IX by Instanix

## Mission
Build two things for Instanix (`instanix.ae`):
1. A public marketing website that sells Instanix services (automation, AI agents, business systems, integrations) and ranks in search and AI answer engines across the Gulf and Egypt.
2. IX, the platform Instanix uses to run its own operations, on a subdomain. It is internal first and stays tenant-ready so it can be offered to customers later.

See `docs/07_DECISIONS.md` for the owner decisions behind this. Where it conflicts with docs 00–06, it wins.

## Source of Truth
Read these before coding:
1. `docs/00_MASTER_BLUEPRINT.md`
2. `docs/01_PRODUCT_ARCHITECTURE.md`
3. `docs/02_MULTI_TENANCY_SECURITY.md`
4. `docs/03_AI_AGENT_RUNTIME.md`
5. `docs/04_UI_UX_DESIGN_SYSTEM.md`
6. `docs/05_DATA_API_INTEGRATIONS.md`
7. `docs/06_MVP_ROADMAP_ACCEPTANCE.md`
8. `docs/07_DECISIONS.md` (supersedes the documents above where they conflict)
9. All relevant files under `agents/`.

If code conflicts with documentation, stop and surface the conflict. Do not silently change architecture.

## Non-Negotiable Product Decisions
- The platform is internal first (Instanix is Tenant #1); it is not sold to customers yet.
- Multi-tenancy is still enforced at database and application layers, so it can be offered later.
- The public site states only what Instanix actually delivers. No "Coming soon" labels.
- English + Light is the canonical default UI.
- Full Arabic RTL, Dark Mode, and feature parity are required.
- AI agents think/recommend; deterministic tools/workflows execute business actions.
- Every external or destructive action passes through policy authorization.
- Human approval is mandatory for configured high-risk actions.
- No raw secrets are exposed to models.
- No tenant may access another tenant's data, embeddings, logs, files, integrations, or traces.
- Do not create fake testimonials, customers, metrics, partners, certifications, or case-study results.
- IX characters are brand IP; do not replace them with generic robots.
- Futuristic enterprise UI, not cyberpunk/game UI.

## Engineering Principles
- TypeScript strict mode.
- Schema validation at boundaries.
- Idempotent side-effecting operations.
- Explicit error states; no swallowed exceptions.
- Least privilege.
- Audit all privileged and agent-triggered actions.
- Tenant isolation tests are release blockers.
- Accessibility and responsive behavior are release requirements.
- Never hard-code plan names into authorization; use entitlements.
- Never scatter direct model calls through UI/server routes; use the AI runtime package.
- Never use n8n as the system of record.
- Never store API keys in source code or database plaintext.

## Preferred Repository Shape
```text
apps/
  web/       # public website
  command/   # customer SaaS
  admin/     # platform operations (deferred)
packages/
  ai/
  agents/
  auth/
  db/
  security/
  integrations/
  billing/
  events/
  ui/
  i18n/
supabase/
docs/
agents/
```

## Implementation Protocol
For each milestone:
1. Read relevant specs.
2. Write/update an implementation checklist.
3. Implement smallest vertical slice.
4. Add tests, including negative authorization tests.
5. Run lint, typecheck, tests and build.
6. Update documentation only when behavior is intentionally changed.
7. Do not proceed past a security-critical failure.

## Definition of Done
A feature is not done until it has: authorization, tenant scoping, loading/empty/error states, EN/AR behavior, Light/Dark behavior, auditability where relevant, tests, responsive UI, and no exposed secrets.
