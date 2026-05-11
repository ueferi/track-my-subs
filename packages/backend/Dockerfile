FROM node:22-alpine AS base
RUN npm install -g pnpm

# 依存関係インストール
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma
RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend exec prisma generate

# shared ビルド
FROM deps AS shared-build
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
RUN pnpm --filter shared build

# backend ビルド
FROM shared-build AS backend-build
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/
RUN pnpm --filter backend build

# 本番イメージ
FROM node:22-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile --prod

COPY --from=shared-build /app/packages/shared/dist ./packages/shared/dist
COPY --from=backend-build /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/prisma ./packages/backend/prisma

WORKDIR /app/packages/backend

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
