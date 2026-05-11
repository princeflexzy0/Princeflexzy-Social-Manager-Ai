
# Use official Node.js LTS image
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN mkdir -p /app/logs

EXPOSE 3000

HEALTHCHECK  --interval=15s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:3000  || exit 1

CMD ["node", "server.js"]


