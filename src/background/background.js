// background.js

import {
  getCurrentTabId,
  getCurrentTabUrl,
  notifyContentScript,
  setLoginToken,
} from "./background.utils";

// TED 网站，当前页面URL
let tedCurrentUrl = "";

// Content Script 是否已经准备完毕
let isContentScriptReady = false;

// login page 是否已经被打开过
let loginHasBeenOpened = false;

// 已经打开的 login page 的 id
let loginPageTabId = -1;
console.log("background.js loaded");

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

// 扩展图标被点击
async function extensionIconClicked(tab, clickEvent) {}

browser.browserAction.onClicked.addListener(extensionIconClicked);

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabId === loginPageTabId) {
    loginHasBeenOpened = false;
  }
});

browser.webNavigation.onBeforeNavigate.addListener((details) => {
  isContentScriptReady = false;
});

// 监听来自content script的消息
browser.runtime.onMessage.addListener(async (message) => {
  switch (message.type) {
    case "open-login":
      if (!loginHasBeenOpened) {
        loginHasBeenOpened = true;
        const result = await browser.tabs.create({
          url: "loginPage/index.html",
        });
        loginPageTabId = result.id;
      }
      break;
    case "login-success":
      await setLoginToken(message.data.data.token);
      browser.tabs.remove(await getCurrentTabId());
      // 登陆成功后刷新所有tab
      browser.tabs
        .query({})
        .then((tabs) => {
          for (let tab of tabs) {
            browser.tabs.reload(tab.id);
          }
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        });
      break;
    case "tedContentScriptLoaded":
      if (tedCurrentUrl) {
        notifyContentScript({ type: "intercept", url: tedCurrentUrl });
      }
      break;
    case "http-request":
      console.log('http-request', message);
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
    let str = decoder.decode(event.data);
    data.push(str);
  };

  filter.onstop = (event) => {
    let responseBody = data.join("");
    try {
      let json = JSON.parse(responseBody);
      notifyContentScript({ type: "youtube", url: details.url, data: json });
      // 在这里处理 JSON 数据
      data.forEach((d) => {
        filter.write(encoder.encode(d));
      });
    } catch (e) {
      alert("视频处理失败，请刷新页面重试");
    }
    filter.disconnect();
  };
}
