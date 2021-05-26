const objStringFunctions = require("./string_functions.js");

// ======================= START Constants Declaration ========================

// Constants for First block
const arrBoundariesOfMultiplayerBlock = ["[multiplayer]", "[/multiplayer]"];
const arrBoundariesOfAddonBlock = ["[addon]", "[/addon]"];
const arrAddonPrefixes = ["id", "name", "version"];

// Constants for Second block
const arrBoundariesOfMultiplayerBlockReduced = ["[multiplayer]", "[options]"];

// Needed keys inside [multiplayer]...[options]
const arrPrefixesForMultiplayerBlockReduced = [
  "mp_countdown",
  "mp_countdown_action_bonus",
  "mp_countdown_init_time",
  "mp_countdown_reservoir_time",
  "mp_countdown_turn_bonus",
  "mp_era",
  "mp_random_start_time",
  "mp_scenario_name",
  "observer",
  "random_faction_mode",
  "savegame",
  "shuffle_sides",
  // "scenario" here is game title
  "scenario",
];

// Constants for Third block
const strInitSideTag = "[init_side]";

// ======================= END Constants Declaration ==========================

/*
Input: <string> (replay as a big string)
Output: <object>
*/
module.exports = (strReplayAsString) => {
  const objResult = {
    error: null,
    result: {
      // need to init it as array not null, because later there would be push()
      addons: [],
      settings: null,
      turns: null,
    },
  };

  // Reduce big replay string to [multiplayer]...[/multiplayer]
  // Attention! Inside top-level [multiplayer] tag THERE IS COULD BE ANOTHER [multiplayer]...[/multiplayer] tag (ladder_era creates this one)!
  // So, searching first "[multiplayer]" and first from end [/multiplayer]
  const strMultiplayerBlock = objStringFunctions.CutStringByBoundaries(
    strReplayAsString,
    arrBoundariesOfMultiplayerBlock[0],
    arrBoundariesOfMultiplayerBlock[1]
  );

  // ===================== START First block ==========================
  // Get info about used addon(s) - if any used

  // Search any "[addon]" inside [multiplayer]...[/multiplayer] --> if found it would be FIRST occurrence
  const boolIsExistAtLeastOneAddon = strMultiplayerBlock.includes(
    arrBoundariesOfAddonBlock[0]
  );

  if (boolIsExistAtLeastOneAddon) {
    // Found at least 1 "[addon]"

    // Get all inside FIRST [addon] and LAST [/addon]
    let strAllAddonsBlock = objStringFunctions.CutStringByBoundaries(
      strMultiplayerBlock,
      arrBoundariesOfAddonBlock[0],
      arrBoundariesOfAddonBlock[1]
    );

    // Now in cycle we need to work with every found addon

    // How many addons we have?
    const numAddonsCounter =
      strAllAddonsBlock.split(arrBoundariesOfAddonBlock[0]).length - 1;

    for (let index = 0; index < numAddonsCounter; index += 1) {
      // Find first [addon] and FIRST [/addon] --> could not use my function CutStringByBoundaries here!
      const numPositionOfAddon = strAllAddonsBlock.indexOf(
        arrBoundariesOfAddonBlock[0]
      );
      const numPositionOfAddonClosed = strAllAddonsBlock.indexOf(
        arrBoundariesOfAddonBlock[1]
      );

      const strCurrentAddonBlock = strAllAddonsBlock.substring(
        numPositionOfAddon,
        numPositionOfAddonClosed + arrBoundariesOfAddonBlock[1].length
      );

      // Get from current addon block all needed info - id, name, version
      const objCurrentParsed = objStringFunctions.SearchPrefixesInEachLine(
        strCurrentAddonBlock,
        arrAddonPrefixes
      );

      // Write parsed result to upper object
      objResult.result.addons.push(objCurrentParsed);

      // Remove current addon from string (for working with next addon)
      strAllAddonsBlock = strAllAddonsBlock.slice(
        numPositionOfAddonClosed + arrBoundariesOfAddonBlock[1].length
      );
    }
  } else {
    // not found any "[addon]"
    // rewrite [] as null for later easy checking/use
    objResult.result.addons = null;
  }

  /*
  TODO: parse addons options
  Could hardcode parsing only pool from which maps are taken while randomizing?
  [multiplayer] -> [options] -> [multiplayer] (here would be options for random maps list of ladder era)
  and [modification] (here would be options for Color changer)
  */

  // ======================= END First block ================================

  // ======================= START Second block =============================
  // Get info about game settings

  // Cut - searching first "[multiplayer]", and from it - search first [options]
  const strMultiplayerBlockReduced = objStringFunctions.CutStringByBoundaries(
    strMultiplayerBlock,
    arrBoundariesOfMultiplayerBlockReduced[0],
    arrBoundariesOfMultiplayerBlockReduced[1]
  );

  // Parse
  objResult.result.settings = objStringFunctions.SearchPrefixesInEachLine(
    strMultiplayerBlockReduced,
    arrPrefixesForMultiplayerBlockReduced
  );
  // ======================= END Second block =============================

  // ======================= START Third block =============================
  // How many turns in replay?
  // [init_side] - tag starting each side actions
  const numInitSideTagsCounter =
    strReplayAsString.split(strInitSideTag).length - 1;
  if (numInitSideTagsCounter > 0) {
    const numDivedBy2 = numInitSideTagsCounter / 2;
    if (Number.isInteger(numDivedBy2)) {
      // Integer number
      objResult.result.turns = numDivedBy2;
    } else {
      // Float number
      objResult.result.turns = parseInt(numDivedBy2, 10) + 1;
    }
  }
  // ======================= END Third block =============================

  return objResult;
};
