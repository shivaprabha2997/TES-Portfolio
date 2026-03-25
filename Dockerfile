#stage1
FROM node:12.18.1 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .

#stage2
FROM node:12.18.1-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 8080
CMD ["node", "server.js"]
