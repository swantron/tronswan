# tronswan on Cloud Run: build the React site, then run the Express server that
# serves it (plus the read-only API proxies) as a non-root user.

FROM node:24-slim AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# Vite bakes VITE_* into the client bundle, so they're build-time values. They're
# public by nature (they ship to every browser); real secrets are runtime-only.
ARG VITE_WEATHER_API_KEY
ARG VITE_WEATHER_CITY=Bozeman
ARG VITE_WEATHER_UNITS=imperial
ARG VITE_SITE_URL=https://tronswan.com
ARG VITE_GOOGLE_DOCS_API_KEY
ARG VITE_SPOTIFY_CLIENT_ID
ARG VITE_SPOTIFY_REDIRECT_URI=https://tronswan.com/music/callback
ARG VITE_SWANTRON_API_URL=https://swantron.com
RUN yarn build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY server.js ./
COPY --from=build /app/build ./build
USER node
EXPOSE 8080
# node directly (not npm/yarn) so Cloud Run's SIGTERM reaches the server.
CMD ["node", "--import", "@swantron/otel-bootstrap/register", "server.js"]
