import { logger } from "../utils/utils";
import { youtubeStylishReaderIconId } from "./constants";

let currentYoutubeTranslationUrl = "";
let currentYoutubeTranslationData = "";

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

function onClickStylishReaderIcon(e) {
  logger(currentYoutubeTranslationUrl);
  console.log(currentYoutubeTranslationData);
  // TODO: 在这里把获取到的数据调用后端API，保存在数据库中
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
  currentYoutubeTranslationUrl = url;
  currentYoutubeTranslationData = data;
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
