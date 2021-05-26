const PATH = require("path");
const FASTIFY = require("fastify");

// Require here all fastify's plugins for future 'registration'
const pluginFastifyCompress = require("fastify-compress");
const pluginFastifyStatic = require("fastify-static");
const pluginFastifyPrintRoutes = require("fastify-print-routes");

const LOGGER = require("./backend_libs/logging.js")();
const CONFIG = require("./config.js");

// Require routes from external file for later register AS PLUGIN!
const ROUTES = require("./backend_libs/routes.js");

// Get port number from env variable or config
const numPortToListenChoose =
  process.env.PORT || CONFIG.httpServer.portToListen;

// Get log level from env variable or config
const strLogLevelFastify =
  process.env.LOG_LEVEL_FASTIFY || CONFIG.logLevel.fastify;

const strLogLevel = process.env.LOG_LEVEL || CONFIG.logLevel.wespar;

// Print out error message and exit process
function CriticalTermination(strMessage) {
  process.stderr.write(strMessage);
  LOGGER.fatal(
    `at function ${CriticalTermination.caller.name}(), ${strMessage}`
  );
  process.exit(1);
}

// Graceful shutdown
function GracefulShutdown() {
  LOGGER.info(`Gracefully shutdown now.`);
  process.exit(0);
}

process.on("uncaughtException", (error) => {
  CriticalTermination(`[ERR] Uncaught exception: ${error}\n`);
});
process.on("unhandledRejection", (reason, p) => {
  CriticalTermination(`[ERR] Unhandled rejection: ${reason} ${p}\n`);
});
process.on("rejectionHandled", (p) => {
  CriticalTermination(`[ERR] Rejection handled: ${p}\n`);
});
// Usually promise should not resole more than once, but sometimes could
process.on("multipleResolves", (error) => {
  CriticalTermination(`[ERR] Promise resolving more times than once! ${error}`);
});

// Writing starting info into log
LOGGER.info(
  `Started NodeJS process with PID **${process.pid}**` +
    ` from user account **${process.env.USER}**` +
    ` at working directory **${process.cwd()}**` +
    ` on platform **${process.platform}**` +
    ` with ENVs: LOG_LEVEL= **${process.env.LOG_LEVEL}** and` +
    ` LOG_LEVEL_FASTIFY= **${process.env.LOG_LEVEL_FASTIFY}**` +
    ` PORT= **${process.env.PORT}**`
);

// Catch SIGTERM
process.on("SIGTERM", () => {
  LOGGER.info("Received SIGTERM.");
  GracefulShutdown();
});

// Catch CTRL+C
process.on("SIGINT", () => {
  LOGGER.info("Received SIGINT.");
  GracefulShutdown();
});

// Init web-server with options
const fastify = FASTIFY({
  // Simple use --> logger: true/false
  logger: {
    level: strLogLevelFastify,
    base: null,
    // timestamp: () =>
    //   `,"time":"${new Date(Date.now())
    //     .toISOString()
    //     .replace("Z", "")
    //     .replace("T", " ")}"`,
    // crlf: false,
    // prettyPrint: {
    //   suppressFlushSyncWarning: true,
    // },
  },
  // Limiting all incoming requests by total size of payload
  // If client request reaches limit - response would be --> HTTP 413 Payload Too Large
  bodyLimit: CONFIG.fastify.bodyLimit,
});

// It's important to register "fastify-compress" BEFORE "fastify-static"!
// https://github.com/fastify/fastify-compress/issues/164
fastify.register(pluginFastifyCompress, {
  // Do not compress files smaller than threshold
  threshold: 1024,
  // Compress all (no need to add manually compression for every route)
  global: true,
  // Only support gzip and deflate, and prefer gzip to deflate
  encodings: ["gzip", "deflate"],
});

// Plugin to easily serve many static files in directory (no need to write for each file his own route)
fastify.register(pluginFastifyStatic, {
  root: PATH.join(__dirname, CONFIG.fastify.staticFilesDirectory),
  // optional: default '/'
  prefix: "/",
});

// Simple plugin to print all available routes to console
if (strLogLevel !== "silent") {
  // show routes only if logging enabled
  fastify.register(pluginFastifyPrintRoutes);
}

// Including routes and all logic from external file
fastify.register(ROUTES);

// Start web-server
try {
  fastify.listen(numPortToListenChoose, CONFIG.httpServer.ipToListen);
  LOGGER.info(
    `**Fastify** HTTP-server listening at ${
      CONFIG.httpServer.ipToListen ? CONFIG.httpServer.ipToListen : "localhost"
    }:${numPortToListenChoose}`
  );
} catch (error) {
  CriticalTermination(`[ERR] Could not start web-server! --> ${error}`);
}
