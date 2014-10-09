chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript(null, {file: "assets/js/rangy-core.js"});
  chrome.tabs.executeScript(null, {file: "assets/js/rangy-cssclassapplier.js"});
  chrome.tabs.executeScript(null, {file: "assets/js/jquery-1.11.1.js"});
  chrome.tabs.executeScript(null, {file: "assets/js/ejs_production.js"});
  chrome.tabs.executeScript(null, {file: "editor.js"});
});
