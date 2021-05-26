const AddDelObsFromChat = require("./modules/removeObserversFromChat");
const RequestToBackend = require("./modules/requestToBackend");
const GetVersion = require("./modules/getVersion");

// Define functions at global scope
window.RequestToBackend = RequestToBackend;
window.AddDelObsFromChat = AddDelObsFromChat;

// Define main backend response object at global scope (because I need it in 2 different modules)
// eslint-disable-next-line no-unused-vars
const objResponseBackendGlobal = null;

// Elements in DOM to manipulate with
const strIdInputField = "inputTextLink";
const strIdButton = "buttonForClick";

// Functions that should be ready AFTER page was load (to interact with HTML elements)
window.addEventListener("load", () => {
  /*
  Creating listener for input field. If did not create, after pressing Enter at keyboard there would default
  event for form - send GET HTTP request like this one: http://localhost:30000/?url=1

  According to cool service https://keycode.info/ for "Enter" at virtual Android keyboard is event.key = "Enter" and event.code - empty,
  but for desktop keyboard there are: event.key = "Enter" and event.code = "Enter".
  */
  const objInputField = document.getElementById(strIdInputField);
  objInputField.addEventListener("keydown", (event) => {
    if (event.code === "Enter" || event.key === "Enter") {
      // Suppress "double action" if event handled
      event.preventDefault();
      document.getElementById(strIdButton).click();
    }
  });

  // Add version from TXT file - Async request to backend to get file version.txt
  GetVersion();
});
