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

async function notifyPopup(messageObject) {
  const tabId = await getCurrentTabId();
  browser.tabs.sendMessage(tabId, messageObject);
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
      resolve(res["stylish-reader-token"]);
    });
  });
}

function openPopup() {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.browserAction.setPopup({
      windowId: tabs[0].windowId,
      popup: "popup/popup.html",
    });
  });
}

async function pingPone() {
  const headers = new Headers();
  const token = await getLoginToken();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");
  fetch("http://localhost:3000/logic/pingpong", {
    method: "GET",
    headers: headers,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.code !== 200) {
        browser.tabs.create({ url: "popup/popup.html" });
      }
    })
    .catch((error) => {
      // TODO: I'm considering the right way to handle this error
      console.log(error);
    });
}
async function extensionIconClicked() {
  let t = await getLoginToken();
  if (t === undefined || t === null || t === "") {
    // Need login logic here...
    browser.tabs.create({ url: "popup/popup.html" });
  } else {
    // already login, ping pong to server using token
    pingPone();
  }
}

browser.browserAction.onClicked.addListener(extensionIconClicked);

// Listen for messages from popup
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "popup") {
    setLoginToken(message.data.data.token);
    let tabId = await getCurrentTabId();
    browser.tabs.remove(tabId);
  }
});
