# IX UI/UX Design System

## Canonical Experience
- Default language: English
- Default theme: Light
- Alternatives: English Dark, Arabic Light, Arabic Dark
- Arabic is first-class RTL, not a later translation patch.

## Design Character
Premium enterprise AI. Clean, confident and futuristic without becoming sci-fi/cyberpunk.

Keywords:
- intelligent
- precise
- calm
- premium
- dimensional
- transparent
- trustworthy

## Visual Language
Primary brand color: Instanix electric blue (working reference `#0091FF`; verify against final brand asset before locking tokens).

Use:
- warm/neutral off-white light surfaces
- deep navy/near-black dark surfaces
- selective electric blue/cyan glow
- translucent glass surfaces in focal areas
- layered depth and soft shadows
- restrained gradients
- generous spacing

Do not use:
- excessive neon
- random gradients
- generic AI brains
- stock robots
- permanent heavy blur
- decorative motion that harms usability

## IX Characters
IX characters are core brand IP. Character consistency takes priority over generative novelty.

Rules:
- stable body/suit/material language
- stable chest logo
- exact serial ID
- individual accent color
- no random redesigns
- 3D/character assets enhance product comprehension, not block it

Instanix remains visually blue; agent accent colors identify roles.

## Depth / Glass
Glass should be used selectively for:
- command bar
- agent status cards
- floating workflow nodes
- hero overlays
- approval panels

Every glass component must remain readable in both themes and support reduced transparency/fallback behavior.

## Motion Language
Motion communicates system state:
- agent activation: subtle illumination
- handoff: directional flow
- processing: restrained pulse
- approval waiting: paused state
- success: connection completion
- error: controlled alert state

Respect `prefers-reduced-motion`.

## Public Hero
Direction:
**Your Business. Powered by IX.**

Desktop: copy on left; IX hero composition on right; subtle dimensional workflow elements. Mobile: prioritize copy/CTA and lightweight character asset.

## SaaS Shell
Desktop:
- left navigation
- top context/org switcher
- global `Ask IX…` command entry
- contextual right panel/drawer for activity/approvals where useful

Primary navigation:
- Command
- My IX Team
- Tasks
- Approvals
- Clients
- Projects
- Automations
- Knowledge
- Integrations
- Analytics
- Usage
- Settings

## Command Home
Header: `Good morning, {name}` / locale equivalent.

Core cards:
- Company Pulse
- Priority Approvals
- Agent Activity
- Sales/Pipeline
- Project Health
- Usage & AI Cost
- Agent Health

Do not fabricate business data. Empty/demo states must be explicitly marked.

## Agent Experience
Agent card:
- character
- ID + name
- role
- state: Offline / Configuring / Ready / Active / Needs Attention
- current/last activity
- key skill indicators

Agent detail:
- Overview
- Skills
- Connected Apps
- Knowledge
- Permissions
- Autonomy & Approvals
- Activity
- Performance
- Settings

Use `Deploy`, not misleading “training” language when configuring prompts/knowledge. If “Training” is used as UX copy, explain it means configuration/knowledge preparation, not foundation-model training.

## Internationalization
- `<html lang>` and `dir` are correct
- directional icons mirror where semantically appropriate
- IDs, code and API tokens remain LTR
- components use logical CSS properties
- avoid hardcoded left/right spacing
- layouts must be tested with long Arabic strings
- date, number, timezone and currency formatting are locale-aware

## Accessibility
Target WCAG 2.2 AA principles:
- keyboard navigation
- visible focus
- sufficient contrast
- semantic landmarks
- labels for icon-only actions
- motion reduction
- screen-reader status for async agent actions

## Responsive
Desktop is information-rich; mobile is action-first.
Mobile priority tabs/features:
- Pulse
- Approvals
- Ask IX
- Clients
- Agents

3D is progressive enhancement. Low-power/mobile devices receive optimized static or lightweight alternatives.
