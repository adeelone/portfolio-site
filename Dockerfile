FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node server.js render.js index.html styles.css polish.css client.js snake.js play.js favicon.svg llms.txt ./
COPY --chown=node:node data/profile.json data/projects.json ./data/
COPY --chown=node:node assets/ ./assets/
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
