FROM node:20-alpine AS build
WORKDIR /app

# Vite lee estas variables en tiempo de build; por eso entran vía build-args.
ARG VITE_API_BASE_URL
ARG VITE_API_BASE
ARG VITE_IO_BASE
ARG VITE_STOMP_BASE

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_IO_BASE=$VITE_IO_BASE
ENV VITE_STOMP_BASE=$VITE_STOMP_BASE

COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Server stage (static server)
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD [ "serve", "-s", "dist", "-l", "4173" ]