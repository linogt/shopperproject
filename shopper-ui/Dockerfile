FROM node:22.11.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --save-dev

COPY . .

RUN npm run build

EXPOSE 80

CMD ["npm", "run", "dev"]
