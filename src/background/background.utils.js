import {
  backendServerUrl,
  loginTokenKey,
} from "../plugins/entryPoint/constants";

// 向 content script 发送消息
export async function notifyContentScript(messageObject) {
  const tabId = await getCurrentTabId();
  browser.tabs.sendMessage(tabId, messageObject);
}
/**
 * Save token to local storage
 * @param {*} token - token to save
 * @returns {Promise} - true if success, false if failed
 */
export function setLoginToken(token) {
  return new Promise((resolve) => {
    browser.storage.local
      .set({ [loginTokenKey]: token })
      .then(() => {
        resolve(true);
      })
      .catch((e) => {
        resolve(false);
      });
  });
}

// 获取登录token
export async function getLoginToken() {
  const value = await browser.storage.local.get(loginTokenKey);
  return new Promise((resolve) => {
    resolve(value[loginTokenKey]);
  });
}

// 获取当前标签页的ID
export function getCurrentTabId() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].id);
    });
  });
}

// 获取当前标签页的URL
export function getCurrentTabUrl() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

// 测试本地token是否有效
export async function pingPong() {
  const headers = new Headers();
  const token = await getLoginToken();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");
  return fetch(`${backendServerUrl}/logic/pingpong`, {
    method: "GET",
    headers: headers,
  });
}

// 保存文章
export async function saveArticle() {
  const headers = new Headers();
  const token = await getLoginToken();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");
  return fetch(`${backendServerUrl}/article`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ link: await getCurrentTabUrl() }),
  });
}
