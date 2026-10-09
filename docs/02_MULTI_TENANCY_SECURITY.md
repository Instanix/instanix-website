# Multi-Tenancy, Authorization & Security

## Tenancy Rules
- Every tenant-owned table includes `organization_id UUID NOT NULL`.
- Workspace-owned resources also include `workspace_id`.
- Never trust organization IDs supplied by the client without membership validation.
- Tenant isolation must be enforced by PostgreSQL RLS where practical and duplicated by service authorization for defense in depth.
- Background jobs must carry explicit tenant identity.
- Cache keys, vector namespaces, storage paths and logs must be tenant-aware.

## Roles
Initial organization roles:
- Owner
- Admin
- Manager
- Member
- Viewer
- Billing Admin
- Security Admin

Platform roles are separate from organization roles.

## Agent Identity
Agents execute under service identities scoped to an organization and an allowed skill/tool set. They never inherit unlimited Owner privileges.

## Policy Decision
Every tool action resolves to one of:
- `AUTO`
- `REVIEW`
- `APPROVAL_REQUIRED`
- `DENIED`

Policy inputs may include:
- organization
- actor/user
- agent
- tool
- resource
- action sensitivity
- amount/value threshold
- destination/external recipient
- working hours
- tenant policy
- plan entitlement

## Human Approval
Approval records include:
- requestor agent/user
- intended tool/action
- human-readable summary
- structured arguments snapshot
- risk classification
- expiry
- approver(s)
- resolution
- execution reference

Approval is not execution. After approval, authorization must be rechecked before the action runs.

## Security Baseline
- MFA-ready authentication
- secure session cookies
- CSRF protections where applicable
- CSP and security headers
- input/schema validation
- output encoding
- RLS
- RBAC/ABAC-style policy checks
- rate limiting
- API quotas
- webhook signature verification
- OAuth state/PKCE where applicable
- encrypted secrets via secret manager/vault
- key rotation procedures
- audit logs
- dependency/security scanning
- backups and tested restoration
- account export/deletion workflows
- configurable retention

## Prompt Injection Boundary
All external text (emails, web pages, uploaded files, CRM notes) is untrusted data. Content inside a document cannot redefine system policy or grant tools/permissions.

Retrieval must preserve source metadata and permissions. Agents should distinguish instructions from trusted application policy versus retrieved content.

## High-Risk Defaults
The following are approval-required or denied by default:
- sending contracts externally
- executing payments/refunds
- deleting customer/tenant data
- changing roles/permissions
- exporting bulk sensitive data
- changing security settings
- publishing external statements on behalf of a company

Legal and finance agents support operations; they do not replace qualified human legal/accounting review where required.

## Platform Support Access
Platform administrators must not have casual unrestricted access to tenant content. Support access should be just-in-time where possible, purpose-bound, and audited.

## Release Blockers
A release fails if:
- cross-tenant access is possible
- RLS tests fail
- secrets are exposed client-side/logged
- approval can be bypassed
- privileged tool calls are unaudited
