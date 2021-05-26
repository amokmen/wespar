const PINO = require("pino");
const CONFIG = require("../config.js");

const strLogLevel = process.env.LOG_LEVEL || CONFIG.logLevel.wespar;

module.exports = () => {
  // https://getpino.io/#/docs/api?id=options
  const objOptionsForPino = {
    level: strLogLevel,
    // // would be --> "time":"2021-03-25 10:52:57.819"
    // timestamp: () =>
    //   `,"time":"${new Date(Date.now())
    //     .toISOString()
    //     .replace("Z", "")
    //     .replace("T", " ")}"`,
    // use LF
    crlf: false,
    // // don't add to every log line --> "pid":15000,"hostname":"amk"
    // base: null,

    // // to work there must be installed --> npm install pino-pretty
    // // result --> [2021-03-25T11:00:47.033Z] INFO: [OK] All is good.
    // prettyPrint: true,

    // // The default prettifier write stream does not guarantee final log writes.
    // // Correspondingly, a warning is written to logs on first synchronous flushing.
    // // WARN: pino.final with prettyPrint does not support flushing
    // prettyPrint: {
    //   suppressFlushSyncWarning: true,
    // },
  };

  // // It's important for saving into file
  // PINO.destination({ sync: true });

  const logger = PINO(objOptionsForPino);

  return logger;
};
