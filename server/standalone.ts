import "dotenv/config";
import { createApp } from "./app";
import { validateStandaloneOriginConfiguration } from "./deploymentConfig";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

validateStandaloneOriginConfiguration();

const app = createApp();
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`India Culture Explorer API listening on port ${port}`);
});

function shutDown(signal: string) {
  console.log(`Received ${signal}; stopping API server.`);
  server.close((error) => {
    if (error) {
      console.error("API server shutdown failed", error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutDown("SIGINT"));
process.once("SIGTERM", () => shutDown("SIGTERM"));
