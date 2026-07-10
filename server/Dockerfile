# Base image
FROM node:18

# Working directory
WORKDIR /usr/src/app

# Dependencies
COPY package*.json ./
RUN npm ci

# Source
COPY . .

# Prisma Generate
RUN npx prisma generate

# Build
RUN npm run build

# Expose Port
EXPOSE 3000

# Start
CMD ["npm", "run", "start:prod"]
