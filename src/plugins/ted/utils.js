// Ted 插件的工具函数

import {
  popupVideoVuePageMountPointId,
  tedMediaControlBarStylishReaderIconId,
} from "./constants";

export function findMediaControlBar() {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll("#media-control-bar");
    elements.forEach((element) => {
      if (!element.hasAttribute("slot")) {
        resolve(element);
      }
    });
  });
}

export function isStylishReaderMediaControlBarIconExist() {
  return document.getElementById(tedMediaControlBarStylishReaderIconId);
}

export function checkIfVideoPopupExist() {
  return document.getElementById(popupVideoVuePageMountPointId);
}
export function createVideoPagePopup() {
  const videoPagePopup = document.createElement("div");
  videoPagePopup.id = popupVideoVuePageMountPointId;
  videoPagePopup.style.position = "fixed";
  videoPagePopup.style.top = 0;
  videoPagePopup.style.left = 0;
  videoPagePopup.style.zIndex = "9999";
  videoPagePopup.style.width = "100%";
  videoPagePopup.style.height = "100%";
  document.body.appendChild(videoPagePopup);
}

export function showVideoPagePopup() {
  document.getElementById(popupVideoVuePageMountPointId).style.display =
    "block";
}

export function hideVideoPagePopup() {
  document.getElementById(popupVideoVuePageMountPointId).style.display = "none";
}

export function pauseTedOfficialWebsiteVideo() {
  const video = document.querySelector("video");
  if (video) {
    video.pause();
  }
}

export function sendMessageToBackground(type, message) {
  browser.runtime.sendMessage({ type, message });
}

export function fetchTranscript(url) {
  console.log(url);
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json", // 根据你的需求设置请求头
    },
    //   body: JSON.stringify({ key: "value" }), // 设置请求的 payload
  };
  return new Promise((resolve) => {
    fetch(url, requestOptions)
      .then((response) => {
        // 检查请求是否成功
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // 解析 JSON 格式的响应
        return response.json();
      })
      .then((data) => {
        // 在这里处理解析后的数据
        const subtitles = data.subtitles.filter(
          (item) => item.code == "en" || item.code == "zh-cn"
        );
        supportedLanguages = data.subtitles
          .filter((item) => item.code == "en" || item.code == "zh-cn")
          .reduce((acc, item) => {
            acc.push({ code: item.code });
            return acc;
          }, []);
        resolve(subtitles);
      })
      .catch((error) => {
        // 在这里处理请求失败的情况
        console.error("There was a problem with the fetch operation:", error);
      });
  });
}
