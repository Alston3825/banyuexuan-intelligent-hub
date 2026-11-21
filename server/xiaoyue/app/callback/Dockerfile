FROM node:22-bookworm-slim
WORKDIR /app
COPY --chown=node:node --chmod=0444 server.js ./server.js
ENV NODE_ENV=production
ENV PORT=3000
USER node
EXPOSE 3000
CMD ["node", "server.js"]
