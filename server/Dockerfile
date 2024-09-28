FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

RUN npm install

COPY . .

EXPOSE  6969


CMD ["pnpm", "dev"]

