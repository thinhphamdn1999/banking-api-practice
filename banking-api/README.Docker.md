### Prerequisites

Before running the application, ensure you have a `.env` file in the `banking-api/` directory with the following variables:

```
DATABASE_NAME=banking-api
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
```

Docker Compose reads this file automatically to configure both the `server` and `db` services.

### Building and running your application

When you're ready, start your application by running:
`docker compose up --build`.

Your application will be available at http://localhost:3000.

The PostgreSQL database runs as a separate container and data is persisted in a Docker volume (`db-data`) across restarts.

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
