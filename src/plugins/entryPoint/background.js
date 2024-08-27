// background.js

import {
  getCurrentTabId,
  getCurrentTabUrl,
  getLoginToken,
  pingPong,
  setLoginToken,
} from "./utils/background.utils";

// TED 网站，当前页面URL
let tedCurrentUrl = "";

let isContentScriptReady = false;

console.log("background.js loaded");

async function checkConnection() {
  let t = await pingPong();
  let j = await t.json();
  if (t.ok && j.code !== 200) {
    browser.tabs.create({ url: "loginPage/index.html" });
  }
}

// 向 content script 发送消息
async function notifyContentScript(messageObject) {
  if (isContentScriptReady) {
    const tabId = await getCurrentTabId();
    browser.tabs.sendMessage(tabId, messageObject);
  }
}

// 通知 content script 扩展图标被点击
async function notifyClickEvent(type = "show", message = "default") {
  const tabId = await getCurrentTabId();
  const url = await getCurrentTabUrl();

  browser.tabs.sendMessage(tabId, {
    tabId,
    url,
    type,
    message,
  });
}

// 处理 content script 发来的消息
function handleResponse(message) {
  console.log(message);
}

// 处理错误
function handleError(error) {
  console.log(`Error: ${error}`);
}

// 扩展图标被点击
async function extensionIconClicked(tab, clickEvent) {
  let token = await getLoginToken();

  if (token === undefined || token === null || token === "") {
    // Need login logic here...
    browser.tabs.create({ url: "loginPage/index.html" });
  } else {
    // already login, ping pong to server using token
    let t = await pingPong();
    let j = await t.json();
    if (t.ok && j.code === 200) {
      //   let t = await saveArticle();
      // let j = await t.json();
      // Notify content script
      // if (t.ok && j.code === 200) {
      //   notifyContentScript({ type: "saveArticleSuccess" });
      // }
    } else {
      browser.tabs.create({ url: "loginPage/index.html" });
    }
  }
}

function detailsHandler(details) {
  if (
    !details.url.includes("subtitles") &&
    details.tabId > 0 &&
    !details.url.includes("m3u8")
  ) {
    console.log("*************************");
    console.log("请求 URL: " + details.url);
    console.log(details);
    console.log("*************************");
    tedCurrentUrl = details.url;
    browser.storage.local.set({ "ted-transcript-url": tedCurrentUrl });
    console.log(isContentScriptReady);
    if (isContentScriptReady && tedCurrentUrl) {
      notifyContentScript({ type: "intercept", url: tedCurrentUrl });
    }
  }
}

function tempDetailsHandler(details) {
  if (details.url.includes("timedtext")) {
    console.log(details);
    notifyContentScript({ type: "youtube", url: details.url });
  }
}
browser.browserAction.onClicked.addListener(extensionIconClicked);

browser.webNavigation.onBeforeNavigate.addListener((details) => {
  isContentScriptReady = false;
});

// Listen for messages from pages(Mozilla://file pages, not web pages) and content scripts
browser.runtime.onMessage.addListener(async (message) => {
  switch (message.type) {
    case "login-success":
      setLoginToken(message.data.data.token);
      browser.tabs.remove(await getCurrentTabId());
      break;
    case "tedContentScriptLoaded":
      if (tedCurrentUrl && isContentScriptReady) {
        notifyContentScript({ type: "intercept", url: tedCurrentUrl });
      }
      break;
    case "content-script-ready":
      isContentScriptReady = true;
      break;
    case "check-authorize":
      checkConnection();
      break;
    default:
      break;
  }
});

// 监听tab的url是否发生变化，发生变化了就通知content script
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 检查URL是否改变
  if (changeInfo.url) {
    notifyContentScript({ type: "urlChanged" });
  }
});

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    processResponse(details);
  },
  { urls: ["https://www.youtube.com/api/timedtext*"] },
  ["blocking"]
);

// 处理响应数据
function processResponse(details) {
  // 这里可以使用 XHR 或 Fetch 重新获取响应数据
  let filter = browser.webRequest.filterResponseData(details.requestId);

  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();
  let data = [];

  filter.ondata = (event) => {
    let str = decoder.decode(event.data, { stream: true });
    data.push(str);
    filter.write(encoder.encode(event.data));
  };

  filter.onstop = (event) => {
    let responseBody = data.join("");
    try {
      let json = JSON.parse(responseBody);
      console.log("Response JSON data: ", json);
      console.log(details.url);
      notifyContentScript({ type: "youtube", url: details.url, data: json });
      // 在这里处理 JSON 数据
    } catch (e) {
      alert("视频处理失败，请刷新页面重试");
    }
    filter.disconnect();
  };
}
