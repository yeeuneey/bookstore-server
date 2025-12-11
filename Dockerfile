# Node 20 is required for Prisma 7.x
FROM node:20

# 작업 디렉토리 생성
WORKDIR /app

# OS 패키지 설치 (Prisma native deps 안정화)
RUN apt-get update && apt-get install -y openssl

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (peer deps 오류 방지)
RUN npm install --legacy-peer-deps

# 프로젝트 전체 복사
COPY . .

# Prisma Client 생성
RUN npx prisma generate

# 컨테이너 포트 공개
EXPOSE 3000

# 앱 실행
CMD ["npm", "run", "start"]
