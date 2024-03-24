// TED 网站上的操作

import { pauseTedOfficialWebsiteVideo } from "../utils/controlTedOfficialWebsite";
import { fetchSharedLink } from "../utils/fetchData";
import { getTitleFromTedUrl } from "../utils/parseUrl";
import { sendMessageFromContentScriptToInjectedScript } from "./customEvent";
import { supportedLanguages } from "./fetchTranscript";
import { injectVideoVueScript } from "./injectJS";
import { showVideoPagePopup } from "./videoPage";

let hasCreatedVuePage = false;

const supportedDomains = ["www.ted.com"];

let videoElementIsValidInterval = null;

function getCurrentDomain() {
  let domain = "";
  let url = window.location.href;
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  domain = domain.split(":")[0];
  return domain;
}

async function sendDataToVuePage() {
  const title = getTitleFromTedUrl();
  const data = await fetchSharedLink(title);
  const highUrl = data.data.videos.nodes[0].nativeDownloads.high;
  console.log(data.data.videos.nodes[0].nativeDownloads.high);
  sendMessageFromContentScriptToInjectedScript({
    type: "update-video-source",
    videoUrl: highUrl,
  });
  sendMessageFromContentScriptToInjectedScript({
    type: "languages",
    supportedLanguages,
  });
}

function createStylishIconElement() {
  if (checkStylishIconLength() === 0) {
    let divElement = document.createElement("div");
    divElement.classList = [
      "media-subtitles-wrapper       flex       items-center       justify-center",
    ];
    divElement.style.paddingLeft = "8px";
    let imgElement = document.createElement("img");
    imgElement.className = "stylish-reader-icon";
    imgElement.src = browser.runtime.getURL("assets/stylish-reader-48.png");
    imgElement.style.cursor = "pointer";
    imgElement.style.width = "24px";
    imgElement.style.height = "24px";
    imgElement.style.marginLeft = "0.75rem";
    imgElement.style.marginRight = "0.75rem";
    imgElement.style.boxSizing = "border-box";
    imgElement.style.backgroundColor = "#05010d";
    imgElement.style.borderRadius = "5px";
    imgElement.addEventListener("click", () => {
      if (!hasCreatedVuePage) {
        injectVideoVueScript();
        hasCreatedVuePage = true;
      }
      if (hasCreatedVuePage) {
        showVideoPagePopup();
      }
      // 暂停原网站上的视频
      pauseTedOfficialWebsiteVideo();
      // 给Vue页面发送原始视频的链接
      setTimeout(() => {
        console.log("send data...");
        sendDataToVuePage();
      }, 2000);
    });
    divElement.append(imgElement);
    return divElement;
  } else {
    return null;
  }
}

function addStylishBarIconToToolBar() {
  if (checkStylishIconLength() === 0) {
    let tedMediaControlBar = document.getElementById("media-control-bar");
    if (tedMediaControlBar !== null) {
      clearInterval(videoElementIsValidInterval);

      const node = createStylishIconElement();
      if (node) {
        tedMediaControlBar?.appendChild(node);
      }
    }
  }
}

function checkStylishIconLength() {
  return document.querySelectorAll(".stylish-reader-icon").length;
}

setInterval(() => {
  if (checkStylishIconLength() === 0) {
    ted();
  }
}, 800);

export function ted() {
  if (supportedDomains.includes(getCurrentDomain())) {
    videoElementIsValidInterval = setInterval(() => {
      addStylishBarIconToToolBar();
    }, 300);
  }
}
