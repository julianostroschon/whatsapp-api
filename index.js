// require('dotenv').config();

const { buildServer } = require('./src/server');

const PORT = process.env.PORT || 3001;

(async () => {
  const server = await buildServer();

  server.listen(PORT);
})();
