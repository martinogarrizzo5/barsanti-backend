FROM node:18-alpine

# Set the working directory inside the container  
WORKDIR /app  

# Copy package.json and package-lock.json to the container  
COPY package*.json ./  

# Install dependencies  
RUN npm ci  

# Copy the app source code to the container  
COPY . .  

# Build the Next.js app  
RUN npm run prisma-generate
RUN npm run build  

# Expose the port the app will run on  
EXPOSE 3000  

ENV NODE_ENV "production"

# Start the app  
CMD ["npm", "start"] 