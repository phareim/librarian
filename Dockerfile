# Stage 1: Build the TypeScript code
FROM node:16-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install --only=production
COPY . .
RUN npm run build

# Stage 2: Create the final image
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD [ "npm", "start" ] 