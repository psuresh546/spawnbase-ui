# ─────────────────────────────────────────
# Stage 1: Build React app
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
# npm install only re-runs when package.json changes
COPY package.json package-lock.json ./

RUN npm ci --silent

# Copy source and build
COPY public ./public
COPY src ./src

# Set the API Gateway URL for production build
ENV REACT_APP_API_URL=http://localhost:8080

RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Serve with nginx
# ─────────────────────────────────────────
FROM nginx:alpine

# Copy built React files to nginx web root
COPY --from=builder /app/build /usr/share/nginx/html

# nginx config for React Router (client-side routing)
# Without this, refreshing /instances/123 returns 404
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]