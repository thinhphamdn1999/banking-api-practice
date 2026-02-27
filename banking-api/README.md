# Banking API

A Node.js REST API for core banking operations — user management, bank accounts, and transactions — with Clerk-based authentication and role-based access control.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | TypeORM |
| Database | SQLite |
| Auth | Clerk (`@clerk/express`) |
| API Docs | Swagger UI (`swagger-ui-express`) |
| Testing | Jest + Supertest |
| Package Manager | pnpm |

## Architecture

The project follows a **component-based layered architecture**. Each domain (user, bank-account, transaction) is self-contained:

```
src/
├── common/             # Shared utilities, middleware, types, configs
│   ├── configs/        # DB, CORS, environment, Swagger
│   ├── constants/      # Error codes, HTTP status, pagination defaults
│   ├── middleware/     # Auth, role guard, rate-limit, attach-db-user
│   ├── repository/     # Base repository
│   └── types/          # Shared TypeScript types
├── components/
│   ├── bank-account/
│   │   ├── domain/     # Entity, repository, service
│   │   ├── entry/      # Controller, routes, tests
│   │   └── types/
│   ├── transaction/
│   │   ├── domain/
│   │   ├── entry/      # Controller, routes, mapper, tests
│   │   └── types/
│   ├── user/
│   │   ├── domain/     # Entity, repository, service, external (Clerk)
│   │   ├── entry/      # Controller, routes, tests
│   │   ├── types/
│   │   └── webhooks/   # Clerk webhook handler
│   └── webhook/        # Webhook HTTP entry point
└── docs/               # OpenAPI YAML spec
```

## Prerequisites

- Node.js v22
- pnpm v10

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
```

3. Start the server
```bash
# Development (auto-reload)
pnpm run dev

# Production
pnpm run build
pnpm start
```

4. Start ngrok (IMPORTANT: This step will help sync data between Clerk and local DB)
```bash
ngrok http {PORT}
```

## API Reference

All protected routes require a Clerk JWT in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Users

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all users (paginated) |
| `GET` | `/api/users/:id` | Any | Get user by ID |
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
| View own bank accounts / transactions | ✅ | — |
| View all bank accounts / transactions | — | ✅ |
| Filter bank accounts by `?userId=` | — | ✅ |
| Create / update bank accounts | ✅ | ❌ 403 |
| Create / update transactions | ✅ | ❌ 403 |
| List / deactivate users | — | ✅ |

## API Documentation

Interactive Swagger UI is available when the server is running:

```
http://localhost:{PORT}/api-docs
```

## Testing

```bash
# Run all tests
pnpm run test

# Watch mode
pnpm run test:watch
```

## Documents

- API Design: [Google Doc](https://docs.google.com/document/d/1Kj6xx8fhK0Ang_ILdhWBFuQd_XcZLe9FbaLkjtue-eg/edit?tab=t.0)
- Requirements: [Google Doc](https://docs.google.com/document/d/1KJdLPmKCXQfii4f_D6koGV-B7ABZ-6gdlZXACXanjkk/edit?tab=t.0)
