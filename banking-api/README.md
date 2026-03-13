# Banking API

A Node.js REST API for core banking operations — user management, bank accounts, and transactions — with Clerk-based authentication and role-based access control.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | TypeORM |
| Database | PostgreSQL |
| Auth | Clerk (`@clerk/express`) |
| Validation | Zod |
| API Docs | Swagger UI (`swagger-ui-express`) |
| Testing | Jest + Supertest |
| Package Manager | pnpm |

## Architecture

The project follows a **component-based layered architecture**. Each domain (user, bank-account, transaction) is self-contained with three layers:

- **`domain/`** — pure business logic; entities, repositories, domain services. No HTTP concerns.
- **`application/`** — orchestration layer; coordinates cross-domain operations (e.g. transaction debit/credit across accounts).
- **`entry/`** — HTTP boundary; controllers, routes, Zod input validation, DTO output mapping.

```
src/
├── common/             # Shared utilities, middleware, types, configs
│   ├── configs/        # DB, CORS, environment, Swagger
│   ├── constants/      # Error codes, HTTP status, pagination defaults
│   ├── databases/
│   │   └── migrations/ # TypeORM migration files
│   ├── middleware/     # Auth, role guard, rate-limit, attach-db-user
│   ├── repository/     # Base repository (pagination, CRUD helpers)
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Shared utility functions (error response, money, pagination)
├── modules/
│   ├── bank-account/
│   │   ├── application/ # BankAccountApplicationService (account number generation, user validation)
│   │   ├── domain/      # Entity, repository, BankAccountService
│   │   ├── entry/       # Controller, routes, DTO (Zod schemas + output mapper), tests
│   │   └── types/
│   ├── transaction/
│   │   ├── application/ # TransactionApplicationService (cross-domain debit/credit + DB transaction)
│   │   ├── domain/      # Entity, repository, TransactionService
│   │   ├── entry/       # Controller, routes, DTO (Zod schemas + output mapper), tests
│   │   ├── types/
│   │   └── utils/       # resolveTransactionName helper
│   ├── user/
│   │   ├── application/ # UserApplicationService (thin delegation wrapper)
│   │   ├── domain/      # Entity, repository, UserService, external (Clerk)
│   │   ├── entry/       # Controller, routes, DTO (output mapper), tests
│   │   ├── types/
│   │   └── webhooks/    # Clerk webhook handler
│   └── webhook/         # Webhook HTTP entry point
└── docs/               # OpenAPI YAML spec
```

## Prerequisites

- Node.js v22
- pnpm v10
- PostgreSQL (or Docker)

## Quickstart

1. Clone the repository
```bash
git clone <repo-url>
cd banking-api
```

2. Install dependencies
```bash
pnpm install
```

3. Create `.env` from `.env.example` and fill in the values:
```env
PORT=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
CORS_ORIGIN=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
```

4. Set up the database
```bash
pnpm migration:run
```

5. Start the server
```bash
# Development (auto-reload)
pnpm dev

# Production
pnpm build
pnpm start
```

6. Start ngrok (IMPORTANT: syncs user data between Clerk and local DB via webhooks)
```bash
ngrok http {PORT}
```

## Running with Docker

The easiest way to run the full stack (API + PostgreSQL) is with Docker Compose from the **root `node-js/` directory**.

1. Ensure `banking-api/.env` exists with all required variables (see Quickstart step 3)
2. Start all services:
```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`. Migrations run automatically on startup. PostgreSQL data is persisted via a bind mount at `./banking-api/data/postgres`.

## Database Migrations

Schema is managed via TypeORM migrations — `synchronize` is disabled in all environments.

| Command | Description |
|---|---|
| `pnpm migration:run` | Apply all pending migrations |
| `pnpm migration:revert` | Revert the last applied migration |
| `pnpm migration:show` | List all migrations and their status |
| `pnpm migration:create <path>` | Create a new empty migration file |
| `pnpm migration:generate --name=<Name>` | Auto-generate migration from entity diff |

**Adding a migration after entity changes:**
```bash
pnpm migration:generate --name=AddSomeFeature
pnpm migration:run
```

**Fresh database setup (e.g. after pulling changes):**
```bash
pnpm migration:revert   # drop existing tables if any
pnpm migration:run
```

## API Reference

All protected routes require a Clerk session token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Users

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all users (paginated, filterable by status) |
| `GET` | `/api/users/me` | Any | Get the currently authenticated user |
| `GET` | `/api/users/:id` | Any | Get user by ID |
| `POST` | `/api/users/:id/activate` | Admin | Activate a deactivated user |
| `POST` | `/api/users/:id/de-active` | Admin | Deactivate a user |

### Bank Accounts

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/bank-accounts` | Any | List accounts (users see own; admin sees all or filters by `?userId=`) |
| `GET` | `/api/bank-accounts/:id` | Any | Get account by ID (ownership enforced for users) |
| `POST` | `/api/bank-accounts` | User only | Create a bank account |
| `PUT` | `/api/bank-accounts/:id` | User only | Update account name |

### Transactions

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | Any | List transactions (users see own; admin sees all) |
| `GET` | `/api/transactions/:id` | Any | Get transaction by ID (ownership enforced for users) |
| `POST` | `/api/transactions` | User only | Create a transaction (deposit / withdraw / transfer) |
| `PUT` | `/api/transactions/:id` | User only | Update transaction description |

### Webhooks

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhooks/clerk` | Clerk webhook — syncs user creation/updates to DB |

## Role-Based Access Control

| Permission | User | Admin |
|---|---|---|
| Get current user (`/me`) | ✅ | ✅ |
| View own bank accounts / transactions | ✅ | — |
| View all bank accounts / transactions | — | ✅ |
| Filter bank accounts by `?userId=` | — | ✅ |
| Create / update bank accounts | ✅ | ❌ 403 |
| Create / update transactions | ✅ | ❌ 403 |
| List users | — | ✅ |
| Activate / deactivate users | — | ✅ |

## Authentication

Auth is handled by [Clerk](https://clerk.com). The API never parses JWT tokens directly — `clerkMiddleware()` verifies the session token automatically, and `getAuth(req)` exposes the trusted `userId`. The app then resolves the internal database user via the `attachDatabaseUser` middleware.

## API Documentation

Interactive Swagger UI is available when the server is running:

```
http://localhost:{PORT}/api-docs
```

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

## Documents

- API Design: [Google Doc](https://docs.google.com/document/d/1Kj6xx8fhK0Ang_ILdhWBFuQd_XcZLe9FbaLkjtue-eg/edit?tab=t.0)
- Requirements: [Google Doc](https://docs.google.com/document/d/1KJdLPmKCXQfii4f_D6koGV-B7ABZ-6gdlZXACXanjkk/edit?tab=t.0)
