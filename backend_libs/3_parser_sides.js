const objStringFunctions = require("./string_functions.js");

// declare here to use it later in IF in third stage
// (it would be filled, if IF worked in second stage)
let strCarryOverSidesBlock = "";

// ======================= START Constants Declaration ========================

const strEOL = "\n";

// Constants for First block
const arrBoundariesOfScenarioBlock = ["[scenario]", "[/scenario]"];
const arrBoundariesOfSideBlock = ["[side]", "[/side]"];

// Needed tags from [side]...[/side]
const arrPrefixesForSideBlock = [
  "color",
  "faction",
  "is_host",
  "player_id",
  "side",
  "type",
];

// Constants for Second block
const arrBoundariesOfCarryOverSidesBlock = [
  "[carryover_sides_start]",
  "[/carryover_sides_start]",
];

const arrPrefixes2ForSideBlock = ["current_player"];

const arrPrefixesForUnitBlock = ["type"];

// Constants for Third block
const BoundariesOfOldSide1Block = ["[old_side1]", "[/old_side1]"];
const BoundariesOfOldSide2Block = ["[old_side2]", "[/old_side2]"];

const strAITagAsBoundary = "[ai]";

const arrPrefixesForOldSideBlock = ["color", "current_player"];

// Constants for First block for SaveGame
const arrBoundariesOfSnapshotBlock = ["[snapshot]", "[/snapshot]"];

// ======================= END Constants Declaration ==========================

/*
For reducing same code: function to work with [side] tag

Input: main resulting <object> and <string> where all [side] blocks inside
Output: changed <object>
*/
function WorkWithSideTag(objResult, strAllSidesBlock) {
  // Now in cycle we need to work with every found side

  // How many sides we have?
  // const numSidesCounter = strAllSidesBlock.split("[side]").length - 1;

  // HARDCODE: 2 sides
  for (let index = 0; index < 2; index += 1) {
    // Find first [side] and FIRST [/side] --> could not use my function CutStringByBoundaries here!
    // Could not use first [side] and last [/side] also - there could be more than 2 sides!
    const numPositionOfSide = strAllSidesBlock.indexOf(
      arrBoundariesOfSideBlock[0]
    );
    const numPositionOfSideClosed = strAllSidesBlock.indexOf(
      arrBoundariesOfSideBlock[1]
    );

    const strCurrentSideBlock = strAllSidesBlock.substring(
      numPositionOfSide,
      numPositionOfSideClosed + arrBoundariesOfSideBlock[1].length
    );

    // Get from current side block all needed info
    const objCurrentParsed = objStringFunctions.SearchPrefixesInEachLine(
      strCurrentSideBlock,
      arrPrefixesForSideBlock
    );

    // Write parsed result to upper object
    objResult.result.sides.push(objCurrentParsed);

    // Remove current side from scope
    // eslint-disable-next-line no-param-reassign
    strAllSidesBlock = strAllSidesBlock.slice(
      numPositionOfSideClosed + arrBoundariesOfSideBlock[1].length
    );
  }
}

/*
Special function to work with [side] - differs from WorkWithSideTag()

Input: main resulting <object> and <string> where all [side] blocks inside
Output: changed <object>
*/
function WorkWithSideTagSpecial(objResult, strBlock) {
  // Get how many sides we have
  // const numSidesCounter = strBlock.split("[side]").length - 1;

  // HARDCODE: 2 sides
  // working with each [side]...[/side]
  for (let index = 0; index < 2; index += 1) {
    // find first [side] and FIRST [/side] --> could not use my function CutStringByBoundaries here!
    const numPositionOfSide = strBlock.indexOf(arrBoundariesOfSideBlock[0]);
    const numPositionOfSideClosed = strBlock.indexOf(
      arrBoundariesOfSideBlock[1]
    );

    const strCurrentSideBlock = strBlock.substring(
      numPositionOfSide,
      numPositionOfSideClosed + arrBoundariesOfSideBlock[1].length
    );

    // Get from current side block "current_player" -- it's nickname of this leader's player
    const objResultCurrentPlayer = objStringFunctions.SearchPrefixesInEachLine(
      strCurrentSideBlock,
      arrPrefixes2ForSideBlock
    );

    // Get from current side block only FIRST "type" -- it's leader
    const numPositionOfFirstTypeKey = strCurrentSideBlock.indexOf(
      arrPrefixesForUnitBlock[0]
    );
    const numPositionOfFirstEOLAfterTypeKey = strCurrentSideBlock.indexOf(
      strEOL,
      numPositionOfFirstTypeKey
    );
    const strReducedToCurrentType = strCurrentSideBlock.substring(
      numPositionOfFirstTypeKey,
      numPositionOfFirstEOLAfterTypeKey
    );

    const objResultCurrentType = objStringFunctions.SearchPrefixesInEachLine(
      strReducedToCurrentType,
      arrPrefixesForUnitBlock
    );

    // OVERWRITE leader, but before must check nicknames, or would be wrong!
    // HARDCODE: keys "current_player" and "current_player" and "type"
    if (
      objResultCurrentPlayer.current_player ===
      objResult.result.sides[0].player_id
    ) {
      // Overwrite
      // eslint-disable-next-line no-param-reassign
      objResult.result.sides[0].type = objResultCurrentType.type;
    } else {
      // Overwrite
      // eslint-disable-next-line no-param-reassign
      objResult.result.sides[1].type = objResultCurrentType.type;
    }
    // Cut strBlock - remove current side from string, for searching only next one
    // eslint-disable-next-line no-param-reassign
    strBlock = strBlock.slice(
      numPositionOfSideClosed + arrBoundariesOfSideBlock[1].length
    );
  }
}

/*
Input: <string> (replay as a big string), <boolean> (isReplay - Replay or SaveGame)
Output: <object>
*/
module.exports = (strReplayAsString, boolIsReplay) => {
  const objResult = {
    error: null,
    result: {
      // Need array here not 'null' for later push()
      sides: [],
    },
  };

  // There is difference in places where of needed search info for replay and savegame
  if (boolIsReplay) {
    // It's a replay

    // ===================== START First block ==========================
    // get sides (players) info

    /*
    Working with top-level tag "[scenario]...[/scenario]".
    Inside it searching tags "[side]...[/side]" and parsing each.
    */

    // Cut replay to "[scenario]...[/scenario]"
    const strScenarioBlock = objStringFunctions.CutStringByBoundaries(
      strReplayAsString,
      arrBoundariesOfScenarioBlock[0],
      arrBoundariesOfScenarioBlock[1]
    );

    const boolIsExistsSideTag = strScenarioBlock.includes(
      arrBoundariesOfSideBlock[0]
    );

    if (boolIsExistsSideTag) {
      // Found at least 1 "[side]"

      // Get all inside FIRST [side] and LAST [/side]
      const strAllSidesBlock = objStringFunctions.CutStringByBoundaries(
        strScenarioBlock,
        arrBoundariesOfSideBlock[0],
        arrBoundariesOfSideBlock[1]
      );

      // Invoke function for working with [side] tag
      WorkWithSideTag(objResult, strAllSidesBlock);
    } else {
      // Not found any "[side]"
      // Rewrite [] as null for later easy check/use
      objResult.result.sides = null;
    }
    // ======================= END First block ================================

    // ======================= START Second block =============================
    // Overwrite leaders if there is [carryover_sides_start] tag

    // Check if there is in replay [carryover_sides_start] tag
    const boolIsExistsCarryOverSidesStartTag = strReplayAsString.includes(
      arrBoundariesOfCarryOverSidesBlock[0]
    );

    if (boolIsExistsCarryOverSidesStartTag) {
      // If we found [carryover_sides_start] tag, we need to find leader inside it AND
      // overwrite leader taken previously from [scenario] -> [side]

      // Cut for performance
      strCarryOverSidesBlock = objStringFunctions.CutStringByBoundaries(
        strReplayAsString,
        arrBoundariesOfCarryOverSidesBlock[0],
        arrBoundariesOfCarryOverSidesBlock[1]
      );

      // Now do second checking: if there is [side] tag inside [carryover_sides_start]
      // Because here is possibility that [carryover_sides_start] would exist, but almost empty!
      const boolIsExistsSideTag2 = strCarryOverSidesBlock.includes(
        arrBoundariesOfSideBlock[0]
      );
      if (!boolIsExistsSideTag2) {
        // Now we are exit from function,
        // so there would not be stages 2 and 3 and
        // would not be overwrite <leader> and <color> with 'undefined' value
        return objResult;
      }

      // Invoke function to work with [side] inside [carryover_sides_start]
      WorkWithSideTagSpecial(objResult, strCarryOverSidesBlock);
    }
    // ======================= END Second block =============================

    // ======================= START Third block =============================
    // Overwrite color if there is [carryover_sides_start] tag
    if (boolIsExistsCarryOverSidesStartTag) {
      // If we found [carryover_sides_start] tag, we need to find new colors inside it AND
      // overwrite taken previously from [scenario] - [side]

      // Cut for performance
      let strOldSide1Block = objStringFunctions.CutStringByBoundaries(
        strCarryOverSidesBlock,
        BoundariesOfOldSide1Block[0],
        BoundariesOfOldSide1Block[1]
      );

      let strOldSide2Block = objStringFunctions.CutStringByBoundaries(
        strCarryOverSidesBlock,
        BoundariesOfOldSide2Block[0],
        BoundariesOfOldSide2Block[1]
      );

      // Find in each [old_side1]...[/old_side1] and [old_side2]...[/old_side2]:

      // Another pre-cut
      strOldSide1Block = objStringFunctions.CutStringByBoundaries(
        strOldSide1Block,
        BoundariesOfOldSide1Block[0],
        strAITagAsBoundary
      );

      strOldSide2Block = objStringFunctions.CutStringByBoundaries(
        strOldSide2Block,
        BoundariesOfOldSide2Block[0],
        strAITagAsBoundary
      );

      // Parse
      const objOldSide1Result = objStringFunctions.SearchPrefixesInEachLine(
        strOldSide1Block,
        arrPrefixesForOldSideBlock
      );

      const objOldSide2Result = objStringFunctions.SearchPrefixesInEachLine(
        strOldSide2Block,
        arrPrefixesForOldSideBlock
      );

      // Overwrite color if previous nick and nick from old_side are equal
      // HARDCODE: keys "current_player" and "current_player" and "color"
      if (
        objOldSide1Result.current_player === objResult.result.sides[0].player_id
      ) {
        // Overwrite color from old_side
        // Why this shit is working?! Player color CHANGING only if there were shuffle sides!
        objResult.result.sides[0].color = objOldSide1Result.color;
        objResult.result.sides[1].color = objOldSide2Result.color;
      } else {
        // overwrite color, but in changed order
        objResult.result.sides[0].color = objOldSide2Result.color;
        objResult.result.sides[1].color = objOldSide1Result.color;
      }
    }
    // ======================= END Third block =============================
  } else {
    // It's a savegame

    /*
    For savegame instead of using info from scenario/side + overwrite from carryover_sides_start/side
    and carryover_sides_start/side/unit I would use only info from snapshot/side и snapshot/side/unit
    */

    // ===================== START SaveGame First block =====================
    const strSnapshotBlock = objStringFunctions.CutStringByBoundaries(
      strReplayAsString,
      arrBoundariesOfSnapshotBlock[0],
      arrBoundariesOfSnapshotBlock[1]
    );

    const boolIsExistsSideTag = strSnapshotBlock.includes(
      arrBoundariesOfSideBlock[0]
    );

    if (boolIsExistsSideTag) {
      // Found at least 1 "[side]"

      // Get all inside FIRST [side] and LAST [/side]
      const strAllSidesBlock = objStringFunctions.CutStringByBoundaries(
        strSnapshotBlock,
        arrBoundariesOfSideBlock[0],
        arrBoundariesOfSideBlock[1]
      );

      // Invoke function for working with [side] tag
      WorkWithSideTag(objResult, strAllSidesBlock);
    } else {
      // Not found any "[side]"
      // Rewrite [] as null for later easy check/use
      objResult.result.sides = null;
    }
    // ===================== END SaveGame First block =======================

    // ===================== START SaveGame Second block =======================
    // overwrite leaders from [unit] --> snapshot/side/unit

    // Invoking special function to work with [side] inside [snapshot]
    WorkWithSideTagSpecial(objResult, strSnapshotBlock);

    // ===================== END SaveGame Second block =======================
  }

  return objResult;
};
