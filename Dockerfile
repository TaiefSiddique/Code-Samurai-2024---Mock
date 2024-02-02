# syntax=docker/dockerfile:1
FROM node:18.19.0-bookworm-slim

WORKDIR /app

COPY . .

RUN bash -c "npm install"

EXPOSE 5000

CMD ["npm", "start"]
