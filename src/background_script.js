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

/**
 * Save token to local storage
 * @param {*} token - token to save
 * @returns {Promise} - true if success, false if failed
 */
function setLoginToken(token) {
  return new Promise((resolve) => {
    browser.storage.local
      .set({ "stylish-reader-token": token })
      .then(() => {
        resolve(true);
      })
      .catch((e) => {
        resolve(false);
      });
  });
}

function getLoginToken() {
  return new Promise((resolve) => {
    browser.storage.local.get("stylish-reader-token").then((res) => {
      resolve(res.token);
    });
  });
}

function openPopup() {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs[0]);
    browser.browserAction.setPopup({
      windowId: tabs[0].windowId,
      popup: "popup/popup.html",
    });
  });
}

async function extensionIconClicked() {
  console.log("extension clicked...");
  let t = await getLoginToken();
  if (t === undefined || t === null || t === "") {
    // Need login logic here...
    t = "no token found";
    openPopup();
  }

  console.log(t);
  notifyClickEvent();
}

browser.browserAction.onClicked.addListener(extensionIconClicked);
