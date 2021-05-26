/*
Here all logic to make from object --> HTML string.
*/

function CreatingOutputString(objWithStringsOrNull) {
  // Define by default "unknown time" - would use if speak block from 'server'
  let timestamp = "unknown_time";
  let nickname = "";
  let strIfPlayer = "";
  let message = "";
  let prefix = "";

  if (objWithStringsOrNull.time) {
    // Convert Unix-time to ISO string
    // Overwriting "unknown_time"

    // TODO: try-catch parseInt
    timestamp = new Date(parseInt(objWithStringsOrNull.time, 10) * 1000)
      .toISOString()
      .slice(11, -5);
  }

  // Surround nickname with "*" if speaking to observers
  if (objWithStringsOrNull.to_sides === "observer") {
    nickname = `*${objWithStringsOrNull.id}*`;
  } else {
    nickname = objWithStringsOrNull.id;
  }

  if (objWithStringsOrNull.side) {
    strIfPlayer = ` (p${objWithStringsOrNull.side})`;
  }

  message = objWithStringsOrNull.message;

  prefix = `<[${timestamp}] ${nickname}${strIfPlayer}>`;

  // Colorize prefix for both players only
  if (objWithStringsOrNull.side) {
    if (objWithStringsOrNull.side === "1") {
      // Red color for P1
      prefix =
        `<b style="color:red;">&lt;` +
        `[${timestamp}] ${nickname}${strIfPlayer}&gt;</b>`;
    } else {
      // Blue color for P2
      prefix =
        `<b style="color:blue;">&lt;` +
        `[${timestamp}] ${nickname}${strIfPlayer}&gt;</b>`;
    }
  }

  return `${prefix} ${message}<br>`;
}

function ChatCreateHTML(arrOfObjects) {
  let strAllChatHere = "";

  let arrAllTurnsUniq = [];
  const arrTurns = [];

  // Get all uniq turn numbers from all speak objects
  arrOfObjects.forEach((objElement) => {
    arrTurns.push(objElement.numCurrentTurn);
  });

  // Removing duplicates
  arrAllTurnsUniq = Array.from(new Set(arrTurns));

  // Would take each turn number and search all speak objects with that turn number
  arrAllTurnsUniq.forEach((numElement) => {
    strAllChatHere += `TURN #${numElement} START<br>`;

    const arrSide1Messages = [];
    const arrSide2Messages = [];

    arrOfObjects.forEach((objElement) => {
      if (objElement.numCurrentTurn === numElement) {
        // Create 2 arrays: first array would have all speak objects with objElement.boolIsFirstSideNowPlaying: true
        // second array would have all speak objects with objElement.boolIsFirstSideNowPlaying: false
        if (objElement.boolIsFirstSideNowPlaying) {
          arrSide1Messages.push(objElement);
        } else {
          arrSide2Messages.push(objElement);
        }
      }
    });

    // Now we could create output, in right order
    strAllChatHere += `&nbsp;&nbsp;Side#1 start playing<br>`;

    arrSide1Messages.forEach((objElement) => {
      strAllChatHere += `&nbsp;&nbsp;&nbsp;&nbsp;${CreatingOutputString(
        objElement
      )}`;
    });

    strAllChatHere += `&nbsp;&nbsp;Side#1 end playing<br>`;

    strAllChatHere += `&nbsp;&nbsp;Side#2 start playing<br>`;

    arrSide2Messages.forEach((objElement) => {
      strAllChatHere += `&nbsp;&nbsp;&nbsp;&nbsp;${CreatingOutputString(
        objElement
      )}`;
    });

    strAllChatHere += `&nbsp;&nbsp;Side#2 end playing<br><br>`;
  });

  strAllChatHere += `</p>`;

  return strAllChatHere;
}

function CreateHTML(objMy) {
  // Output meta
  const strMetaHeader = `<h2>Metadata</h2>`;
  const strMetaInfo =
    `<p>It's replay? ${objMy.meta.isReplay}<br>` +
    `It's server replay? ${objMy.meta.isServerReplay}<br>` +
    `Version: ${objMy.meta.version}</p>`;
  const strMeta = strMetaHeader + strMetaInfo;

  // Output game settings
  // Generate addon(s) output
  let strAddons = "";
  const arrAddons = objMy.gameSettings.addons;
  if (arrAddons !== null) {
    strAddons = "<h2>Addons used</h2><p>";
    for (let index = 0; index < arrAddons.length; index += 1) {
      const objElement = arrAddons[index];
      strAddons +=
        `* ${objElement.name} (${objElement.id}) ` +
        `version ${objElement.version}<br>`;
    }
    strAddons += `</p>`;
  }

  let strTimerSettings = "";
  if (objMy.gameSettings.settings.mp_countdown === "yes") {
    strTimerSettings =
      `Timer settings:<br>` +
      `Init time: ${objMy.gameSettings.settings.mp_countdown_init_time} sec<br>` +
      `Turn bonus: ${objMy.gameSettings.settings.mp_countdown_turn_bonus} sec<br>` +
      `Reservoir: ${objMy.gameSettings.settings.mp_countdown_reservoir_time} sec<br>` +
      `Action bonus: ${objMy.gameSettings.settings.mp_countdown_action_bonus} sec<br>`;
  }

  // objMy.gameSettings.settings init as 'null', later invoking SearchPrefixesInEachLine() which return filled object or EMPTY object
  // TODO: check key(s) existence
  const strScenarioInfo =
    `<h2>Scenario info</h2>` +
    `<p>Map name: ${objMy.gameSettings.settings.mp_scenario_name}<br>` +
    `Timer: <b>${objMy.gameSettings.settings.mp_countdown}</b><br>` +
    `${strTimerSettings}` +
    `Era: ${objMy.gameSettings.settings.mp_era}<br>` +
    `Mode: ${objMy.gameSettings.settings.random_faction_mode}<br>` +
    `Shuffle: ${objMy.gameSettings.settings.shuffle_sides}<br>` +
    `Observers: ${objMy.gameSettings.settings.observer}<br>` +
    `Saved game: ${objMy.gameSettings.settings.savegame}<br>` +
    `Game title: ${objMy.gameSettings.settings.scenario}<br>` +
    `Random start time: ${objMy.gameSettings.settings.mp_random_start_time}<br><br>` +
    `Turns number: ${objMy.gameSettings.turns}</p>`;

  // Sometimes there could be objMy.sides = null, so, pre-checking
  let strSides = "<h2>Sides</h2>";
  if (objMy.sides !== null) {
    // Output sides
    let strHost1 = "";
    let strHost2 = "";
    if (objMy.sides[0].is_host === "yes") {
      strHost1 = "(host) ";
    } else if (objMy.sides[1].is_host === "yes") {
      strHost2 = "(host) ";
    }

    const strSide1Info =
      `${strHost1}P${objMy.sides[0].side} ` +
      `<b>${objMy.sides[0].player_id}</b> (${objMy.sides[0].color}) ` +
      `with leader "${objMy.sides[0].type}"<br>`;

    const strSide2Info =
      `${strHost2}P${objMy.sides[1].side} ` +
      `<b>${objMy.sides[1].player_id}</b> (${objMy.sides[1].color}) ` +
      `with leader "${objMy.sides[1].type}"`;

    strSides += `<p>${strSide1Info}${strSide2Info}</p>`;
  }

  // Output chat log
  let strDateOfPlaying = "";
  if (typeof objMy.mTime === "number") {
    strDateOfPlaying = new Date(parseInt(objMy.mTime, 10))
      .toISOString()
      .slice(0, 10);
  }

  const strChatHeading =
    `<h2>Chat log (${strDateOfPlaying})</h2><p>(timestamps is in UTC+0)</p>` +
    `<p>`;

  // TODO: need to check, objMy.chat could be EMPTY object {} not an []
  const strChat = ChatCreateHTML(objMy.chat);

  return (
    strMeta + strScenarioInfo + strAddons + strSides + strChatHeading + strChat
  );
}

module.exports = CreateHTML;
