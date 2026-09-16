# Order Management System

Internal (non-ecommerce) system for managing customers, products, and orders for an administrative team. An operator searches for or creates a customer, builds an order by selecting products and quantities, and the system calculates the total and saves the order with `pending` status.

Monorepo: `/backend` (NestJS + Prisma + MySQL), `/frontend` (Next.js), `docker-compose.yml` at the root. See `SPEC.md` and `AGENTS.md` for the product/architecture decisions made before writing any code.

## Prerequisites

- Node.js 24.x and npm
- Docker + Docker Compose (for MySQL, or to run the whole stack)

## Setup

### 1. Environment variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

The default values already point to `localhost` and to MySQL's non-standard port `3307` (so it doesn't clash with a local install on 3306).

### 2. Start MySQL

```bash
docker compose up -d mysql
```

### 3. Backend

```bash
cd backend
npm install        # triggers `prisma generate` via postinstall
npx prisma migrate deploy   # or `npx prisma migrate dev` in development
npm run start:dev
```

Backend at `http://localhost:3001`, Swagger at `http://localhost:3001/api/docs`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:3000`.

## Run everything with Docker Compose

```bash
docker compose up --build
```

Brings up all 3 services (`mysql`, `backend`, `frontend`). The backend waits for MySQL to be `healthy` before starting and applies pending migrations (`prisma migrate deploy`) automatically in its entrypoint, with retries. All 3 services run under `network_mode: host` (see the technical decisions section) — this works on Linux; on other OSes, use the local (non-Docker) setup for frontend/backend instead.

## Tests

```bash
# Backend — unit (mocked, no database)
cd backend && npm test

# Backend — e2e (against a real backend running on :3001 + MySQL)
docker compose up -d mysql backend   # or `npm run start:dev` in another terminal
cd backend && npm run test:e2e

# Frontend — Playwright (against a real frontend + backend)
cd frontend && npx playwright install chromium   # one-time
npx playwright test
```

## Technical Decisions & Assumptions

**Business rules (open requirements from the prompt)**

- **Product price/name changes → immutable snapshot.** `order_items` stores `product_name` and `unit_price` copied from the product at the exact moment the order is created (`OrdersService.create`, inside the same transaction that calculates the total). Reading an order back (`findAll`/`findOne`) never does `include: { product: true }` or re-reads the catalog — it only returns what was saved on `order_items`. Reasoning: a created order is effectively an invoice line; if the product later changes price or name, past orders must keep showing what was actually sold that day. This is deliberately different from the **customer's** name: `orders` only stores `customer_id` (a live reference to `customers`, no name copy), because the customer's name is master data (the identity of the counterparty), not a description of the transaction — if a typo in the name is fixed, every order for that customer (past and future) should reflect it.
- **Order cancellation / state machine.** Valid transitions are `pending → completed` and `pending → cancelled` only; `completed` and `cancelled` are terminal. Any other transition (including trying to cancel an already-`completed` order) returns `409 Conflict` (`OrdersService.updateStatus`; see also `update-order-status.dto.ts`, which restricts the request body to `"completed" | "cancelled"` via `@IsIn`). Cancelling never deletes the row — it only changes `status`, for traceability.
- **Scalability (thousands of records).** Indexes on `orders.customer_id`, `orders.status`, `orders.created_at`, `order_items.order_id`, `order_items.product_id` (`schema.prisma`) — these cover the filters/joins the API actually uses today (listing a customer's orders, filtering by status, ordering by date, resolving an order's items). Nothing more aggressive (caching, stored procedures, partitioning) was implemented, since the prompt doesn't require it for this submission; it's documented below as a future improvement.

**Infrastructure / implementation decisions**

- **Prisma 7 + driver adapters are mandatory.** Prisma 7 removed the "classic" query engine with a native binary: `new PrismaClient()` without an `adapter` throws `PrismaClientInitializationError`. `@prisma/adapter-mariadb` is used in `PrismaService`.
- **MySQL 8 + `caching_sha2_password`.** The `mariadb` driver needs `allowPublicKeyRetrieval: true` to complete MySQL 8's default non-TLS auth handshake (see `PrismaService.toPoolConfig`). Without this, the first connection right after a freshly created MySQL container either fails or hangs.
- **API contract normalized via a global interceptor.** Prisma returns camelCase objects and `Decimal` as its own type; the frontend (already built) expects snake_case and `number`. Instead of rewriting the frontend, `TransformResponseInterceptor` recursively normalizes every backend response. Pagination across all 3 resources uses the same flat shape: `{ data, total, page, limit, total_pages }`.
- **`orders` DTOs in snake_case (`customer_id`, `product_id`).** A deliberate exception to Nest's camelCase convention: the frontend's Server Actions already send the body this way; naming the DTO the same way avoids touching the frontend.
- **Backend e2e tests as "black-box" tests (Supertest against a real running server), not against an in-memory Nest `TestingModule`.** Prisma 7's WASM query compiler (used by the driver adapters) doesn't load correctly inside Jest's `--experimental-vm-modules` sandbox — any test that instantiates `PrismaService` in the same Jest process hangs or crashes with an undefined-`Buffer` error. This is a library incompatibility, not an issue with this code: it's worked around by instantiating the Prisma client in a normal Node process (the real server) and talking to it over HTTP from the tests.
- **Docker Compose with all 3 services on `network_mode: host`.** This way no `.env` needs to change between local development and Docker (everything stays `localhost`), avoiding the need to mix host networking (already used by MySQL) with Compose's default bridge network. Trade-off: only works on Linux and requires ports 3000/3001/3307 to be free on the host.
- **`next.config.ts` with `output: "standalone"`** for a lightweight Docker image. `/orders/new` is marked `force-dynamic` because it fetches active customers/products — this avoids the Next build needing a reachable backend at build time.
- **A single README at the root** (this file) instead of separate per-package READMEs, since this is a monorepo with a single `docker-compose.yml` and a single source of truth for setup.
- **No stored procedures, auth, roles, websockets, or hexagonal layers** — out of scope per `AGENTS.md`/`SPEC.md`.

## Known Limitations

- No authentication or access control — anyone with the URL can operate the system.
- No inventory/stock control — the catalog is just name + price.
- **There's no way to correct an already-`completed` order.** This is an intentional design decision: a completed order is, in practice, an accounting/legal record (like an invoice that has already been issued) and isn't edited in place. But since the state machine also doesn't allow `completed → cancelled`, if a mistake happened after completing an order (wrong quantity captured, wrong product), there's currently no flow to fix it — no cancellation, no "credit note" to reverse it. The right fix would be to add that mechanism (or allow cancelling a `completed` order within a short time window); it's documented here as a future improvement, not implemented in this submission.
- **Found and fixed during review:** `UpdateCustomerDto`/`UpdateProductDto` were missing the `isActive` field entirely (neither camelCase nor snake_case), so toggling a customer/product back to active was silently broken regardless of the request body's casing, and `update()` used the isActive-filtering `findOne()` as its existence guard, which made reactivating an inactive record impossible even after the field was added. Both DTOs now accept `isActive`, and `update()` uses a non-filtering lookup as its existence check — reactivating now works end to end through the same "Activate" button in the UI.
- `network_mode: host` in Docker Compose is Linux-only.
- Backend e2e tests and the Playwright e2e test require a real server running (they're not isolated in an in-memory sandbox).
- Buttons that navigate (`<Button render={<Link .../>}>`) emit a Base UI console warning ("expected a native `<button>`") in development. This is cosmetic: `nativeButton={false}` was tried to silence it, but that rewrites the ARIA role from `link` to `button` on navigation elements (a real accessibility/semantics regression), so it was reverted — the warning is documented here instead of "fixed" with a worse solution.

## Future Improvements (documented, no code)

- JWT auth with operator/admin roles
- Audit trail for status changes (`order_status_history` table)
- Caching over the catalog
- Stored procedures for high-volume reads
- Customer notifications on status change
- CI/CD + deployment (GitHub Actions + Railway/Render)
- Rate limiting and observability

## AI Usage

Claude Code (Claude Sonnet 5) was used throughout the build — scaffolding the NestJS modules, the Prisma schema, the Next.js pages/components, and the Docker setup, plus several review passes against `SPEC.md`/`AGENTS.md` and the original prompt. `SPEC.md` was written first, as a product/architecture brief, specifically so the AI had a single source of truth for business rules instead of guessing them from a bare prompt.

What that review process actually caught and how it was validated:

- A real backend bug (`UpdateCustomerDto`/`UpdateProductDto` missing `isActive`, breaking reactivation both ways) — found by re-reading the update path against the soft-delete requirement, fixed, and confirmed by exercising the "Activate" button end to end plus re-reading the fixed `update()` method.
- An over-engineered `useCallback` in `search-bar` with no memoized child to justify it — flagged during a "look for over-engineering" pass, removed, verified with `tsc --noEmit`.
- Two design questions I pushed back on and had explained rather than taken at face value: whether the product-name snapshot should behave like the customer name (it shouldn't — verified in code that `order_items.product_name` is never re-joined against the live `products` table, unlike `orders.customer_id` which intentionally is a live reference), and how to phrase the "deactivate" action in the UI (kept the trash icon for quick recognition, moved the actual consequence — "hidden from active list, can't be used in new orders, history preserved" — into the confirmation dialog's text instead of the button label).
- Claims about Docker completeness, README sections, and git history were independently checked against the actual files (`docker-compose.yml`, `Dockerfile`s, `git log`) rather than assumed.

`SPEC.md` originally planned to orchestrate Gemini Flash in parallel with Claude; in practice, all commits in this repository were produced with Claude Code end to end (see `Co-Authored-By: Claude Sonnet 5` on every commit) — the Gemini Flash orchestration described in `SPEC.md` was the initial plan, not what actually happened.

## Backend Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/customers` | Create customer |
| GET | `/customers` | List active customers (paginated, search by name) |
| GET | `/customers/:id` | Get customer |
| PATCH | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Soft-delete (`is_active=false`) |
| POST | `/products` | Create product |
| GET | `/products` | List active products (paginated, search by name) |
| GET | `/products/:id` | Get product |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Soft-delete (`is_active=false`) |
| POST | `/orders` | Create order (`customer_id` + `items[]`) |
| GET | `/orders` | List orders (paginated, filter by `status`/`customer_id`) |
| GET | `/orders/:id` | Get order with items and customer |
| PATCH | `/orders/:id/status` | Change status (`pending → completed\|cancelled`, 409 if invalid) |

Full interactive documentation at `/api/docs` (Swagger).
