# Changelog

All notable changes to **bnpi-sm-api** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Removed the seeded demo bookings ("Weekly sync", "VIP client visit") from `db/seeds/bookings.seed.mjs` — a fresh database now starts with no bookings, and the demo calendar fills only via the UI/API. The bookings seed remains as a documented no-op target.

### Added

- **BDSS Phase 1 domain** — room-booking system for Bandai Namco Philippines:
  - `auth` module: `POST /api/v1/auth/login`, `GET /api/v1/auth/me` (JWT bearer, bcrypt, no user-enumeration on failed login).
  - `rooms` module: `GET /api/v1/rooms`, `GET /api/v1/rooms/:id` (public, computed `currentStatus` occupied/vacant).
  - `bookings` module: `GET /api/v1/bookings/availability` (public, redacted), `GET /api/v1/bookings`, `GET /api/v1/bookings/:id`, `POST /api/v1/bookings`, `POST /api/v1/bookings/:id/cancel`, `POST /api/v1/bookings/:id/check-in` (staff-only; conflict detection via app pre-check + Postgres `EXCLUDE` constraint).
  - Biometric check-in extension seam (`modules/bookings/biometrics/`) — one `manual` provider today, ready for a future hardware provider behind the same interface.
  - Fixed `+08:00` (Asia/Manila) calendar-day timezone for availability/list day windows (`APP_TIMEZONE_OFFSET`).
  - New env: `AUTH_JWT_SECRET`, `AUTH_JWT_EXPIRES_IN`, `BIOMETRICS_PROVIDER`.
  - Seed data: 2 demo accounts, 4 rooms, sample bookings (`db/seeds/{auth,rooms,bookings}.seed.mjs`).
- PostgreSQL readiness: `pg` pool + Drizzle ORM (`config/db.ts`, `db/schema`, repositories).
- SQL migrations (`npm run db:migrate` / `db:status`) and Compose `postgres:16` service.
- `DATABASE_URL` + `DATABASE_POOL_MAX` env (optional; empty = Postgres disabled).
- **`npm run dev` auto-bootstrap:** checks Docker, starts Postgres container if needed, migrates, then runs API (`scripts/dev.mjs`).
- Docs: `docs/DATABASE.md`.
- **Concrete feature workflow** (`docs/FEATURE_WORKFLOW.md`): phases A–H, auto vs manual matrix, Definition of Done; wired into checklist template, `feature:new` next steps, AGENTS / AI_WORKFLOW / CONTRIBUTING.
- **Hardened `feature:new … module`:** auto-mounts `app.ts`, OpenAPI stub (`config/swagger.ts`), `docs/API.md` section, active Supertest (happy + 400), and `db/seeds/<slug>.seed.mjs` stub (marker-managed; reserved slugs blocked).
- **`npm run db:seed`:** idempotent seed runner (`scripts/db-seed.mjs`) + reference `example_notes` seed; docs in `db/seeds/README.md` / `docs/DATABASE.md`.
- **Feature update path** documented in `docs/FEATURE_WORKFLOW.md` (no re-scaffold; delta intent; contract/tests/migration rules).
- **`npm run feature:update`:** creates `.wwg/workspace/features/<slug>.update.md` delta checklist + current-task pointer; never re-scaffolds code (`scripts/feature-update.mjs`).
- **Workflow hardening:** `feature:new` blocks re-scaffold when module exists (redirect to `feature:update`); `feature:done` closes checklists; `feature:doctor` verifies markers (included in `npm run check`).
- **AI sloppy prevention:** `npm run ai:guard` fails on focused tests, `as any`, raw `process.env`, empty catch, open CORS, DONE+skip/scaffold echo; governance in `.wwg/governance/ai-sloppy-prevention.md`; pre-commit + `npm run check`.
- **URI versioning for domain modules:** `feature:new … module` mounts at `/api/v1/<slug>` (`API_V1_PREFIX`); system routes (`/api/health`, `/api/docs`) and reference `/api/example` stay unversioned.
- **Shared BNPI anti-slop package:** [`@bnpi/anti-slop`](https://github.com/g-zenr/anti-slop) with profiles `api` | `app` | `generic` — one package for any BNPI project.

## [0.1.0] — 2026-07-20

### Added

- Express 5 + TypeScript modular API scaffold (Uzaro-Web-Pro-API layout pattern).
- Health + readiness endpoints (`GET /api/health`, `GET /api/health/ready`).
- Swagger UI + OpenAPI (`GET /api/docs`, `GET /api/docs.json`).
- Zod env validation, Helmet, CORS allowlist, request-id logging, graceful shutdown.
- Global `/api` rate limiting with Redis store when `REDIS_URL` is set (health/docs skipped).
- Reference `example` module (`GET /status`, `POST /echo`) with success envelopes.
- Optional Redis + in-memory cache helper.
- Error handler maps body-parser / 4xx `statusCode` correctly (e.g. 413).
- Docker multi-stage image + Compose with **healthchecks** (API + Redis).
- Jest + Supertest suite (system + example module).
- oxlint + `npm run lint` in local gate and CI.
- **@homedesk/wwg** adoption: multi-agent briefs, intake/plan, feature:new.
- Agent docs: `AGENTS.md`, meta-prompt v2, `docs/AI_WORKFLOW.md`, tool entry files.
- Senior docs: `ARCHITECTURE`, `API`, `SECURITY`, `OPERATIONS`, `CONTRIBUTING`.
- GitHub Actions CI (lint, typecheck, test, build, wwg validate).

### Notes

- Scaffold includes a reference module only — real product domains via `feature:new`.
- Auth / database intentionally deferred (documented in SECURITY + Project Truth).
- Pairs with `bnpi-sm-app` via `VITE_API_BASE_URL`.

[Unreleased]: https://github.com/local/bnpi-sm-api/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/local/bnpi-sm-api/releases/tag/v0.1.0
