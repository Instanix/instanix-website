# Product & Technical Architecture

## Recommended Stack
- **Monorepo:** pnpm + Turborepo
- **Frontend:** Next.js App Router + TypeScript
- **UI:** Tailwind CSS + accessible headless primitives + shared IX component library
- **Motion:** Framer Motion; CSS transforms for lightweight depth
- **Backend:** Next.js server layer for product APIs; FastAPI only for workloads that materially benefit from Python
- **Database/Auth/Storage:** Supabase/PostgreSQL as initial managed platform
- **Vector:** pgvector initially unless scale requires a separate vector service
- **Automation:** n8n as integration/workflow execution engine
- **AI:** provider abstraction, OpenAI as primary provider
- **Async:** durable queue/event processing (implementation selected during foundation milestone)
- **Hosting:** Vercel for web surfaces; managed workers/services for long-running jobs
- **Observability:** structured logs + error monitoring + agent traces + product telemetry

## Application Surfaces
### `apps/web`
Public Instanix/IX marketing website.

### `apps/command`
Customer SaaS application.

### `apps/admin`
Platform operations console. Strongly separated permissions; support access is audited.

## Domain Packages
- `packages/ai`: provider adapters, model router, schemas, runtime
- `packages/agents`: agent definitions, skills, registry
- `packages/auth`: identity/org membership/session helpers
- `packages/db`: typed repositories and tenant-aware data access
- `packages/security`: policy engine, authorization, audit helpers
- `packages/integrations`: connector contracts/adapters
- `packages/billing`: plans, entitlements, usage
- `packages/events`: event schema/bus/outbox
- `packages/ui`: shared design system
- `packages/i18n`: locale/direction/messages

## System Boundaries
1. UI never calls model providers directly.
2. Agent runtime never executes arbitrary business actions directly.
3. Tools expose typed capabilities.
4. Policy gateway authorizes tool calls.
5. Integration layer holds provider-specific behavior.
6. Database remains system of record.
7. n8n executes integrations/automations but does not own canonical business state.

## Environment Separation
Required:
- local
- development
- staging
- production

Use separate credentials and preferably separate backend projects/databases for production vs non-production.

## API Strategy
Internal APIs are versioned where externally consumable behavior may emerge. Prefer explicit typed contracts and idempotency for writes.

Initial namespace:
`/api/v1/...`

## Event Strategy
Core events should be versioned and immutable once published. Examples:
- `lead.created.v1`
- `lead.qualified.v1`
- `message.draft_created.v1`
- `approval.requested.v1`
- `approval.resolved.v1`
- `contract.expiring.v1`
- `invoice.overdue.v1`
- `agent.run_completed.v1`
- `workflow.failed.v1`

Use an outbox pattern or equivalent durable mechanism so database changes and event publication do not silently diverge.
