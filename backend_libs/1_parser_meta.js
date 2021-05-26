const objStringFunctions = require("./string_functions.js");

// ======================= START Constants Declaration =================

// Second boundary to which would cut big string of replay from start
const strFirstTagFromReplayStart = "[replay]";

// Constants for First block
const arrPrefixesToFind = ["campaign_type", "version"];
const strValueOfCampaignTypeMultiplayer = "multiplayer";

// Constants for Second block
const strTagSnapshot = "[snapshot]";

// Constants for Third block
const strKeyMpGameTitle = "mp_game_title";

// ======================= END Constants Declaration ===================

/*
Input: <string> (replay as a big string)
Output: <object>
*/
module.exports = (strReplayAsString) => {
  const objResult = {
    error: null,
    result: {
      isReplay: null,
      isServerReplay: null,
      version: null,
    },
  };

  // ===================== START First block ==========================
  // Pre-check if replay is <multiplayer> and get Wesnoth version

  // Cut replay string from beginning for faster searching later
  const numPositionOfFirstTagFromReplayStart = strReplayAsString.indexOf(
    strFirstTagFromReplayStart
  );

  // I need only begin of file - all metadata are only here
  const strBeginningOfReplay = strReplayAsString.substring(
    0,
    numPositionOfFirstTagFromReplayStart
  );

  // campaign_type="multiplayer" and version is here --> version=1.14.9
  const objResultOfFindingKeys = objStringFunctions.SearchPrefixesInEachLine(
    strBeginningOfReplay,
    arrPrefixesToFind
  );

  // Checking if a keys exists in a JavaScript object
  // It's possibly that key "version" or key "campaign_type" would not be found in WML

  // Checking that key "campaign_type" exists
  if (arrPrefixesToFind[0] in objResultOfFindingKeys) {
    // Key exists, working
    const strValueOfCampaignType = objResultOfFindingKeys[arrPrefixesToFind[0]];

    if (strValueOfCampaignType !== strValueOfCampaignTypeMultiplayer) {
      objResult.error = "It's not a multiplayer replay. Would skip parsing.";
      return objResult;
    }
  } else {
    objResult.error =
      `It's not <valid> replay or not replay at all ` +
      `(could not find key ${arrPrefixesToFind[0]}). ` +
      `Would skip parsing.`;
    return objResult;
  }

  // Checking that key "version" exists
  if (arrPrefixesToFind[1] in objResultOfFindingKeys) {
    // Key exists, assigning to resulting object
    objResult.result.version = objResultOfFindingKeys[arrPrefixesToFind[1]];
  }
  // ======================= END First block ================================

  // ======================= START Second block =============================
  // Check if this is replay or savegame

  // Only savegame have tag "[snapshot]"
  if (strReplayAsString.includes(strTagSnapshot)) {
    // console.log("It's a savegame.");
    objResult.result.isReplay = false;
  } else {
    // console.log("It's a replay.");
    objResult.result.isReplay = true;
  }
  // ======================= END Second block =============================

  // ======================= START Third block =============================
  // Check if replay is server-side recorded

  // only server-side recorded replay have (at the beginning) key "mp_game_title"
  if (strBeginningOfReplay.includes(strKeyMpGameTitle)) {
    // console.log("It's a server-side recorded replay.");
    objResult.result.isServerReplay = true;
  } else {
    // console.log("It's a client recorded replay.");
    objResult.result.isServerReplay = false;
  }
  // ======================= END Third block =============================

  return objResult;
};
