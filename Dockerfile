# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /usr/src/app

# --- deps ---
FROM base AS deps
COPY package.json ./
COPY vendor ./vendor
RUN npm install --omit=dev

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/vendor ./vendor
COPY . .

USER node
CMD ["node", "src/index.js"]
