# Project Truth

Adoption status: REVIEWED_AND_ACCEPTED_FOR_SCAFFOLD_SCOPE
Status: Accepted for current API-scaffold scope (2026-07-20). BDSS Phase 1 domain modules (auth, rooms, bookings) accepted 2026-07-24 — see "BDSS Domain (Phase 1)" below.
Truth confidence: HIGH
Last adoption audit: 2026-07-20
Last human/agent review: 2026-07-24

Items marked `NEEDS_CONFIRMATION` are deferred product decisions, not implementation blockers for the scaffold shell.

If this file conflicts with lower-priority reports, generated notes, task files, or stale documentation, this file wins once confirmed.

Project Truth must not be silently overwritten. Requirement evolution is allowed when documented and accepted.

## Product Identity

- Product name: **BNPI SM API** (`bnpi-sm-api`)
- Status: ACCEPTED
- Evidence: package.json, README.md, intake.answers.yaml

## Product Category

- Category: **Backend REST API scaffold / modular Express service**
- Status: ACCEPTED
- Evidence: Express 5 + TypeScript; modules/health; Docker Compose; no SPA in this repo

## One-Line Description

- Description: Senior-level Express 5 + TypeScript modular API scaffold with Zod env validation, health/readiness, Swagger OpenAPI, optional Redis, Docker Compose, Jest + Supertest, and **WWG-governed AI workflows**. Patterned on Uzaro-Web-Pro-API structure without Uzaro domain (chat/AI).
- Status: ACCEPTED

## Primary Users and Roles

- Role: **developer / implementer** (builds modules on the scaffold)
- Role: **AI coding agent** (must follow AGENTS.md + WWG)
- Role: **API consumer** (e.g. `bnpi-sm-app` via HTTP once domain routes ship)
- Status: ACCEPTED for scaffold phase

## Canonical Scope

Currently includes:

- Express 5 + TypeScript (CommonJS) API
- Modular layout: `config/`, `middleware/`, `modules/`, `schema/`, `helper/`, `utils/`
- Zod env validation at boot (`schema/env.ts` → `config/env.ts`)
- Health + readiness: `GET /api/health`, `GET /api/health/ready`
- Swagger UI + OpenAPI: `GET /api/docs`, `GET /api/docs.json`
- Optional Redis (`REDIS_URL`) + memory cache fallback for non-production
- Helmet, CORS allowlist, request-id logging, graceful shutdown
- Jest + Supertest under `tests/` (system + example module)
- Global rate limiting on `/api` (Redis store when configured; health/docs skipped)
- **PostgreSQL** via `DATABASE_URL`, `pg` pool, Drizzle ORM, SQL migrations, readiness check
- Reference module `modules/example` + `example_notes` table for the DB pattern
- Response helpers (`lib/apiResponse.ts`) for domain success envelopes
- Docker multi-stage + Compose with healthchecks (API + Postgres + Redis)
- oxlint + full `npm run check` gate
- **@homedesk/wwg** as the mandatory Wiki / Workspace / Governance OS for AI agents
- `feature:new` auto-scaffold for feature checklists (+ optional `module` stubs)
- Agent meta-prompt template v2 (`agent-meta-prompt-template-v2.md`)
- GitHub Actions CI (lint, typecheck, test, build, wwg validate)
- Senior documentation: ARCHITECTURE, API, VALIDATION, DATABASE, SECURITY, OPERATIONS, CONTRIBUTING

Currently does **not** include unless approved:

- AI / chat (Uzaro-specific domain)
- Terraform / Cloud Run / production CI-CD
- GraphQL
- Auto-migrate-on-boot
- Room CRUD (create/edit/deactivate) — Phase 1 `rooms` module is read-only; Phase 2
- Booking reports/analytics — Phase 2
- Real biometric hardware — see "BDSS Domain" below; only a `manual` provider exists today

## BDSS Domain (Phase 1 — ACCEPTED, 2026-07-24)

BDSS (Biometrics Detection Scheduling System) is this API's first product domain: room-booking for Bandai Namco Philippines (3 meeting rooms + 1 VIP room), paired with `bnpi-sm-app`.

- **Entities**: `users` (id, email, passwordHash, displayName, role, isActive), `rooms` (id, name, type: meeting\|vip, isActive), `bookings` (id, roomId, createdByUserId, title, startsAt, endsAt, status: confirmed\|cancelled, checkedInAt/checkedInByUserId/checkinMethod, cancelledAt/cancelledByUserId).
- **Roles**: `admin`, `front_desk` — both authenticated via JWT bearer; no third backend role. The frontend's "public" view calls only unauthenticated GET endpoints (`/rooms`, `/bookings/availability`).
- **Auth**: email + password (bcryptjs), JWT (`AUTH_JWT_SECRET`, `AUTH_JWT_EXPIRES_IN`), no SSO. `requireAuth`/`requireRole` middleware. Seeded demo accounts: `bdss-admin@bandai.local` / `bdss-front@bandai.local`, both `password123` (`db/seeds/auth.seed.mjs`) — rotate/remove before any real production deploy.
- **Modules**: `modules/auth` (`POST /api/v1/auth/login`, `GET /api/v1/auth/me`), `modules/rooms` (`GET /api/v1/rooms`, `GET /api/v1/rooms/:id` — both public), `modules/bookings` (`GET /api/v1/bookings/availability` public-redacted, `GET /api/v1/bookings`, `GET /api/v1/bookings/:id`, `POST /api/v1/bookings`, `POST /api/v1/bookings/:id/cancel`, `POST /api/v1/bookings/:id/check-in` — all staff-only).
- **Occupied/vacant concept**: a room is `occupied` when a confirmed booking's `[startsAt, endsAt)` window covers "now"; else `vacant` (`rooms.service.ts`). The calendar grid (frontend) colors any time slot red/green the same way per-slot, not just "right now".
- **Conflict prevention**: app-level overlap pre-check (409) + Postgres `EXCLUDE USING gist` constraint (`bookings_no_overlap`) as the concurrency-safe backstop. Half-open ranges — back-to-back bookings don't conflict.
- **Calendar-day timezone**: fixed `APP_TIMEZONE_OFFSET = "+08:00"` (Asia/Manila, no DST) in `config/constants.ts` — day-window boundaries for `/bookings/availability` and `/bookings` are computed in this timezone, not UTC midnight. This matters: a naive UTC-midnight day window misclassifies early-morning local bookings into the wrong day.
- **Biometric hardware extension seam** (explicitly requested, not yet available): `modules/bookings/biometrics/{biometricProvider.ts,manualBiometricProvider.ts,index.ts}` defines a `BiometricProvider` interface with exactly one implementation today — `manual` (staff clicks "Check in" in the UI; `BIOMETRICS_PROVIDER=manual` env selector). A future fingerprint/face scanner integration adds a new enum value to `checkin_method` + a new provider implementation + a new `case` in `getBiometricProvider()` — no controller/route changes needed. **No device hardware, protocol, or table exists yet** — do not assume otherwise.
- **Seeds**: `npm run db:seed` runs files alphabetically. The bookings seed (`db/seeds/bookings.seed.mjs`) is an intentional no-op — the demo "Weekly sync" and "VIP client visit" bookings were removed on request, so a fresh DB starts with no bookings (the demo calendar fills only via the UI/API).

## Canonical Terminology

See `.wwg/wiki/terminology.md`.

Critical terms:

- **WWG** — Wiki, Workspace, Governance agent OS (`@homedesk/wwg`)
- **Module** — feature package under `modules/<name>/` (routes + controller + optional service)
- **Schema** — Zod contracts under `schema/`
- **Config** — runtime config under `config/` (env, cors, redis, swagger, constants)
- **Readiness** — dependency-aware health at `/api/health/ready`
- **Feature checklist** — `.wwg/workspace/features/<slug>.md`

## Architecture Truth

Accepted architecture:

- Entry: `server.ts` (listen + graceful shutdown) → `app.ts` (Express app)
- Env: Zod `schema/env.ts` loaded by `config/env.ts` (fail fast on invalid env)
- Feature modules: `modules/<feature>/*` mounted under `/api/<feature>` in `app.ts`
- Validation: `middleware/validateRequest` with Zod body schemas
- Docs: OpenAPI document assembled in `config/swagger.ts`
- Logging: redacting structured logger in `utils/logger.ts`
- Cache: `helper/cache.ts` (Redis if configured; in-memory fallback outside production)
- Tests: `tests/**/*.test.ts` via Jest + Supertest
- Agent truth: `.wwg/**` + root `AGENTS.md`

## Pairing Frontend

- Companion app: **bnpi-sm-app** (sibling repo/folder)
- Client env: `VITE_API_BASE_URL=http://localhost:5000` (local default)
- CORS: `CORS_ALLOWED_ORIGINS` must include the frontend origin

## Safety / High-Risk Boundaries

Approval-gated (wiki-first plan required):

- Further auth/authorization changes (initial email+password+JWT model is ACCEPTED per "BDSS Domain" above; SSO, password reset, MFA, etc. still require a plan)
- Payments / billing
- Production deploy / secrets management
- Data deletion or destructive migrations
- Opening CORS to `*` in production
- Publishing releases or public announcements
- Real biometric hardware integration (device protocol, drivers, a new `BiometricProvider`)

## Open / Deferred Decisions

- Production host (Cloud Run / VM / other) — `NEEDS_CONFIRMATION`
- Database / ORM: **DECIDED** — Postgres + Drizzle (already in use for BDSS)
- Auth provider: **DECIDED** — self-hosted email+password+JWT, no SSO (see "BDSS Domain")
- Domain entity model: **DECIDED for Phase 1** (`users`/`rooms`/`bookings`) — Phase 2 may add room CRUD fields, report aggregates
- Real biometric hardware vendor/protocol — `NEEDS_CONFIRMATION`, Phase 3+

## Testing Truth

| Layer | Tool | Location |
| --- | --- | --- |
| Unit / integration | Jest + Supertest | `tests/**/*.test.ts` |
| Types | `tsc --noEmit` | whole project |
| Build | `tsc` → `dist/` | production compile |

Gate: `npm run check` = typecheck + test + build + `wwg:validate`.

## WWG Truth

- WWG is **mandatory** for every AI agent (not only one vendor).
- Session start: `npm run wwg:status` + `npm run wwg:brief`.
- Meaningful features: `npm run feature:new -- <slug> …` before large coding.
- Close-out: tests + `npm run wwg:validate` + `npm run wwg:brief`.
