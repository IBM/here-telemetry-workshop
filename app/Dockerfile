FROM node:14.7.0-alpine

# Create a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN apk --no-cache add \
      ca-certificates \
      openssl-dev 

# Create app directory
RUN mkdir -p /usr/local/app

# Move to the app directory
WORKDIR /usr/local/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN chown -R appuser:appgroup Script

# Tell docker that all future commands should run as the appuser user
USER appuser


EXPOSE 3000

CMD [ "node", "app.js" ]