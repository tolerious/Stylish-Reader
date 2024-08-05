import { getLoginToken } from "../entryPoint/utils/background.utils";
import { logger } from "../utils/utils";
import {
  activeStatusBackgroundColor,
  inActiveStatusBackgroundColor,
  transcriptStatusChineseElementId,
  transcriptStatusElementId,
  transcriptStatusEnglishElementId,
  youtubeStylishReaderIconId,
  youtubeVuePageMountPoint,
} from "./constants";

let currentYoutubeTranslationUrl = "";
let currentYoutubeZhTranslationUrl = "";
let currentYoutubeTranslationData = "";
let currentYoutubeZhTranslationData = "";

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
    element.addEventListener("click", onClickStylishReaderIcon);
    toolBar.appendChild(element);
  }
}

async function onClickStylishReaderIcon(e) {
  logger(currentYoutubeTranslationUrl);
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

function parseSubtitles(url, data) {
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

export function registerEventListenerForBackendScript() {
  browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "youtube":
        parseSubtitles(message.url, message.data);
        break;
      case "urlChanged":
        setEnglishTranscriptStatus(false);
        setChineseTranscriptStatus(false);
        console.log("url changed, called from youtube content script");
        break;
      default:
        break;
    }
  });
}

function sendMessageToYoutubeVideoPage(message) {
  const event = new CustomEvent("fromYoutubeVideoContentScript", {
    detail: JSON.stringify(message),
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
  createYoutubeVuePageMountPoint();
}

function isYoutubeVideoPageExist() {
  return document.getElementById(youtubeVuePageMountPoint);
}

function waitForSeconds(millionSeconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, millionSeconds);
  });
}

function createYoutubeVuePageMountPoint() {
  logger("createYoutubeVuePageMountPoint");
  const divElement = document.createElement("div");
  divElement.id = youtubeVuePageMountPoint;
  divElement.style.display = "block";
  document.body.appendChild(divElement);
}

async function selectChineseTranscriptAutomatically() {
  logger("Get transcript automatically.");
  const chromeBottom = document.querySelector(".ytp-chrome-bottom");
  const settingsButton = document.querySelector(
    "[data-tooltip-target-id='ytp-settings-button']"
  );
  const controlPanelOuter = document.getElementById("ytp-id-18");
  let controlPanelInner = controlPanelOuter.querySelector(".ytp-panel-menu");

  // 让控制栏显示
  chromeBottom.style.opacity = 1;
  // 点击设置图标，弹出Panel
  console.log(settingsButton);
  await waitForSeconds(500);
  settingsButton.click();
  await waitForSeconds(500);
  const transcriptOptions = controlPanelInner.children[2];
  transcriptOptions.click();
  await waitForSeconds(500);
  controlPanelInner = controlPanelOuter.querySelector(".ytp-panel-menu");
  await waitForSeconds(500);

  console.log(controlPanelInner.children);
  // 找出自动翻译这一选项，并点击
  // TODO: 这里需要考虑是英文环境时对应的自动翻译的英文是什么
  controlPanelInner.childNodes.forEach((child) => {
    console.log(child.textContent);
    if (child.textContent === "自动翻译") {
      child.click();
    }
  });
  // 获取到了所有自动翻译支持的语言列表，并找到中文（简体）选项，然后点击。

  await waitForSeconds(500);
  controlPanelInner = controlPanelOuter.querySelector(".ytp-panel-menu");
  console.log(controlPanelInner.children);
  controlPanelInner.childNodes.forEach((child) => {
    if (child.textContent === "中文（简体）") {
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

export function filterYoutubeFloatingPanelData() {}

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

function setEnglishTranscriptStatus(active) {
  console.log("set english background", active);
  const element = document.getElementById(transcriptStatusEnglishElementId);
  element.style.backgroundColor = active
    ? activeStatusBackgroundColor
    : inActiveStatusBackgroundColor;
}

function setChineseTranscriptStatus(active) {
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
  container.style.width = "150px";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid #94a3b8";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr 1fr 1fr";
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
  englishDiv.style.backgroundColor = inActiveStatusBackgroundColor;
  englishDiv.style.borderRight = "1px solid #64748b";

  // 创建第二个子 div
  const chineseDiv = document.createElement("div");
  chineseDiv.id = transcriptStatusChineseElementId;
  chineseDiv.textContent = "中文";
  chineseDiv.style.lineHeight = height;
  chineseDiv.style.height = "100%";
  chineseDiv.style.backgroundColor = inActiveStatusBackgroundColor;

  // 创建第三个 div
  const automationDiv = document.createElement("div");
  automationDiv.textContent = "Auto";
  automationDiv.style.lineHeight = height;
  automationDiv.style.height = "100%";

  // 将子 div 添加到父容器
  container.appendChild(englishDiv);
  container.appendChild(chineseDiv);
  container.appendChild(automationDiv);

  automationDiv.addEventListener("click", selectChineseTranscriptAutomatically);

  // 将容器添加到parent中
  parentNode.appendChild(container);
}
