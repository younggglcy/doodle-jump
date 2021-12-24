FROM node:14 as build

WORKDIR /app
COPY . .
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install
RUN yarn build