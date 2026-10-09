# IX by Instanix — Master Blueprint

**Status:** Source of truth  
**Product:** IX — AI Workforce Platform  
**Company:** Instanix  
**Initial market:** UAE/GCC, architected for global SaaS  
**Tenant #1:** Instanix

## 1. Product Thesis
IX is a multi-tenant SaaS platform that lets organizations deploy a governed digital workforce of specialized AI agents connected to their business applications, data, workflows, and people.

IX is not a chatbot collection. It is an operating layer combining:
- AI agents
- deterministic workflows
- business application integrations
- organizational knowledge
- human approvals
- policy enforcement
- observability and audit
- usage and cost controls

Core message:
> **Build Your Digital Workforce.**

Brand proof:
> **Instanix runs on IX.**

## 2. Product / Brand Architecture
### Instanix
The company: AI Automation & Business Systems.

### IX
The SaaS product: AI Workforce Platform.

### Product modules
- **IX Command** — conversational command center and company pulse
- **IX Agents** — deploy/configure specialized digital workers
- **IX Flow** — automations, events, schedules, handoffs
- **IX Connect** — integrations and credentials brokerage
- **IX Knowledge** — governed business knowledge and retrieval
- **IX Guard** — permissions, approvals, policies, audit
- **IX Insights** — performance, usage, cost, ROI and reliability
- **IX Studio** — future advanced builder for custom agents/skills
- **IX API** — future/public developer interface

## 3. Canonical IX Team
| ID | Name | Role | Primary Domain |
|---|---|---|---|
| IX-001 | ZEUS | Chief Orchestrator | Command, delegation, escalation |
| IX-002 | ATHENA | Strategy & Intelligence | Research, analysis, planning |
| IX-003 | HEPHAESTUS | Automation Engineer | Workflows, APIs, integration logic |
| IX-004 | POSEIDON | Data & Infrastructure | Data, knowledge, infrastructure |
| IX-005 | ARES | Security & Reliability | Security operations, reliability |
| IX-006 | HERMES | Communications | Email, messaging, follow-up |
| IX-007 | APOLLO | Product & Applications | Business apps, product delivery |
| IX-008 | MIDAS | Finance Operations | Invoices, expenses, finance analysis |
| IX-009 | THEMIS | Contracts & Legal Ops | Contracts, obligations, legal workflows |
| IX-010 | ATLAS | CRM & Client Success | Leads, pipeline, clients, renewals |
| IX-011 | ORACLE | Analytics | KPIs, reporting, anomalies |
| IX-012 | HESTIA | People & Operations | HR, onboarding, internal operations |

A private **Founder Chief of Staff** experience sits above the agent team for Instanix's founder. It is a privileged user experience, not a public agent SKU.

## 4. Core Operating Principle
> **Agents think. Tools and workflows execute. Policies decide whether execution is allowed.**

An LLM may propose an action, but business side effects happen only through registered, typed tools. Every tool call is authenticated, tenant-scoped, policy-checked, logged, and validated.

## 5. Core Execution Loop
```text
Event/User Request
      ↓
Context + Identity
      ↓
Router / ZEUS
      ↓
Specialist Agent
      ↓
Structured Decision
      ↓
Tool Request
      ↓
Policy Gateway
      ↓
AUTO / REVIEW / APPROVAL_REQUIRED / DENIED
      ↓
Deterministic Execution
      ↓
Validation
      ↓
Audit + Usage + Memory/Event
      ↓
Next Action / Human Result
```

## 6. SaaS Tenancy Model
```text
Platform
  └─ Organization (tenant)
      ├─ Workspaces
      ├─ Members
      ├─ IX Team
      ├─ Clients / CRM
      ├─ Projects
      ├─ Knowledge
      ├─ Integrations
      ├─ Automations
      ├─ Policies
      ├─ Billing / Usage
      └─ Audit
```

All tenant-owned resources must carry `organization_id`. Workspace-scoped resources additionally carry `workspace_id`.

## 7. Customer Journey
```text
Create account
→ Create organization
→ Company profile
→ Select business goals
→ IX recommends agents
→ Build IX Team
→ Connect apps
→ Add knowledge
→ Configure permissions
→ Configure approvals
→ Run safe simulation
→ Deploy agents
→ Enter IX Command
```

The emotional product moment is: **“Your IX Team is ready.”**

## 8. First Commercial Use Case
The MVP must prove one complete business loop:

**Sales automation**
1. A lead enters the tenant.
2. ATLAS reads permitted lead/company context.
3. ATLAS classifies and recommends next action.
4. ZEUS coordinates the workflow.
5. HERMES drafts a personalized follow-up.
6. Policy determines whether sending is automatic or approval-required.
7. The user approves when required.
8. The integration sends the message.
9. CRM state updates.
10. The entire execution appears in the activity/audit timeline.

If this vertical slice is reliable, secure, observable, bilingual and tenant-safe, IX has a valid SaaS foundation.

## 9. Business Model
IX should support:
- SaaS subscription
- included usage / entitlements
- metered usage or top-ups where commercially appropriate
- professional onboarding
- custom integrations
- custom business applications
- managed automation/agent operations
- enterprise security/deployment services

Do not finalize pricing before real AI/infrastructure cost telemetry exists.

## 10. Positioning
Instanix should no longer lead with traditional IT support. Primary categories:
1. AI & Business Automation
2. AI Workforce / IX
3. Business Applications — ERP, CRM, Web Apps
4. AI Transformation & Integration

Traditional infrastructure/security expertise may support delivery but should not dominate the brand narrative.

## 11. Public Website Core Message
Hero direction:

**Your Business. Powered by IX.**

AI agents, intelligent automation and business applications working together as one governed digital workforce.

Primary CTA: **Build Your Digital Workforce**  
Secondary CTA: **Meet the IX Team**

A key section should communicate:
> **They are not just mascots. They are working AI agents.**

This statement must remain truthful: public capability claims should map to functionality actually available in production or be clearly marked “Coming soon”.

## 12. Global-Readiness Principles
- Multi-tenant architecture from day one
- Locale-aware UI and data
- EN + AR/RTL at launch
- Currency/timezone abstraction
- Configurable data retention
- Privacy/export/deletion workflows
- region-aware infrastructure strategy later
- provider abstraction for AI/integrations
- organization-level security policies
- API-first internal architecture
- feature flags and entitlement-based releases

## 13. Product Metrics
Measure outcomes, not agent count:
- successful task completion rate
- human intervention rate
- workflow failure rate
- time saved (only when defensibly measured)
- cost per completed task
- AI/infrastructure cost per tenant
- lead response time
- approval turnaround
- automation executions
- active organizations/users
- retention and expansion
- agent reliability by skill

Never market synthetic or unverified metrics as customer results.

## 14. Non-Goals for MVP
- 12 fully autonomous agents
- unrestricted autonomous financial/legal actions
- visual no-code agent builder
- marketplace
- dozens of integrations
- native mobile apps
- global multi-region data residency
- complex ERP replacement

Architecture may anticipate these, but MVP must stay focused.
