FROM node:23-alpine3.20

COPY ./ /app/

WORKDIR /app

RUN npm install

ENV CI=true

CMD ["npm", "run", "dev"]