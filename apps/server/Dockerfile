FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/api-contract/package.json packages/api-contract/
RUN npm ci

COPY packages/api-contract packages/api-contract
COPY apps/server apps/server
RUN npm run build --workspace @staff-pulse/server

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/apps/server/dist/index.cjs ./index.cjs

EXPOSE 4001
CMD ["node", "index.cjs"]
