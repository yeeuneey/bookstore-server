FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY src ./src
COPY .env ./

EXPOSE 8080

CMD ["npm", "start"]
