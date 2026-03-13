### Prerequisites

Before running the application, ensure you have a `.env` file in the `banking-ui/` directory with the following variables:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:3000/api
```

> **Important:** `VITE_*` variables are baked into the bundle **at build time**, not at runtime. They must be present in `.env` before running `docker compose up --build`.

### Building and running your application

Run from the **root `node-js/` directory**:

```bash
docker compose up --build
```

Your application will be available at http://localhost:80.

The app is served by **nginx** as static files — no Node.js runtime in production.

### Deploying your application to the cloud

First, build your image. Ensure `banking-ui/.env` is present so Vite can read `VITE_*` variables at build time:

```bash
docker build -t myapp ./banking-ui
```

If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp ./banking-ui`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
* [nginx Docker image](https://hub.docker.com/_/nginx)
