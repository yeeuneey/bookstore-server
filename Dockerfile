FROM node:20

WORKDIR /app

# 이미 설치된 node_modules를 그대로 사용
COPY . .

EXPOSE 8080

CMD ["npm", "start"]