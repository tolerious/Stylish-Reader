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

let contentScriptLoaded = false;

console.log("background.js loaded");

// 向 content script 发送消息
async function notifyContentScript(messageObject) {
  const tabId = await getCurrentTabId();
  browser.tabs.sendMessage(tabId, messageObject);
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
    browser.tabs.create({ url: "pages/login.html" });
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
      browser.tabs.create({ url: "pages/login.html" });
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
    console.log(contentScriptLoaded);
    if (contentScriptLoaded && tedCurrentUrl) {
      notifyContentScript({ type: "intercept", url: tedCurrentUrl });
    }
  }
}
browser.browserAction.onClicked.addListener(extensionIconClicked);

// Listen for messages from pages(Mozilla://file pages, not web pages) and content scripts
browser.runtime.onMessage.addListener(async (message) => {
  switch (message.type) {
    case "login-success":
      setLoginToken(message.data.data.token);
      browser.tabs.remove(await getCurrentTabId());
      break;
    case "tedContentScriptLoaded":
      contentScriptLoaded = true;
      if (tedCurrentUrl && contentScriptLoaded) {
        notifyContentScript({ type: "intercept", url: tedCurrentUrl });
      }
      break;
    default:
      break;
  }
});

// 监听tab的url是否发生变化，发生变化了就通知content script
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 检查URL是否改变
  if (changeInfo.url) {
    // 在这里执行你想要的操作
    // notifyContentScript({ type: "urlChanged", url: changeInfo.url });
  }
});

browser.webRequest.onBeforeRequest.addListener(
  // 回调函数，处理请求
  detailsHandler,
  {
    urls: [
      // "https://www.ted.com/graphql",
      "https://hls.ted.com/project_masters/*",
    ],
  }
  // { urls: ["https://*.jd.com/*"] }
  // 过滤器，指定监听的请求类型和 URL 规则
  //   { urls: ["<all_urls>"] }
);
