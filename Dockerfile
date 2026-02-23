# Stage 1: Build
FROM node:20.19.0-alpine AS builder

ARG ENV_NAME=production
ENV ENV_NAME=$ENV_NAME

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy all code
COPY . .

# Copy proper .env file
COPY .env .env

# Increase Node memory for build
ENV NODE_OPTIONS=--max_old_space_size=4096

# Build NestJS app
RUN yarn build


# Stage 2: Runner
FROM node:20.19.0-alpine AS runner

# ----------------------------
# ⭐ เพิ่ม Timezone Asia/Bangkok
# ----------------------------
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone \
    && apk del tzdata

ENV TZ=Asia/Bangkok
# ----------------------------

WORKDIR /app
ENV NODE_ENV=production

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/src/config ./src/config
COPY --from=builder /app/src/resources ./src/resources

EXPOSE 5000

# Start the NestJS server
CMD ["node", "dist/src/main.js"]
