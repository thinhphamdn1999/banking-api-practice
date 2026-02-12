# Banking API

A lightweight Node.js REST API for simple banking operations: user authentication, bank account management, and transactions.

## Documents
- All information in the document:
   - API Design: [Google doc](https://docs.google.com/document/d/1Kj6xx8fhK0Ang_ILdhWBFuQd_XcZLe9FbaLkjtue-eg/edit?tab=t.0)
   - Requirements: [Google doc](https://docs.google.com/document/d/1KJdLPmKCXQfii4f_D6koGV-B7ABZ-6gdlZXACXanjkk/edit?tab=t.0)


## Prerequisites
- Node.js (v22.22) and pnpm (v10.28)

## Quickstart

1. Clone repository
```bash
git clone <repo-url>
cd banking-api
```

2. Install dependencies
```bash
pnpm install
```

3. Create `.env` based on `.env.example` and set values:
```
PORT=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
```

4. Start server
```bash
pnpm run build
pnpm start
# or for development with auto-reload
pnpm run dev
```

## API (examples)

- Auth
  - GET /api/users (auth) - list users

Include Authorization header: `Authorization: Bearer <token>`

## Testing
```bash
pnpm run test
```