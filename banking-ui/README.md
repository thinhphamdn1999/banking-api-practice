# Banking UI

A React + TypeScript frontend for the Banking API. Supports two roles — regular users manage their own accounts and transactions, while admins have a read-only view across all data and can manage users.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| UI Library | Material UI v7 |
| Auth | Clerk (`@clerk/clerk-react`) |
| Server State | TanStack Query v5 |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Charts | MUI X Charts |
| Package Manager | pnpm |

## Features

### Regular User
| Page | Description |
|---|---|
| **Dashboard** | Balance summary, per-account balance chart, recent transactions |
| **Bank Accounts** | View, create, and rename personal bank accounts |
| **Transactions** | View, filter, and create transactions (deposit / withdraw / transfer) |
| **Profile** | Manage profile via Clerk's hosted UI |

### Admin
| Page | Description |
|---|---|
| **Dashboard** | Read-only overview of all accounts and transactions |
| **Bank Accounts** | Read-only view of all accounts |
| **Transactions** | Read-only view of all transactions |
| **Users** | List all users, filter by status, deactivate accounts |
| **User Detail** | View a specific user's profile, bank accounts, and transactions |

## Prerequisites

- Node.js v22
- pnpm v10
- [Banking API](../banking-api) running locally (or via Docker)

## Quickstart

1. Navigate to the UI folder
```bash
cd banking-ui
```

2. Install dependencies
```bash
pnpm install
```

3. Create `.env` from `.env.example` and fill in the values:
```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_BASE_URL=
```

4. Start the development server
```bash
pnpm run dev
```

## Running with Docker

`VITE_*` variables are baked into the bundle at build time — ensure `.env` exists before building.

```bash
docker compose up --build
```

The app will be available at `http://localhost:80`, served by nginx as static files.

## Scripts

```bash
pnpm run dev        # Start dev server with HMR
pnpm run build      # Type-check + production build
pnpm run preview    # Preview production build locally
pnpm run lint       # Run ESLint
pnpm run format     # Format with Prettier
```
