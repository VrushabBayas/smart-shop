FROM node:23-alpine 

WORKDIR /app 

COPY package.json package-lock.json ./ 

RUN npm install

COPU . .

EXPOSE 3002

CMD ["sh", "-c", "npm start"]
