import { getLoginToken } from "../entryPoint/utils/background.utils";
import { logger } from "../utils/utils";
import {
  youtubeStylishReaderIconId,
  youtubeVuePageMountPoint,
} from "./constants";

let currentYoutubeTranslationUrl = "";
let currentYoutubeZhTranslationUrl = "";
let currentYoutubeTranslationData = "";
let currentYoutubeZhTranslationData = "";

export function createYoutubeStylishReaderIcon() {
  //   const tt = document.querySelector(".ytp-chrome-bottom");
  //   tt.style.opacity = 1;
  if (findYoutubeStylishReaderToolBarIcon()) {
    return;
  }
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
    currentYoutubeTranslationUrl === "" ||
    currentYoutubeZhTranslationUrl === ""
  ) {
    logger("No translation found");
    return;
  }

  const token = await getLoginToken();
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
    },
  });
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

function parseSubtitles(url, data) {
  const u = new URL(url);
  logger(u.searchParams.get("lang"));
  if (u.searchParams.get("lang") === "en") {
    currentYoutubeTranslationUrl = url;
    currentYoutubeTranslationData = data;
  }
  if (
    u.searchParams.get("lang") === "zh" ||
    u.searchParams.get("tlang") === "zh-Hans"
  ) {
    currentYoutubeZhTranslationUrl = url;
    currentYoutubeZhTranslationData = data;
  }
}

export function registerEventListenerForBackendScript() {
  browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "youtube":
        parseSubtitles(message.url, message.data);
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

function createYoutubeVuePageMountPoint() {
  logger("createYoutubeVuePageMountPoint");
  const divElement = document.createElement("div");
  divElement.id = youtubeVuePageMountPoint;
  divElement.style.display = "block";
  document.body.appendChild(divElement);
}
