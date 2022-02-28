FROM node:lts as build

WORKDIR /app
COPY . .
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install
RUN sed -i 's/ | ActiveXObject//' node_modules/phaser/types/phaser.d.ts
RUN yarn build