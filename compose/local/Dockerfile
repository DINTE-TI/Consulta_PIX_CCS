FROM node:lts

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY package.json ./

RUN npm install

RUN npm i -g prisma

COPY . .

RUN npx prisma generate --schema ./prisma/schema.prisma

EXPOSE 3000

CMD ["npm", "run", "dev"]
