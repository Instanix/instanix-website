# MVP Roadmap & Acceptance Criteria

## Phase 0 — Repository & Design Foundation
Deliver:
- monorepo
- environment strategy
- CI baseline
- design tokens
- EN/AR + Light/Dark shell
- public site shell
- command app shell
- docs wired into repository

Exit criteria:
- builds cleanly
- responsive shell
- theme and locale persist
- Arabic RTL is structurally correct

## Phase 1 — SaaS Foundation
Deliver:
- authentication
- organizations
- workspaces
- memberships/roles
- tenant-aware database layer
- RLS policies
- audit log foundation
- entitlements foundation

Exit criteria:
- Tenant A cannot read/write Tenant B data through UI, API, direct supported client path, background job or storage path
- isolation tests pass

## Phase 2 — IX Runtime
Deliver:
- AI provider adapter
- OpenAI adapter
- model router configuration
- agent registry
- tool registry
- policy gateway
- approval engine
- agent run tracing
- usage/cost metering

Exit criteria:
- model can request only allowed tools
- denied tool cannot execute
- approval-required action pauses and resumes safely
- every action is traceable

## Phase 3 — IX Command
Deliver:
- Command dashboard
- Ask IX interface
- My IX Team
- agent detail
- activity feed
- approvals inbox
- notifications foundation

Exit criteria:
- all screens support EN/AR and Light/Dark
- empty/error/loading states complete
- mobile approval flow usable

## Phase 4 — Sales Vertical Slice
Agents:
- ZEUS
- ATLAS
- HERMES

Deliver:
- native CRM basics
- lead intake
- lead classification
- follow-up drafting
- approval
- send through first supported communication integration
- CRM activity update
- end-to-end audit timeline

Exit criteria:
- a tenant can complete the canonical sales workflow without manual database edits
- failed integration does not corrupt state
- duplicate event does not duplicate external side effect

## Phase 5 — Knowledge
Deliver:
- document upload
- validation/parsing
- permission-aware retrieval
- citations/source references in agent answers
- workspace/document access rules

Exit criteria:
- cross-tenant retrieval tests pass
- restricted document is not retrieved for unauthorized user/agent

## Phase 6 — Billing Readiness
Deliver:
- plans/entitlements
- usage dashboard
- internal cost dashboard
- subscription provider adapter/interface

Actual payment provider may be selected at implementation time based on supported launch markets and legal entity setup.

## Phase 7 — Instanix Tenant #1
Configure Instanix on production-equivalent IX:
- company knowledge
- CRM
- ZEUS/ATLAS/HERMES
- approval policies
- founder dashboard

Use real operational feedback to prioritize product work.

## Phase 8 — MIDAS & THEMIS
Add finance operations and contract/legal operations with conservative permissions and mandatory approvals for sensitive actions.

## Phase 9 — Expansion
ATHENA, HEPHAESTUS, POSEIDON, ARES, APOLLO, ORACLE, HESTIA; additional connectors; IX Studio experiments.

## Global MVP Acceptance
Before public paid launch:
- tenant isolation security review complete
- backup + restore test completed
- rate limiting live
- abuse controls live
- privacy/export/delete paths documented
- audit logs available
- AI/tool failure handling tested
- usage/cost visibility operational
- agent eval suite has release thresholds
- accessibility smoke test complete
- Arabic RTL regression suite complete
- no fake customer proof or unverified performance claims in marketing
