-- Organizations (tenants) and website leads.
--
-- Tenancy: every tenant-owned row carries organization_id (docs/02_MULTI_TENANCY_SECURITY.md).
-- Row Level Security is enabled with NO policies, so the anon and authenticated roles can
-- read and write nothing. Only the server, using the service role key, can insert leads.
-- Policies for signed-in members are added with authentication in a later migration.

create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- Tenant #1. The fixed id is referenced by the website's server configuration.
insert into public.organizations (id, slug, name)
values ('00000000-0000-4000-8000-000000000001', 'instanix', 'Instanix');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  created_at timestamptz not null default now(),

  -- Idempotency: one lead per assessment, even if the form is submitted twice.
  assessment_id uuid not null,

  source text not null default 'website_assessment',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  locale text not null check (locale in ('en', 'ar')),

  name text not null check (char_length(name) between 2 and 80),
  company text check (company is null or char_length(company) <= 120),
  phone text check (phone is null or phone ~ '^\+?[0-9]{8,15}$'),
  email text check (email is null or char_length(email) <= 254),
  constraint leads_has_contact check (phone is not null or email is not null),

  -- The visitor agreed to be contacted and to have these details stored.
  consent_at timestamptz not null,

  industry text not null,
  company_size text not null,
  country text not null,
  problem text not null check (char_length(problem) <= 1500),
  tools text not null default '' check (char_length(tools) <= 300),

  -- The validated ZEUS assessment shown to the visitor.
  assessment jsonb not null,

  constraint leads_assessment_unique unique (organization_id, assessment_id)
);

create index leads_organization_created_idx on public.leads (organization_id, created_at desc);

alter table public.leads enable row level security;
