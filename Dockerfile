FROM node:18-alpine

WORKDIR /app

COPY bot/package*.json ./bot/
RUN cd backend && npm install --production

COPY backend ./bot

EXPOSE 3000

CMD ["node", "bot/index.js"]
