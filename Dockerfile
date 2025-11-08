FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/svc-auth/package.json services/svc-auth/

RUN corepack enable && pnpm install --frozen-lockfile --filter @services/svc-auth

COPY services/svc-auth services/svc-auth
COPY tsconfig.base.json ./

RUN pnpm --filter @services/svc-auth build

CMD ["node", "services/svc-auth/dist/index.js"]
