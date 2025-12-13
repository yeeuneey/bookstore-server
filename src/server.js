// src/server.js
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  logger.info("server_started", { port: PORT });
});
