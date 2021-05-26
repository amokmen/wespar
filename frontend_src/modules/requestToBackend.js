const CreateHTML = require("./createHTML.js");

// Function name and argument - to insert into checkboxes onchange event
const strFunctionNameAndArgumentForRemovingObs =
  "AddDelObsFromChat(objResponseBackendGlobal)";

const strIdInputField = "inputTextLink";
const strIdRequestToServerStatus = "pRequestToServerStatus";
const strIdServerResultOutput = "pServerResultOutput";
const strIdServerErrorOutput = "pServerErrorOutput";

const strIdDivForCheckBoxes = "dAllCheckBoxes";

// Could not take it from my ./config.js - because it's front-end
// and could not use back-end config file
const strKeyNameForURL = "urlFileForParsing";
const strAPIEndpoint = "/url";

const arrRequestToServerHeaderAndHeaderContent = [
  "Content-Type",
  "application/json;charset=UTF-8",
];

// ms
const numTimeoutForRequestingServer = 30000;

function RequestToBackend() {
  /* CLEAR ALL DOM ELEMENTS (in case there is next request, not first one) */
  document.getElementById(strIdRequestToServerStatus).innerText = "";
  document.getElementById(strIdServerResultOutput).innerHTML = "";
  document.getElementById(strIdServerErrorOutput).innerText = "";
  document.getElementById(strIdDivForCheckBoxes).innerHTML = "";

  // Get value from input field
  const strValueOfInputField = document.getElementById(strIdInputField).value;

  // Send request to server
  // Creating JSON object with key-value
  const strPayload = JSON.stringify({
    [strKeyNameForURL]: strValueOfInputField,
  });
  const XHR = new XMLHttpRequest();

  // false --> NO ASYNC, blocking, don't use!
  XHR.open("POST", strAPIEndpoint, true);
  XHR.timeout = numTimeoutForRequestingServer;
  XHR.ontimeout = () => {
    document.getElementById(
      strIdRequestToServerStatus
    ).innerText = `[ERR] Request aborted by timeout ${XHR.timeout / 1000} sec!`;
  };

  XHR.setRequestHeader(
    arrRequestToServerHeaderAndHeaderContent[0],
    arrRequestToServerHeaderAndHeaderContent[1]
  );
  XHR.send(strPayload);

  XHR.onreadystatechange = () => {
    if (XHR.readyState !== 4) return;

    if (XHR.status === 200) {
      // alert(XHR.status + ": " + XHR.statusText);
      document.getElementById(
        strIdRequestToServerStatus
      ).innerText = `[OK] Request completed! (HTTP Code is ${XHR.status})`;
    } else if (XHR.status === 0) {
      document.getElementById(strIdRequestToServerStatus).innerText =
        `[ERR] Error while trying to request server! ` +
        `(reload page, check Internet connection)`;
      return;
    } else {
      document.getElementById(
        strIdRequestToServerStatus
      ).innerText = `[ERR] Something went wrong! (HTTP Code is ${XHR.status})`;
      return;
    }

    // Got from backend stringified JSON, need to parse it
    const objResponseBackend = JSON.parse(XHR.responseText);

    // Defined at global scope (need it in AddDelObsFromChat())
    // eslint-disable-next-line no-undef
    objResponseBackendGlobal = objResponseBackend;

    // Unhide elements if there was no client-side error
    // https://stackoverflow.com/questions/45250050/using-queryselectorall-with-classes
    const arrHiddenElements = document.querySelectorAll("[class='hidden']");
    if (
      arrHiddenElements.length > 0 &&
      objResponseBackend.errorInRequest === null
    ) {
      arrHiddenElements.forEach((objElement) => {
        // eslint-disable-next-line no-param-reassign
        objElement.style.display = "initial";
      });
    }

    const getElementForResultOutput = document.getElementById(
      strIdServerResultOutput
    );
    const getElementForErrorOutput = document.getElementById(
      strIdServerErrorOutput
    );

    /* START of showing to user any errors from backend (if any) */
    let strResponseError = "There were no errors.";

    if (objResponseBackend.errorInRequest !== null) {
      // It's client's request error type
      strResponseError = objResponseBackend.errorInRequest;
    } else {
      // ALMOST ALL WORK START HERE BECAUSE objResponseBackend.errorInRequest === null

      // Fuck ESLint, I need this IF exactly here, because could be objResponseBackend.answer = null,
      // and there would be --> Uncaught TypeError: Cannot read property 'errorWhileParsing' of null
      // eslint-disable-next-line no-lonely-if
      if (objResponseBackend.answer.errorWhileParsing !== null) {
        // It's error while parsing
        strResponseError = objResponseBackend.answer.errorWhileParsing;
      }

      const strHTML = CreateHTML(objResponseBackend.answer);
      // // DON'T DEL - it's showing pretty formatted raw answer from back-end
      // const strHTML = `<pre>${JSON.stringify(
      //   objResponseBackend.answer,
      //   null,
      //   1
      // )}</pre>`;
      // // DON'T DEL

      getElementForResultOutput.innerHTML = strHTML;

      /* START creating checkboxes for every uniq nickname in all chat objects */
      let arrAllNicksUniq = [];

      if (objResponseBackend.answer.chat.length >= 0) {
        const arrNicks = [];

        objResponseBackend.answer.chat.forEach((objElement) => {
          // Add nick to new array only if in current object there is NO key "side" --> objElement.side = undefined
          // So, players would not be added here
          if (objElement.side === undefined) {
            arrNicks.push(objElement.id);
          }
        });
        // Removing duplicates
        arrAllNicksUniq = Array.from(new Set(arrNicks));
        arrAllNicksUniq.sort();
      }

      // Get DOM element where would add checkboxes
      const objDivForAddingCheckboxes = document.getElementById(
        strIdDivForCheckBoxes
      );

      // Write each nick as checkbox to DOM element

      // Clear - or if many times press Button - there would be many times added checkboxes
      objDivForAddingCheckboxes.innerHTML = "";

      arrAllNicksUniq.forEach((strElement) => {
        // Insert into DOM new checkbox
        // TODO: add AllObs checkbox and logic to it --> when checked all other checkboxes unchecks and removed all obs (only 2 players and server not removed)
        objDivForAddingCheckboxes.innerHTML +=
          `<input type="checkbox" id="${strElement}" name="${strElement}" ` +
          `onchange="${strFunctionNameAndArgumentForRemovingObs}"` +
          ` />&nbsp;<label for="${strElement}">${strElement}</label>,&nbsp;`;
      });
      /* END creating checkboxes for every uniq nickname in all chat objects */
    }

    // Show to user any error
    getElementForErrorOutput.innerText = strResponseError;
    /* END of showing to user any errors from backend (if any) */
  };

  document.getElementById(strIdRequestToServerStatus).innerText =
    "Requesting...";
}

module.exports = RequestToBackend;
