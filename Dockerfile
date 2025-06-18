# Stage 1: Build the TypeScript code
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies for the build
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Create the final, lean production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only the necessary files for production
COPY package.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the compiled code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# The PORT will be automatically supplied by Cloud Run.
# We don't need to expose it here, but it's good practice.
# The default Cloud Run port is 8080.
EXPOSE 8080

# The start command from package.json is used to run the app.
CMD [ "npm", "start" ] 