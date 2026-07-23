# Production Dockerfile for Google Cloud Run Deployment
# Node.js Express REST API + Gemini Chatbot Backend Service

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 8080
CMD ["node", "server/index.js"]
