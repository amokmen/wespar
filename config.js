module.exports = {
  httpServer: {
    portToListen: 30000,
    ipToListen: "0.0.0.0",
  },
  apiEndpoints: {
    urlFileForParsing: "/url",
  },
  // Client request JSON object key name (for validating at backend with JSON Schema)
  requestKeyName: "urlFileForParsing",
  // There are two variants: "http://replay.wesnoth.org" and "https://replays.wesnoth.org"
  allowedHosts: ["replays.wesnoth.org", "replay.wesnoth.org"],
  fastify: {
    staticFilesDirectory: "frontend_static_files",
    // According RFC max size of URL is 2000 symbols, so let's limit payload at 2000*1B+100B=2100 B
    // Bytes
    bodyLimit: 2100,
  },
  // pino levels: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
  logLevel: { fastify: "warn", wespar: "info" },
};
