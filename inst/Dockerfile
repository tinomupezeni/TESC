# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set npm config to be more resilient to network issues
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000

COPY package*.json package-lock.json* ./
# Use 'ci' for faster, more reliable installs in Docker
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]