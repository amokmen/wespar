// https://github.com/sindresorhus/got#api
const GOT = require("got");
const BZIP2 = require("bzip2");
const LOGGER = require("./logging.js")();
const CONFIG = require("../config.js");

// Decompressing function
// Return object {error: null, strResult: string}
function DecompressingBZIP2Sync(bufferCompressedContent) {
  const objFunctionResult = {
    error: null,
    strResult: null,
  };

  try {
    // For decompression function of npm package "bzip2" need to convert 'buffer' to 'Uint8Array'
    const bytes = new Uint8Array(bufferCompressedContent);

    // Decompression
    const uint8array = BZIP2.simple(BZIP2.array(bytes));

    // Converting 'Uint8Array' to normal text
    // default 'utf-8' or 'utf8'
    const utf8decoder = new TextDecoder();

    // https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
    objFunctionResult.strResult = utf8decoder.decode(uint8array);
  } catch (error) {
    const strErrorMessage = `[ERR] Decompression problem --> ${error}`;
    LOGGER.error(strErrorMessage);
    objFunctionResult.error = strErrorMessage;
  }

  LOGGER.debug("It seems replay was successfully decompressed.");
  return objFunctionResult;
}

// Return object {error: null, result: object}
async function GetFileContent(strURL) {
  const objFunctionResult = {
    error: null,
    result: {
      responseHost: null,
      responsePath: null,
      responseStatusCode: null,
      responseContentLength: null,
      responseMime: null,
      responseLastModified: null,
      responseFileContent: null,
    },
  };

  // GET HTTP-request for file
  try {
    const objFileResponse = await GOT(strURL, {
      method: "GET",
      followRedirect: false,
    });
    // If try-catch was good, going on
    LOGGER.debug(
      `Got file with HTTP <${objFileResponse.statusCode}> and ` +
        `content-length <${objFileResponse.headers["content-length"]}> bytes.`
    );

    // Check if host is allowed one
    const boolIsHostInAllowedHostsList = CONFIG.allowedHosts.includes(
      objFileResponse.req.host
    );

    if (objFileResponse.req.host && !boolIsHostInAllowedHostsList) {
      // Host is not Wesnoth replay server, stop
      const strErrorMessage =
        `Host <${objFileResponse.req.host}> is NOT allowed! ` +
        `(only this hosts are allowed: <${CONFIG.allowedHosts}>).`;
      LOGGER.error(strErrorMessage);
      objFunctionResult.error = strErrorMessage;
      return objFunctionResult;
    }

    // Check if key "content-type" is exist and it's value is equal "application/x-bzip2", if not - stop
    if (
      "content-type" in objFileResponse.headers &&
      objFileResponse.headers["content-type"] !== "application/x-bzip2"
    ) {
      const strErrorMessage =
        `Header <content-type> is NOT <application/x-bzip2>! ` +
        `--> ${objFileResponse.headers["content-type"]}`;
      LOGGER.error(strErrorMessage);
      objFunctionResult.error = strErrorMessage;
      return objFunctionResult;
    }

    // TODO: before assignment there are should be checking for existence of object keys?

    // 'replay.wesnoth.org'
    objFunctionResult.result.responseHost = objFileResponse.req.host;

    // '/1.14/2021/03/22/2p__Weldyn_Channel_Turn_14_(155976).bz2'
    objFunctionResult.result.responsePath = objFileResponse.req.path;

    // 200
    objFunctionResult.result.responseStatusCode = objFileResponse.statusCode;

    // 14029 (bytes)
    objFunctionResult.result.responseContentLength =
      objFileResponse.headers["content-length"];

    // 'application/x-bzip2'
    objFunctionResult.result.responseMime =
      objFileResponse.headers["content-type"];

    // 'Mon, 22 Mar 2021 23:50:50 GMT'
    objFunctionResult.result.responseLastModified =
      objFileResponse.headers["last-modified"];

    // Inside objFileResponse.rawBody --> Buffer - file content
    objFunctionResult.result.responseFileContent = objFileResponse.rawBody;
  } catch (error) {
    const strErrorMessage = `[ERR] While trying GOT(URL): ${error.message}`;
    LOGGER.error(strErrorMessage);
    objFunctionResult.error = strErrorMessage;
  }

  LOGGER.debug("It seems replay was successfully downloaded.");

  // Log object with all keys except key "responseFileContent" (buffer, too long and useless to log)
  const { responseFileContent, ...objForLogging } = objFunctionResult.result;
  LOGGER.trace(JSON.stringify(objForLogging));

  return objFunctionResult;
}

module.exports = { GetFileContent, DecompressingBZIP2Sync };
