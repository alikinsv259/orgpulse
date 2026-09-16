FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/api-contract/package.json packages/api-contract/
RUN npm ci

COPY packages/api-contract packages/api-contract
COPY apps/web apps/web

# Пустой VITE_API_URL — клиент ходит на тот же origin, nginx проксирует /api на сервер.
ENV VITE_API_URL=""
RUN npm run build --workspace @org-pulse/web

FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 80
