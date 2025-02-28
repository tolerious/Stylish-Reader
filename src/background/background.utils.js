import {
  backendServerUrl,
  loginTokenKey,
} from "../plugins/entryPoint/constants";
import HttpClient from "./background.request";

// 向 content script 发送消息
export async function sendMessageFromBackgroundScriptToContentScript(
  messageObject
) {
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

// 获取当前标签页的title
export function getCurrentTabTitle() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].title);
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

export function convertStringToLowerCaseAndRemoveSpecialCharacter(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/"/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/:/g, "")
    .replace(/'/g, "")
    .replace(/’/g, "")
    .replace(/\?/g, "")
    .replace(/!/g, "");
}

export async function getTranslation(word) {
  const client = new HttpClient();
  const response = await client.post("/translation/content", { word });
  return response;
}

export async function searchWord(word) {
  const client = new HttpClient();
  const response = await client.post("/word/search", { en: word });
  return response;
}

export async function favourWord(word, groupId) {
  const client = new HttpClient();
  const response = await client.post("/word", {
    en: convertStringToLowerCaseAndRemoveSpecialCharacter(word),
    groupId,
  });
  return response;
}

/**
 * 为当前页面创建group，如果词组已经存在，则不创建，如果词组不存在，则创建。
 * 并且设置默认的group为当前页面的group
 */
export async function createAndSetDefaultGroupForCurrentPage() {
  const g = await createGroup();

  await setDefaultGroup(g.data._id);
  return g;
}

async function setDefaultGroup(groupId) {
  const client = new HttpClient();
  await client.post("/usersetting", {
    defaultGroupID: groupId,
  });
}

async function createGroup() {
  const client = new HttpClient();
  const g = client.post("/wordgroup", {
    name: await getCurrentTabTitle(),
    createdSource: "extension",
    originalPageUrl: await getCurrentTabUrl(),
  });
  return g;
}

export async function deleteWord(word) {
  const client = new HttpClient();
  const d = await client.post("/word/word/id", {
    en: convertStringToLowerCaseAndRemoveSpecialCharacter(word),
  });

  const wordId = d.data._id;

  const g = await createAndSetDefaultGroupForCurrentPage();
  const t = await client.post("/word/delete", {
    id: wordId,
    groupId: g.data._id,
  });

  if (t.code === 200) {
    sendMessageFromBackgroundScriptToContentScript({
      type: "delete-word-success",
    });
    console.log("删除单词成功");
  } else {
    console.log("删除单词失败");
  }
}

export async function getAudioContent(word) {
  const client = new HttpClient();
  const response = await client.postBlob("/youdao", { word });
  return response;
}

// #region The Guardian
export async function saveTheGuardianArticle(article) {
  const group = await createGroup();
  const client = new HttpClient();
  const { headline, standfirst, content } = article;
  const response = await client.post("/article/guardian", {
    content,
    title: headline,
    summary: standfirst,
    groupId: group.data._id,
    originalUrl: await getCurrentTabUrl(),
  });
  return response;
}

export async function getGuardianArticle(id) {
  const client = new HttpClient();
  const response = client.get(`/article/guardian/${id}`);
  return response;
}

export async function generateQuestionAnswers(id) {
  const client = new HttpClient();
  const article = await getGuardianArticle(id);
  console.log(article);
  const response = await client.post("/deepseek", {
    content: article.data.content,
  });
  console.log(response);
  // return response;
}
// #endregion

export async function getTranslationFromBaidu(message) {
  const client = new HttpClient();
  const { content, classId } = message;
  const response = await client.post("/baidu", {
    content,
  });

  return { response, classId };
}
