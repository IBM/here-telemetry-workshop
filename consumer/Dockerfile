FROM node:14.7.0-alpine

# Create a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

# Create app directory
RUN mkdir -p /usr/local/app

# Move to the app directory
WORKDIR /usr/local/app

COPY package.json package-lock.json ./

RUN npm install

# Tell docker that all future commands should run as the appuser user
USER appuser

COPY consumer.js ./

CMD [ "node", "consumer.js" ]