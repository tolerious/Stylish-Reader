import { getLoginToken } from "../entryPoint/utils/background.utils";
import { logger } from "../utils/utils";
import {
  activeStatusBackgroundColor,
  inActiveStatusBackgroundColor,
  transcriptStatusChineseElementId,
  transcriptStatusElementId,
  transcriptStatusEnglishElementId,
  youtubeShadowRootId,
  youtubeStylishReaderIconId,
  youtubeVuePageMountPoint,
} from "./constants";

let currentYoutubeTranslationUrl = "";
let currentYoutubeZhTranslationUrl = "";
let currentYoutubeTranslationData = "";
let currentYoutubeZhTranslationData = "";
let isEnglishTranscriptExist = false;
let isChineseTranscriptExist = false;

export function createYoutubeStylishReaderIcon() {
  // For debug
  //   const tt = document.querySelector(".ytp-chrome-bottom");
  //   tt.style.opacity = 1;
  if (findYoutubeStylishReaderToolBarIcon()) {
    return;
  }
  logger("create stylish icon.");
  const toolBar = document.querySelector(".ytp-right-controls");
  if (toolBar) {
    const element = createYoutubeStylishIconElement();
    logger("add icon...");
    // element.addEventListener("click", onClickStylishReaderIcon);
    toolBar.appendChild(element);
  }
}

async function onClickStylishReaderIcon(e) {
  logger(`currentYoutubeTranslationUrl: ${currentYoutubeTranslationUrl}`);
  logger(currentYoutubeZhTranslationUrl);
  if (
    currentYoutubeTranslationUrl.trim() === "" ||
    currentYoutubeZhTranslationUrl.trim() === ""
  ) {
    logger("No translation found");
    alert("请切换中英双语字母后再保存");
  } else {
    console.log("en", currentYoutubeTranslationUrl);
    console.log("zh", currentYoutubeZhTranslationUrl);
    const token = await getLoginToken();
    console.log({
      type: "subtitle",
      data: {
        enUrl: currentYoutubeTranslationUrl,
        enData: currentYoutubeTranslationData,
        zhUrl: currentYoutubeZhTranslationUrl,
        zhData: currentYoutubeZhTranslationData,
        videoId: getVideoId(),
        token,
        link: window.location.href,
        title: document.title,
      },
    });
    sendMessageToYoutubeVideoPage({
      type: "subtitle",
      data: {
        enUrl: currentYoutubeTranslationUrl,
        enData: currentYoutubeTranslationData,
        zhUrl: currentYoutubeZhTranslationUrl,
        zhData: currentYoutubeZhTranslationData,
        videoId: getVideoId(),
        token,
        link: window.location.href,
        title: document.title,
      },
    });
  }
}

function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("v");
}

function findYoutubeStylishReaderToolBarIcon() {
  return document.getElementById(youtubeStylishReaderIconId);
}

function createYoutubeStylishIconElement() {
  let divElement = document.createElement("div");
  divElement.id = youtubeStylishReaderIconId;
  divElement.classList = ["ytp-size-button ytp-button"];
  const innerDivElement = document.createElement("div");
  innerDivElement.style.height = "100%";
  innerDivElement.style.width = "100%";
  innerDivElement.style.display = "flex";
  innerDivElement.style.alignItems = "center";
  innerDivElement.style.justifyContent = "center";
  let imgElement = document.createElement("img");
  imgElement.src = browser.runtime.getURL("assets/stylish-reader-48.svg");
  imgElement.style.cursor = "pointer";
  imgElement.style.width = "24px";
  imgElement.style.height = "24px";
  imgElement.style.boxSizing = "border-box";
  imgElement.style.backgroundColor = "#05010d";
  imgElement.style.borderRadius = "5px";
  innerDivElement.append(imgElement);
  divElement.append(innerDivElement);
  return divElement;
}

function isCurrentSubtitleEnglish(url) {
  const u = new URL(url);

  return (
    (u.searchParams.get("lang") === "en" ||
      u.searchParams.get("lang") === "en-CA" ||
      u.searchParams.get("lang") === "en-GB" ||
      u.searchParams.get("lang") === "en-US") &&
    (u.searchParams.get("tlang") !== "zh-Hans" ||
      u.searchParams.get("tlang") === undefined)
  );
}

function isCurrentSubtitleChinese(url) {
  const u = new URL(url);

  return (
    u.searchParams.get("lang") === "zh" ||
    u.searchParams.get("tlang") === "zh-Hans"
  );
}

export function parseSubtitles(url, data) {
  if (isCurrentSubtitleEnglish(url)) {
    currentYoutubeTranslationUrl = url;
    currentYoutubeTranslationData = data;
    logger("English subtitle gotcha.");
    setEnglishTranscriptStatus(true);
  }
  if (isCurrentSubtitleChinese(url)) {
    currentYoutubeZhTranslationUrl = url;
    currentYoutubeZhTranslationData = data;
    logger("Chinese subtitle gotcha.");
    setChineseTranscriptStatus(true);
  }
}

function sendMessageToYoutubeVideoPage(message) {
  logger("sendMessageToYoutubeVideoPage");
  const event = new CustomEvent("fromYoutubeVideoContentScript", {
    detail: JSON.stringify(message),
    bubbles: true,
    composed: true,
  });
  document.dispatchEvent(event);
  currentYoutubeZhTranslationUrl = "";
  currentYoutubeTranslationUrl = "";
  setEnglishTranscriptStatus(false);
  setChineseTranscriptStatus(false);
}

export function registerReceiveMessageFromVideoPage() {
  document.addEventListener("fromYoutubeVideo", (event) => {});
}

export function injectYoutubeVideoVuePage() {
  if (isYoutubeVideoPageExist()) {
    return;
  }
  createYoutubeMiddlewareToShadowDom();
}

function isYoutubeVideoPageExist() {
  return document.getElementById(youtubeShadowRootId);
}

function waitForSeconds(millionSeconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, millionSeconds);
  });
}

function injectCssToShadowDom(cssFileUrl) {
  return new Promise((resolve) => {
    fetch(browser.runtime.getURL(cssFileUrl))
      .then((response) => response.text())
      .then((css) => resolve(css))
      .catch((error) => console.error("Error injecting CSS:", error));
  });
}

function injectJsToShadowDom(jsFileUrl) {
  return new Promise((resolve) => {
    fetch(browser.runtime.getURL(jsFileUrl))
      .then((response) => response.text())
      .then((js) => {
        resolve(js);
      });
  });
}

async function createYoutubeMiddlewareToShadowDom() {
  logger("createYoutubeMiddlewareToShadowDom");
  const shadowRoot = document.createElement("div");
  shadowRoot.id = youtubeShadowRootId;
  shadowRoot.style.display = "none";
  shadowRoot.style.boxSizing = "border-box";
  shadowRoot.style.borderRadius = "3px";
  shadowRoot.style.width = 1 + "px";
  shadowRoot.style.backgroundColor = "white";
  shadowRoot.style.boxShadow = "0 0 15px 5px grey";
  shadowRoot.style.position = "fixed";
  shadowRoot.style.right = 0;
  shadowRoot.style.left = 0;
  shadowRoot.style.zIndex = "11";
  const shadow = shadowRoot.attachShadow({ mode: "open" });

  // 创建挂载点
  const mountPoint = document.createElement("div");
  mountPoint.id = youtubeVuePageMountPoint;

  // 创建脚本挂载点
  const vueScript = document.createElement("script");

  // 创建样式挂载点
  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  const cssCode = await injectCssToShadowDom(
    "assets/css/youtube-transport-style.css"
  );
  styleElement.appendChild(document.createTextNode(cssCode));

  // 在shadow dom中添加挂载点
  shadow.appendChild(mountPoint);

  // 在shadow dom中添加脚本挂载点
  const jsCode = await injectJsToShadowDom("assets/js/youtube-transport.js");
  vueScript.textContent = jsCode;
  shadow.appendChild(vueScript);

  // 在shadow dom中添加样式挂载点
  shadow.appendChild(styleElement);

  // 添加到页面上
  document.body.appendChild(shadowRoot);

  // eval(vueScript.textContent);
}

async function selectChineseTranscriptAutomatically() {
  logger("Get transcript automatically.");
  const chromeBottom = document.querySelector(".ytp-chrome-bottom");
  const settingsButton = document.querySelector(
    "[data-tooltip-target-id='ytp-settings-button']"
  );
  const controlPanelOuter = document.getElementById("ytp-id-18");

  // 让控制栏显示
  chromeBottom.style.opacity = 1;
  // 点击设置图标，弹出Panel
  await waitForSeconds(500);
  settingsButton.click();
  await waitForSeconds(500);
  let controlPanelInner = controlPanelOuter.querySelector(".ytp-panel-menu");
  await waitForSeconds(500);
  controlPanelInner.childNodes.forEach((child) => {
    if (
      child.textContent.includes("字幕") ||
      child.textContent.includes("Subtitles")
    ) {
      child.click();
    }
  });
  await waitForSeconds(500);
  controlPanelInner = controlPanelOuter.querySelector(".ytp-panel-menu");
  await waitForSeconds(500);

  // 找出自动翻译这一选项，并点击
  // TODO: 这里需要考虑是英文环境时对应的自动翻译的英文是什么
  controlPanelInner.childNodes.forEach((child) => {
    if (
      child.textContent === "自动翻译" ||
      child.textContent === "Auto-translate"
    ) {
      child.click();
    }
  });
  // 获取到了所有自动翻译支持的语言列表，并找到中文（简体）选项，然后点击。

  await waitForSeconds(500);
  controlPanelInner = controlPanelOuter.querySelector(".ytp-panel-menu");
  controlPanelInner.childNodes.forEach((child) => {
    if (
      child.textContent === "中文（简体）" ||
      child.textContent === "Chinese (Simplified)"
    ) {
      child.click();
    }
  });
}

export function toggleSubtitleBtn() {
  const subtitleBtn = document.querySelector("[aria-keyshortcuts='c']");
  const value = subtitleBtn.getAttribute("aria-pressed");
  if (value === "false") {
    subtitleBtn.click();
  }
}

export function addTranscriptStatusElementIfNotExist() {
  const container = document.getElementById(transcriptStatusElementId);
  if (container) {
    return;
  }
  const youtubeContainer = document.getElementById("owner");
  if (youtubeContainer) {
    createTranscriptStatusElement();
  } else {
    return;
  }
}

export function setEnglishTranscriptStatus(active) {
  isEnglishTranscriptExist = active;
  console.log("set english background color", active);
  const element = document.getElementById(transcriptStatusEnglishElementId);
  element.style.backgroundColor = active
    ? activeStatusBackgroundColor
    : inActiveStatusBackgroundColor;
}

export function setChineseTranscriptStatus(active) {
  isChineseTranscriptExist = active;
  console.log("set Chinese background color", active);
  const element = document.getElementById(transcriptStatusChineseElementId);
  element.style.backgroundColor = active
    ? activeStatusBackgroundColor
    : inActiveStatusBackgroundColor;
}

function createTranscriptStatusElement() {
  const parentNode = document.getElementById("owner");
  const height = "30px";

  // 创建父容器 div
  const container = document.createElement("div");
  container.id = transcriptStatusElementId;
  container.style.height = height;
  container.style.width = "200px";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid #94a3b8";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
  container.style.gridTemplateRows = "1fr";
  container.style.alignItems = "center";
  container.style.textAlign = "center";
  container.style.userSelect = "none";
  container.style.marginLeft = "24px";

  // 创建第一个子 div
  const englishDiv = document.createElement("div");
  englishDiv.id = transcriptStatusEnglishElementId;
  englishDiv.textContent = "English";
  englishDiv.style.lineHeight = height;
  englishDiv.style.height = "100%";
  englishDiv.style.cursor = "not-allowed";
  // englishDiv.style.backgroundColor = inActiveStatusBackgroundColor;
  englishDiv.style.borderRight = "1px solid #64748b";
  englishDiv.style.cursor = "not-allowed";

  // 创建第二个子 div
  const chineseDiv = document.createElement("div");
  chineseDiv.id = transcriptStatusChineseElementId;
  chineseDiv.textContent = "中文";
  chineseDiv.style.lineHeight = height;
  chineseDiv.style.height = "100%";
  chineseDiv.style.cursor = "not-allowed";
  chineseDiv.style.borderRight = "1px solid #64748b";
  // chineseDiv.style.backgroundColor = inActiveStatusBackgroundColor;

  // 创建第三个 div
  const automationDiv = document.createElement("div");
  automationDiv.textContent = "Auto";
  automationDiv.style.lineHeight = height;
  automationDiv.style.height = "100%";
  automationDiv.style.borderRight = "1px solid #64748b";
  automationDiv.style.cursor = "pointer";

  // 创建第四个 div
  const addVideoDiv = document.createElement("div");
  addVideoDiv.textContent = "Add";
  addVideoDiv.style.lineHeight = height;
  addVideoDiv.style.height = "100%";
  addVideoDiv.style.cursor = "pointer";
  addVideoDiv.addEventListener("click", onClickStylishReaderIcon);

  // 将子 div 添加到父容器
  container.appendChild(englishDiv);
  container.appendChild(chineseDiv);
  container.appendChild(automationDiv);
  container.appendChild(addVideoDiv);

  automationDiv.addEventListener("click", selectChineseTranscriptAutomatically);

  // 将容器添加到parent中
  parentNode.appendChild(container);
  console.log("isEnglishTranscriptExist", isEnglishTranscriptExist);
  console.log("isChineseTranscriptExist", isChineseTranscriptExist);
  if (!isEnglishTranscriptExist) {
    setEnglishTranscriptStatus(false);
  } else {
    setEnglishTranscriptStatus(true);
  }
  if (!isChineseTranscriptExist) {
    setChineseTranscriptStatus(false);
  } else {
    setEnglishTranscriptStatus(true);
  }
}
