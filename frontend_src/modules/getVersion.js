const strFilenameWithVersionInside = "version.txt";
const strIdVersion = "bVersion";
const strIdUpdateDate = "bUpdateDate";

// ms
const numTimeoutForRequestingServer = 30000;

function GetVersion() {
  // -- START async request to server -----------------------
  const XHR = new XMLHttpRequest();

  XHR.open("GET", strFilenameWithVersionInside, true);
  XHR.timeout = numTimeoutForRequestingServer;
  XHR.ontimeout = () => {
    // eslint-disable-next-line no-console
    console.log(
      `[ERR] Request for file <${strFilenameWithVersionInside}> ` +
        `aborted by timeout ${XHR.timeout / 1000} sec!`
    );
  };

  XHR.send(null);

  XHR.onreadystatechange = () => {
    if (XHR.readyState === 4) {
      if (XHR.status === 200) {
        // Request for file completed with HTTP 200
        const strVersion = XHR.responseText;
        const objParagraphVersion = document.getElementById(strIdVersion);
        objParagraphVersion.innerText = strVersion;

        // Get mtime for file like "Wed, 21 Apr 2021 15:58:52 GMT"
        const strHeaderLastModified = XHR.getResponseHeader("last-modified");

        // "2021-04-21"
        const strISOTimestampReducedToDate = new Date(strHeaderLastModified)
          .toISOString()
          .slice(0, 10);

        const objDivUpdateDate = document.getElementById(strIdUpdateDate);
        objDivUpdateDate.innerText = strISOTimestampReducedToDate;
      } else if (XHR.status === 0) {
        // Also would be here if request timeout would reach
        // eslint-disable-next-line no-console
        console.log(
          `[ERR] Server error or timeout was reached! (no any HTTP code)`
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(`[ERR] Something went wrong! (HTTP Code is ${XHR.status})`);
      }
    }
  };
  // -- END async request to server -----------------------
}

module.exports = GetVersion;
