# Data, API, Billing & Integrations

## Core Data Domains
### Identity
`organizations`, `workspaces`, `profiles`, `memberships`, `roles`, `permissions`

### Agents
`agent_definitions`, `agent_instances`, `skills`, `agent_skills`, `agent_permissions`

### CRM
`clients`, `contacts`, `leads`, `opportunities`, `activities`

### Delivery
`projects`, `milestones`, `tasks`

### Finance
`invoices`, `expenses`, `payments` (payments initially observational/draft-oriented unless explicitly enabled)

### Legal Ops
`contracts`, `contract_versions`, `obligations`, `renewals`

### Knowledge
`knowledge_sources`, `documents`, `document_chunks`, `document_permissions`

### Automation
`workflows`, `workflow_versions`, `workflow_runs`, `events`, `event_deliveries`

### AI
`agent_runs`, `agent_messages`, `tool_calls`, `model_usage`, `evaluations`

### Governance
`policies`, `approval_requests`, `approval_events`, `audit_logs`

### Platform
`plans`, `entitlements`, `subscriptions`, `usage_counters`, `integrations`, `integration_connections`, `notifications`

## Database Conventions
- UUID primary keys
- `organization_id` on tenant data
- timestamps in UTC
- soft-delete only where business/legal requirements justify it
- immutable audit/event records
- indexes begin with tenant key for tenant-heavy queries where appropriate
- foreign keys and unique constraints enforce invariants

## Entitlements
Never authorize based on string plan names. Resolve capabilities such as:
```text
users.max
workspaces.max
agents.max
integrations.max
agent_runs.monthly
workflow_executions.monthly
storage.gb
knowledge_sources.max
api.enabled
sso.enabled
audit.retention_days
```

## Usage Metering
Meter at least:
- agent runs
- workflow executions
- model input/output/cached tokens when available
- estimated provider cost
- storage
- integration calls where commercially relevant

Cost telemetry is internal truth; customer-facing usage units can be simplified later.

## Integration Contract
Each connector should expose a common lifecycle:
```text
connect
disconnect
healthCheck
refreshAuth
listCapabilities
execute
```

Initial high-value connector targets after MVP foundation:
- Email/calendar provider
- CRM or IX native CRM
- WhatsApp/business messaging provider
- generic webhook/REST

Do not build many shallow connectors before one complete vertical slice works.

## API Principles
- versioned endpoints
- authenticated tenant context
- schema validation
- idempotency keys for side effects
- pagination
- rate limits
- structured errors with correlation IDs
- webhook signing and replay protection

## Webhooks
Outbound webhooks include:
- event ID
- event type/version
- tenant-safe payload
- timestamp
- signature

Retries must be bounded and observable.
