FROM node:8
ENV NPM_CONFIG_LOGLEVEL warn

# Set up working directory
# RUN mkdir /app Node should contain this directory

WORKDIR /app

# Copy all local files into the image.
COPY package.json /app/package.json
RUN npm install
COPY . /app

# Tell Docker about the port we'll run on.
EXPOSE 80

# Entrypoint
CMD ["npm", "start"]
