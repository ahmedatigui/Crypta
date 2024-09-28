FROM node:20-alpine

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE  6969


CMD ["pnpm", "dev"]

