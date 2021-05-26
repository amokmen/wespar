const CreateHTML = require("./createHTML.js");

const strIdServerResultOutput = "pServerResultOutput";

// Function to execute at any checkbox state change
function AddDelObsFromChat(objResponseBackendGlobal) {
  let strHTML = null;
  // Check state for all checkboxes in DOM
  // if checked - remove obs from chat
  // if not checked just regenerate parsed result

  // Get all checked CheckBoxes
  const arrCheckedCheckBoxes = document.querySelectorAll(
    "input[type='checkbox']:checked"
  );

  const arrNicksForRemoving = [];
  if (arrCheckedCheckBoxes.length > 0) {
    arrCheckedCheckBoxes.forEach((objElementCheckBox) => {
      arrNicksForRemoving.push(objElementCheckBox.id);
    });

    let arrNewChatWithRemovedObs = [];
    // Check if input obj exist (if user click at AllObs BEFORE replay parsing - there would be NO chat)
    if (objResponseBackendGlobal !== null) {
      // If exist main object - working
      arrNewChatWithRemovedObs = objResponseBackendGlobal.answer.chat.filter(
        (obj) => {
          let boolMy = true;

          arrNicksForRemoving.forEach((strElement) => {
            if (obj.id === strElement) {
              boolMy = false;
            }
          });

          return boolMy;
        }
      );
    }

    // Copy object
    const objCopy = JSON.parse(JSON.stringify(objResponseBackendGlobal));

    // Overwrite chat in copied object
    objCopy.answer.chat = arrNewChatWithRemovedObs;

    strHTML = CreateHTML(objCopy.answer);
  } else {
    // Nothing checked - revert chat to birth
    strHTML = CreateHTML(objResponseBackendGlobal.answer);
  }

  // Run new DOM generation with new version of chat or clear one
  const getElementForResultOutput = document.getElementById(
    strIdServerResultOutput
  );

  getElementForResultOutput.innerHTML = strHTML;
}

module.exports = AddDelObsFromChat;
