FROM node:7.8.0-alpine

WORKDIR /srv/youtube

COPY package*.json ./

RUN npm install --only=production

COPY . /srv/youtube

RUN apk add --update py-pip ca-certificates ffmpeg \
    && rm -rf /var/cache/apk/* \
    && pip install youtube-dl

EXPOSE 6060
CMD [ "node", "." ]