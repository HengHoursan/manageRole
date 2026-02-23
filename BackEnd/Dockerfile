# =========================================
# Stage 1: Develop/Build the Node.js Express Application
# =========================================
ARG NODE_VERSION=20.12.0-alpine

# Use a lightweight Node.js image for development/building
FROM node:${NODE_VERSION} AS build

# Set the working directory inside the container
WORKDIR /src

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Install project dependencies
RUN --mount=type=cache,target=/root/.npm npm install

# Copy the rest of the application source code into the container
COPY . .

# =========================================
# Stage 2: Production Build
# =========================================
FROM node:${NODE_VERSION} AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /src/package.json /src/package-lock.json* ./
COPY --from=build /src/src ./src
COPY --from=build /src/server.js ./

# Install only production dependencies
RUN npm ci --only=production

# Change ownership of the application directory to the node user
RUN chown -R node:node /app

# Switch to the node user
USER node

# Expose the port used by the Express server
EXPOSE 3000

# Start the application
CMD [ "node", "server.js" ]
