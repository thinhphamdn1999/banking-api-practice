# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.22.0
ARG PNPM_VERSION=10.28.1

################################################################################
# Build stage: install dependencies and compile the Vite app.
FROM node:${NODE_VERSION}-alpine AS build

# VITE_* vars are baked into the bundle at build time.
# Vite reads them automatically from .env in the build context.
ENV HUSKY=0

WORKDIR /usr/src/app

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

################################################################################
# Final stage: serve the static build with nginx.
FROM nginx:alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
