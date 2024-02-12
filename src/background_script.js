// background.js
function getCurrentTabId() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].id);
    });
  });
}

function getCurrentTabUrl() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

async function notifyClickEvent() {
  const tabId = await getCurrentTabId();
  const url = await getCurrentTabUrl();

  browser.tabs.sendMessage(tabId, {
    tabId,
    url,
    message: "extension clicked",
  });
}

function handleResponse(message) {
  console.log(message);
}
function handleError(error) {
  console.log(`Error: ${error}`);
}
function extensionIconClicked() {
  console.log("extension clicked...");
  notifyClickEvent();
}
browser.browserAction.onClicked.addListener(extensionIconClicked);
