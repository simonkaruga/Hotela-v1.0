FROM node:20-slim AS base
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages
RUN npm install --workspace=apps/api

COPY apps/api ./apps/api
RUN npm run build --workspace=apps/api

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
