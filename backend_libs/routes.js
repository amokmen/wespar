const LOGGER = require("./logging.js")();
const CONFIG = require("../config.js");
const REPLAY = require("./replay.js");
const WMLPARSER = require("./wmlparser.js");

// Function for exporting
module.exports = async (fastify) => {
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // START of creating API routes
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  fastify.get("/", async (_request, reply) => {
    // 'sendFile' is from 'fastify-static' plugin
    await reply.sendFile("index.html");
  });

  // Create obj to validate incoming request from client
  const objRequestBodyJsonSchema = {
    schema: {
      body: {
        type: "object",
        properties: {
          [CONFIG.requestKeyName]: { type: "string" },
        },
        required: [`${CONFIG.requestKeyName}`],
      },
    },
  };

  // Main API endpoint (here client would send URL)
  fastify.post(
    CONFIG.apiEndpoints.urlFileForParsing,
    objRequestBodyJsonSchema,
    async (request) => {
      LOGGER.debug(
        `API JSON Schema validating object: ${JSON.stringify(
          objRequestBodyJsonSchema
        )}`
      );
      // This object would be returned to client as response
      const objResponseToClient = {
        errorInRequest: null,
        answer: null,
      };

      const strURLFromClientRequest = request.body[CONFIG.requestKeyName];

      // For logging with wespar if fastify logging turned off
      const objInfoAboutAPICaller = {
        reqId: request.id,
        ip: request.ip,
        // userAgent: request.headers["user-agent"],
        headers: request.headers,
        url: strURLFromClientRequest,
        method: request.method,
      };
      // pino auto adds escape for all double quotes, inside "msg": "\"_here_\"" - could not do anything this it :(
      LOGGER.info(`API call --> ${JSON.stringify(objInfoAboutAPICaller)}`);

      // Check if URL is empty
      if (strURLFromClientRequest === "") {
        const strErrorMessage =
          "[ERR] No link to replay provided (empty field)!";
        LOGGER.error(strErrorMessage);
        objResponseToClient.errorInRequest = strErrorMessage;
        return objResponseToClient;
      }

      // URL is not empty, trying to get file
      const objResultOfFileRequesting = await REPLAY.GetFileContent(
        strURLFromClientRequest
      );

      // Check if there was an error while executing function GetFileContent()
      const strErrorMessage = objResultOfFileRequesting.error;
      if (strErrorMessage !== null) {
        LOGGER.error(strErrorMessage);

        // I assume that if something went wrong while getting file - it's client's error (invalid URL for example)
        // but also here would be non client error - for example if replay server would not respond
        objResponseToClient.errorInRequest = strErrorMessage;

        return objResponseToClient;
      }

      const objDecompressed = REPLAY.DecompressingBZIP2Sync(
        objResultOfFileRequesting.result.responseFileContent
      );

      // Checking if there was error while decompression
      const strErrorMessage2 = objDecompressed.error;
      if (strErrorMessage2 !== null) {
        // Was error
        objResponseToClient.errorInRequest = strErrorMessage2;
        return objResponseToClient;
      }

      const strDecompressedText = objDecompressed.strResult;

      const objResultForReplay = WMLPARSER(strDecompressedText);

      // No need to stringify JSON - fastify would do it for me before sending
      objResponseToClient.answer = objResultForReplay;

      // Send to client modified time also
      // 'Mon, 22 Mar 2021 23:50:50 GMT'
      // Convert to Unix time first (ms)
      const numMtimeUnix = new Date(
        objResultOfFileRequesting.result.responseLastModified
      ).getTime();

      objResponseToClient.answer.mTime = numMtimeUnix;

      LOGGER.trace(JSON.stringify(objResponseToClient.answer));

      return objResponseToClient;
    }
  );

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // END of creating API routes
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
};
