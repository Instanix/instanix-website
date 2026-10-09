# AI & Agent Runtime

## Provider Strategy
OpenAI is the primary AI provider. The application must use a provider abstraction so product logic is not tightly coupled to one model ID.

Use OpenAI's Responses API for the primary tool-using runtime. Function calling should connect models to application capabilities, and structured outputs/schemas should be used for machine-consumed decisions.

Do not encode business-critical behavior solely in prompts.

## Runtime Interface
Conceptual API:
```ts
await ix.ai.run({
  organizationId,
  workspaceId,
  actor,
  agent: 'atlas',
  task,
  contextRefs,
  allowedSkills,
  budget,
  policyContext,
});
```

## Model Routing
Do not hard-code a single flagship model for every task. Route by task complexity, latency, risk and cost. Keep model IDs configurable.

Example classes:
- economy: classification, tagging, simple extraction
- balanced: routine communication, CRM analysis, summaries
- reasoning: contracts, complex planning, architecture, executive synthesis

## Tool Registry
Tools are typed server-side capabilities with:
- unique name
- version
- description
- JSON input schema
- output schema when possible
- risk level
- required permission
- side-effect classification
- idempotency behavior
- timeout
- audit behavior

Example:
```text
crm.lead.get
crm.lead.create
crm.lead.update
crm.pipeline.read
communication.email.draft
communication.email.send
finance.invoice.draft
contract.draft.create
knowledge.search
```

## Agent Loop Limits
Every run has:
- max steps
- wall-clock timeout
- token/cost budget
- tool allowlist
- retry limit
- cancellation support

No unbounded autonomous loops.

## Memory Model
- Working memory: current run only
- Conversation memory: user thread
- Entity memory: client/project/account
- Organization knowledge: verified company material
- Preference/config memory: explicit tenant settings
- Event history: immutable operational facts

Persistent memory must store provenance and should not silently convert model speculation into fact.

## Knowledge / RAG
Pipeline:
`validate → parse → classify → chunk → embed → index → permission map → retrieve → cite`

Retrieval must filter by organization, workspace and document permissions before content reaches the model.

## Observability
For every agent run capture:
- run ID
- tenant/workspace
- actor
- agent/skill
- trigger
- model/provider
- latency
- usage/cost
- tools requested/executed
- approval state
- outcome
- errors
- references to relevant audit events

Store concise decision summaries useful for audit/debugging. Do not attempt to expose hidden chain-of-thought.

## Evaluation
Each agent/skill requires eval cases covering:
- correct routing
- correct tool choice
- refusal/denial when unauthorized
- tenant isolation
- prompt injection resistance
- schema adherence
- EN/AR quality
- approval compliance
- failure recovery
- latency/cost budgets

## n8n Boundary
n8n is allowed for integrations, schedules and deterministic workflows. Canonical state, policy, tenancy, approvals and audit remain in IX.
