# ── Etapa 1: compilar Angular ────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Etapa 2: servir con nginx ────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/sst-report/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
