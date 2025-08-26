# ---- deps stage ----
FROM node:20-alpine AS deps
WORKDIR /app
 
ARG NPM_TOKEN
ARG IGNORE_NPM_SCRIPTS=1   # default: skip scripts
ENV NPM_TOKEN=$NPM_TOKEN
 
# GitHub Packages auth (no -x so token isn't echoed)
RUN set -e; \
    npm config set @blaze-case-ai:registry https://npm.pkg.github.com; \
    npm config set //npm.pkg.github.com/:_authToken "$NPM_TOKEN"
 
# Bring in the full app (so lockfile/scripts can be found if needed)
COPY . .
 
# Install PRODUCTION deps at build time
# If IGNORE_NPM_SCRIPTS=1 we add --ignore-scripts
RUN if [ "$IGNORE_NPM_SCRIPTS" = "1" ]; then \
      npm install --omit=dev --ignore-scripts; \
    else \
      npm install --omit=dev; \
    fi
 
# Optional: build step if your app has one (does nothing if missing)
RUN npm run build || true
 
# Scrub token from config
RUN npm config delete //npm.pkg.github.com/:_authToken || true; \
    npm config delete @blaze-case-ai:registry || true
 
# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app ./
 
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node","server.js"]
