# =========================================
# Quasar development image
# =========================================
ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION}

ENV NODE_ENV=development

WORKDIR /app

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --ignore-scripts; else npm install --ignore-scripts; fi

COPY . .

RUN npx quasar prepare

RUN chown -R node:node /app

USER node

EXPOSE 9020

CMD ["npx", "quasar", "dev", "-H", "0.0.0.0", "-p", "9020"]
