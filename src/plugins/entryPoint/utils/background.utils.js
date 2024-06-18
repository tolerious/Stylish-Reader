import { backendServerUrl, loginTokenKey } from "../constants";

// 获取登录token
export function getLoginToken() {
  return new Promise((resolve) => {
    browser.storage.local.get(loginTokenKey).then((res) => {
      resolve(res[loginTokenKey]);
    });
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

/**
 * Save token to local storage
 * @param {*} token - token to save
 * @returns {Promise} - true if success, false if failed
 */
export function setLoginToken(token) {
  return new Promise((resolve) => {
    browser.storage.local
      .set({ loginTokenKey: token })
      .then(() => {
        resolve(true);
      })
      .catch((e) => {
        resolve(false);
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
