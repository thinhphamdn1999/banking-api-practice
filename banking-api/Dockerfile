# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.22.0
ARG PNPM_VERSION=10.28.1

################################################################################
# Base image shared across all stages.
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

ENV NODE_ENV=production
# Disable Husky Git hooks during Docker builds.
ENV HUSKY=0

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

################################################################################
# Build stage: install all dependencies and compile TypeScript.
FROM base AS build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

################################################################################
# Final stage: lean production image.
FROM base AS final

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/docs ./src/docs

USER node

EXPOSE 3000

CMD ["pnpm", "start"]
