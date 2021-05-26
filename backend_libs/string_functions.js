const strEOL = "\n";
const strDelimiterForSplittingKeyValue = "=";

/*
WML key-value look like this:
campaign_type="multiplayer"

I called key (example - 'campaign_type') as 'prefix'.

This function gets WML as 1 big string,
breaks by EOL symbol,
and working with every string - trying to find any of provided prefixes.

Input: WML replay as big <string>, array of prefixes to find <array of strings>
Output: result as <object>

Resulting object creates DYNAMICALLY,
where every FOUND prefix become object key (with value, ofc).
*/
function SearchPrefixesInEachLine(strInputString, arrPrefixesToFind) {
  // Define result object, it's empty (why not null?)
  const objResult = {};

  // Split 1 big string by EOL symbol
  const arrInputStringsSplitted = strInputString.split(strEOL);

  arrInputStringsSplitted.forEach((strForSearching) => {
    // Shitty replay structure/format!
    // Some replays have TABs, another - have not!
    // Should remove prefixed TABs symbol(s) - could be 0, 1, many
    // Another way - use the trim() method removes whitespace from both sides of a string
    // White spaces are - tabs, new line and so on symbols: https://en.wikipedia.org/wiki/Whitespace_character#Unicode
    const strForSearchingWithoutPrefixedTabs = strForSearching.replace(
      // /^\t+/g - actually no need to use here 'global', because I need to trim tabs only from start of line
      /^\t+/,
      ""
    );

    // Split line to key-value by delimiter
    const arrSplitted = strForSearchingWithoutPrefixedTabs.split(
      strDelimiterForSplittingKeyValue
    );
    // First element of array is KEY
    const strCurrentLinePrefix = arrSplitted[0];

    // Checking if current prefix exist in list of needed prefixes
    if (arrPrefixesToFind.includes(strCurrentLinePrefix)) {
      // We found one of needed prefixes

      // Here I intentionally decided to not use second array element,
      // because after splitting there could be MORE than 2 array elements -
      // for example if there was symbol '=' inside value (in players speech).
      // So, here I cut string FROM position "key=" to END of string
      const strContainingValue = strForSearchingWithoutPrefixedTabs.substring(
        strCurrentLinePrefix.length + 1
      );

      // Shitty replay format!
      // At some replays there would be value double-quoted --> mp_countdown="no"
      // And another would have no double quotes --> mp_countdown=no
      const strRemoveDoubleQuoteAtStart = strContainingValue.replace(
        // or --> '"'
        /^"/,
        ""
      );

      const strRemoveDoubleQuoteAtEnd = strRemoveDoubleQuoteAtStart.replace(
        /"$/,
        ""
      );

      // It's only for [speak] block
      // If human say something with double quoting, WML escaping each double quote with another double quote
      // So, need to remove escaping double quotes
      const strRemoveDoubleDoubleQuotes = strRemoveDoubleQuoteAtEnd.replace(
        /""/g,
        '"'
      );

      objResult[strCurrentLinePrefix] = strRemoveDoubleDoubleQuotes;
    }
  });

  return objResult;
}

/*
Function to trim/cut/reduce given big string to smaller one.

Input: big <string>, starting boundary <string>, ending boundary <string>
Output: result as smaller <string> (including both boundaries) or empty <string> if there was ANY error

It's actually not right to return empty string if error occurs, but I don't want implement
'right' logic in this case - if I would return smth other than string (obj.error) I need to write more checking
when executing this function...
*/
function CutStringByBoundaries(strToCut, strStart, strEnd) {
  let strReduced = "";

  // Pre-checking (no need to check if arguments empty strings, only check types)
  if (
    typeof strToCut !== "string" ||
    typeof strStart !== "string" ||
    typeof strEnd !== "string"
  ) {
    return strReduced;
  }

  const numStartPosition = strToCut.indexOf(strStart);
  if (numStartPosition === -1) {
    // Error, not found starting boundary
    return strReduced;
  }

  const numEndPosition = strToCut.lastIndexOf(strEnd);
  if (numEndPosition === -1) {
    // Error, not found ending boundary
    return strReduced;
  }

  strReduced = strToCut.substring(
    numStartPosition,
    numEndPosition + strEnd.length
  );

  return strReduced;
}

module.exports = { SearchPrefixesInEachLine, CutStringByBoundaries };
