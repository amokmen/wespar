const objStringFunctions = require("./string_functions.js");

// ======================= START Constants Declaration ========================

const strEOL = "\n";

const arrPrefixesSpeakBlock = ["id", "message", "side", "time", "to_sides"];

// By using var numTurnNumber I no need to search start of turn
// const strStartTurn = "[init_side]";
// So, only need to search end of turn
const strEndTurn = "[end_turn]";

const strStartSpeak = "[speak]";
const strEndSpeak = "[/speak]";

const arrReplayBlockBoundaries = ["[replay]", "[/replay]"];

// ======================= END Constants Declaration ==========================

function ParsingSpeakBlock(
  strSpeakBlock,
  numCurrentTurn,
  boolIsFirstSideNowPlaying
) {
  let objResult = {};

  objResult = objStringFunctions.SearchPrefixesInEachLine(
    strSpeakBlock,
    arrPrefixesSpeakBlock
  );

  // Adding from me for object:
  // current turn number, and current side number which is playing now
  objResult.numCurrentTurn = numCurrentTurn;
  objResult.boolIsFirstSideNowPlaying = boolIsFirstSideNowPlaying;

  return objResult;
}

/*
Input: <string> (replay as a big string)
Output: <object>
*/
module.exports = (strReplayAsString) => {
  const objResult = {
    error: null,
    result: null,
  };

  // Parsing chat

  // Resulting array of [speak] blocks
  const arrGlobalAllSpeakObjHere = [];

  // There is another [replay] tag at start of WML, but I don't need it
  // So, get position of FIRST FROM END [replay] and position of FIRST FROM END [/replay]
  const numPositionReplayTag = strReplayAsString.lastIndexOf(
    arrReplayBlockBoundaries[0]
  );

  const numPositionReplayEndTag = strReplayAsString.lastIndexOf(
    arrReplayBlockBoundaries[1]
  );

  // Could not use here my CutStringByBoundaries()
  const strCutForPerformance = strReplayAsString.substring(
    numPositionReplayTag,
    numPositionReplayEndTag
  );

  const arrSplittedByEOL = strCutForPerformance.split(strEOL);

  let numTurnNumber = 1;

  // This variable is for checking which side is now playing (side1 or side2)
  // First turn starting - first side
  let boolIsFirstSideNowPlaying = true;

  // Store here position of current [speak] block start
  let numStorePositionOfStartSpeakBlockLineInArray = -1;

  arrSplittedByEOL.forEach((strLine, numElementIndex) => {
    // Checking EACH line and searching what we need (later would be IFs)
    const boolIsExistEndTurn = strLine.includes(strEndTurn);
    const boolIsExistStartOfSpeakBlock = strLine.includes(strStartSpeak);
    const boolIsExistEndOfSpeakBlock = strLine.includes(strEndSpeak);

    if (boolIsExistStartOfSpeakBlock) {
      // Found start of current [speak] block, save this position for later use,
      // when we would found end of block - [/speak]
      numStorePositionOfStartSpeakBlockLineInArray = numElementIndex;
    }

    if (boolIsExistEndOfSpeakBlock) {
      // Found end of current [speak] block, need to work with all lines between start and end

      // Cut big array to small one - consist only of lines inside current [speak] block
      const arrSpeakBlockContent = arrSplittedByEOL.slice(
        numStorePositionOfStartSpeakBlockLineInArray + 1,
        numElementIndex
      );

      // Working with small array

      // Before sending to function ParsingSpeakBlock(), which later would invoke function SearchPrefixesInEachLine()
      // I must to make 1 string from elements of array - because SearchPrefixesInEachLine expect string, not an array
      const strJoinedByEOL = arrSpeakBlockContent.join(strEOL);

      const objSomeResult = ParsingSpeakBlock(
        strJoinedByEOL,
        numTurnNumber,
        boolIsFirstSideNowPlaying
      );

      arrGlobalAllSpeakObjHere.push(objSomeResult);
    }

    if (boolIsExistEndTurn) {
      if (boolIsFirstSideNowPlaying) {
        // Invert bool to switch to side2
        boolIsFirstSideNowPlaying = false;
      } else {
        // Invert bool to switch to side1
        boolIsFirstSideNowPlaying = true;

        // Important! This is the exact place where we need to increment turn number!
        numTurnNumber += 1;
      }
    }
  });

  objResult.result = arrGlobalAllSpeakObjHere;

  return objResult;
};
