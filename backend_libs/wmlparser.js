const funcPreCheckReplay = require("./1_parser_meta.js");
const funcReplayGetGameSettings = require("./2_parser_settings.js");
const funcReplayGetSidesInfo = require("./3_parser_sides.js");
const funcReplayGetChat = require("./4_parser_chat.js");

const LOGGER = require("./logging.js")();

/*
Input: replay as big <string>
Output: result as <object>
*/
module.exports = (strReplayAsString) => {
  const objResultForReplay = {
    errorWhileParsing: null,
    meta: null,
    gameSettings: null,
    sides: null,
    chat: null,
  };

  // First stage: pre-check replay and gathering meta-info
  const objResultOfPreCheck = funcPreCheckReplay(strReplayAsString);
  if (objResultOfPreCheck.error) {
    // console.log("Not proceed parsing", objResultOfPreCheck.error);
    const strErrorMessage = `[ERR] Not proceed parsing: ${objResultOfPreCheck.error}`;
    LOGGER.error(strErrorMessage);
    objResultForReplay.errorWhileParsing = strErrorMessage;
    return objResultForReplay;
  }
  objResultForReplay.meta = objResultOfPreCheck.result;

  // Second stage: gather game settings info
  const objResultGameSettings = funcReplayGetGameSettings(strReplayAsString);
  objResultForReplay.gameSettings = objResultGameSettings.result;

  // Third stage: gather sides info
  const objResultSidesInfo = funcReplayGetSidesInfo(
    strReplayAsString,
    objResultOfPreCheck.result.isReplay
  );
  objResultForReplay.sides = objResultSidesInfo.result.sides;

  // Fourth stage: parse chat log
  const objResultChat = funcReplayGetChat(strReplayAsString);
  objResultForReplay.chat = objResultChat.result;

  LOGGER.debug("It seems replay was successfully parsed.");

  return objResultForReplay;
};

// // MOCK
// const strMockForReplay = require("./mock");
// const objResult = funcWMLParser(strMockForReplay);
// console.log("objResult:\n", JSON.stringify(objResult, null, 2));
