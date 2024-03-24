// background.js

// 服务器地址
let server_url = "http://localhost:3000";

// TED 网站，当前页面URL
let tedCurrentUrl = "";

let contentScriptLoaded = false;

// 获取当前标签页的ID
function getCurrentTabId() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].id);
    });
  });
}

// 获取当前标签页的URL
function getCurrentTabUrl() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

function waitUntilContentScriptLoaded() {
  return new Promise((resolve) => {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.active) {
        resolve(true);
      }
    });
  });
}

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

// 获取登录token
function getLoginToken() {
  return new Promise((resolve) => {
    browser.storage.local.get("stylish-reader-token").then((res) => {
      resolve(res["stylish-reader-token"]);
    });
  });
}

// 保存文章
async function saveArticle() {
  const headers = new Headers();
  const token = await getLoginToken();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");
  return fetch(`${server_url}/article`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ link: await getCurrentTabUrl() }),
  });
}

// 测试本地token是否有效
async function pingPong() {
  const headers = new Headers();
  const token = await getLoginToken();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");
  return fetch(`${server_url}/logic/pingpong`, {
    method: "GET",
    headers: headers,
  });
}

// 扩展图标被点击
async function extensionIconClicked() {
  let t = await getLoginToken();
  if (t === undefined || t === null || t === "") {
    // Need login logic here...
    browser.tabs.create({ url: "pages/login.html" });
  } else {
    // already login, ping pong to server using token
    let t = await pingPong();
    let j = await t.json();
    if (t.ok && j.code === 200) {
      console.log("Login state is valid.");
      // let t = await saveArticle();
      // let j = await t.json();
      // Notify content script
      if (t.ok && j.code === 200) {
        notifyContentScript({ type: "saveArticleSuccess" });
      }
    } else {
      browser.tabs.create({ url: "pages/login.html" });
    }
  }
}

browser.browserAction.onClicked.addListener(extensionIconClicked);

// Listen for messages from pages(Mozilla://file pages, not web pages) and content scripts
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "login-success") {
    setLoginToken(message.data.data.token);
    let tabId = await getCurrentTabId();
    browser.tabs.remove(tabId);
  }
  if (message.type === "contentLoaded") {
    contentScriptLoaded = true;
    if (tedCurrentUrl && contentScriptLoaded) {
      notifyContentScript({ type: "intercept", url: tedCurrentUrl });
    }
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
    console.log(contentScriptLoaded);
    if (contentScriptLoaded && tedCurrentUrl) {
      notifyContentScript({ type: "intercept", url: tedCurrentUrl });
    }
  }
}

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
