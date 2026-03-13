### Prerequisites

Before running the application, ensure you have a `.env` file in the `banking-api/` directory with the following variables:

```
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
DATABASE_TEST_NAME=

# PostgreSQL container vars (used by the postgres Docker image)
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

Docker Compose reads this file automatically to configure both the `api` and `db` services.

### Building and running your application

Run from the **root `node-js/` directory**:

```bash
docker compose up --build
```

Your application will be available at http://localhost:3000.

Migrations run automatically on startup — no manual step required.

PostgreSQL data is persisted via a bind mount at `./banking-api/data/postgres` on your host machine.

### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
