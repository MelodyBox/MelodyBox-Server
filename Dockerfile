### Build Stage
FROM node as base
WORKDIR /app_build
### Build Stage
FROM node as base
# Set working directory in container
WORKDIR /app_build
# Install all dependencies
COPY package*.json ./
RUN npm install --ignore-scripts
# Build the app
COPY . .
RUN npm run build

### Production Stage
FROM node
# Copy built files from build stage
WORKDIR /app
COPY --from=base /app_build/dist ./dist
# Install python and pip
RUN apt update && apt install -y \
    python3 \
    python3-dev \
    make \
    g++
RUN wget https://bootstrap.pypa.io/get-pip.py 
RUN python3 get-pip.py
RUN npm install -g node-gyp
# Set Env Vars
ENV NODE_ENV=production
ENV GENIUS_SECRET=$GENIUS_SECRET
# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev
# Expose Server Port
EXPOSE 5173
# Start server
CMD ["npm", "run", "start"]