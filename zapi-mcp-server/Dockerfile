FROM node:20-alpine AS builder
WORKDIR /app
COPY zapi-mcp-server/package*.json ./
RUN npm install
COPY zapi-mcp-server/tsconfig.json ./
COPY zapi-mcp-server/src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY zapi-mcp-server/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

ENV TRANSPORT=http
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
