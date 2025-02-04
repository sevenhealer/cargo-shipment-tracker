# Cargo Shipment Tracker

## Overview
This is a MERN stack-based cargo shipment tracking application with real-time updates.

## Setup Instructions

### Prerequisites
- Docker & Docker Compose installed

### Run the Application
1. Clone the repository:
   ```sh
   git clone https://github.com/sevenhealer/cargo-shipment-tracker.git
   cd cargo-shipment-tracker
   ```

2. Build and run containers:
    ```sh
    docker-compose up --build
    ```
3. 
Here are the Dockerfiles for both the backend and frontend, along with a docker-compose.yml file to run everything together.

Backend Dockerfile (backend/Dockerfile)
dockerfile
Copy
Edit
# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
Frontend Dockerfile (frontend/Dockerfile)
dockerfile
Copy
Edit
# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the frontend
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose the port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
Docker Compose (docker-compose.yml)
yaml
Copy
Edit
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend:/app
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongo:
    image: mongo
    container_name: mongo_container
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
README.md (Root)
markdown
Copy
Edit
# Cargo Shipment Tracker

## Overview
This is a MERN stack-based cargo shipment tracking application with real-time updates.

## Setup Instructions

### Prerequisites
- Docker & Docker Compose installed

### Run the Application
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/cargo-shipment-tracker.git
   cd cargo-shipment-tracker
   ```

3. The application should now be running:

    Backend API: http://localhost:5000
    Frontend UI: http://localhost:3000
