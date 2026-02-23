# =========================================
# Stage 1: Build the React Application (Vite)
# =========================================
ARG NODE_VERSION=20.12.0-alpine

FROM node:${NODE_VERSION} AS build

WORKDIR /src

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm npm install

COPY . .

# Build the application
RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginx:alpine AS production

# Copy the build output to Nginx's html directory
COPY --from=build /src/dist /usr/share/nginx/html

# Copy custom nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
